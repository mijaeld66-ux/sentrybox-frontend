import { CATEGORIES, PAYMENTS, today, validate, isMovement, totals, filterRows, csvCell } from './domain.js';
const $ = s => document.querySelector(s);
const money = cents => new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN' }).format(cents/100);
const dateLabel = date => new Intl.DateTimeFormat('es-PE',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00'));
const STORE = 'sentrybox.v1.movements';
let movements = [], editingId = null, deletingId = null, ready = false, toastTimer;
function node(tag, text, className) { const e=document.createElement(tag); if(text!==undefined)e.textContent=text; if(className)e.className=className; return e; }
function toast(text) { const e=$('#toast'); e.textContent=text; e.hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>e.hidden=true,5000); }
function persist() { try { localStorage.setItem(STORE,JSON.stringify({ version:1, movements })); $('#storage-warning').hidden=true; } catch { $('#storage-warning').hidden=false; } }
function setCategories(selected='') { const select=$('#category'); select.replaceChildren(new Option('Selecciona una categoría','')); const type=$('input[name="type"]:checked').value; for(const c of CATEGORIES[type]) select.add(new Option(c,c)); select.value=selected; }
function clearErrors() { for(const key of ['description','amount','date','category','payment']) { $('#'+key).removeAttribute('aria-invalid'); $('#'+key+'-error').textContent=''; } $('#form-errors').hidden=true; }
function resetForm() { editingId=null; $('#form-title').textContent='Registrar movimiento'; $('#save-button').textContent='Guardar movimiento'; $('#cancel-edit').hidden=true; clearErrors(); setCategories(); $('#date').value=today(); $('#date').max=today(); }
function route(focus=false) {
  const key=location.hash.slice(1); const active=['resumen','registro','historial'].includes(key)?key:'resumen';
  for(const view of document.querySelectorAll('.view')) view.hidden=view.id!==active;
  for(const a of document.querySelectorAll('[data-nav]')) { if(a.dataset.nav===active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); }
  document.title=`${({resumen:'Resumen',registro:'Registrar movimiento',historial:'Historial'})[active]} · SentryBox`;
  if(focus) { const heading=$('#'+active+' h1'); heading.tabIndex=-1; heading.focus({preventScroll:true}); window.scrollTo({top:0}); }
}
function emptyState(container, title, text, link=false) { const e=node('div',undefined,'empty'); e.append(node('strong',title),node('p',text)); if(link){const a=node('a','Registrar movimiento','button primary');a.href='#registro';e.append(a);} container.append(e); }
function drawTable(container, rows, actions=false) {
  container.replaceChildren();
  if(!rows.length) return emptyState(container,'Todavía no hay movimientos aquí','Registra un movimiento o cambia los filtros para ver resultados.',true);
  const scroll=node('div',undefined,'table-scroll'); scroll.tabIndex=0; scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Tabla de movimientos; desplaza horizontalmente para ver todas las columnas');
  const table=node('table');table.append(node('caption',actions?'Historial de movimientos registrados':'Últimos movimientos del periodo'));
  const head=node('thead'),headRow=node('tr');
  for(const title of ['Movimiento','Fecha','Medio de pago','Tipo','Monto',...(actions?['Acciones']:[])]) {const th=node('th',title);th.scope='col'; if(title==='Monto')th.className='amount-cell';headRow.append(th);} head.append(headRow);table.append(head);
  const body=node('tbody');
  for(const m of rows) {
    const tr=node('tr');const description=node('td',m.description,'description-cell');description.append(node('small',m.category));
    const type=node('td');type.append(node('span',m.type==='ingreso'?'Ingreso':'Gasto','badge '+m.type));
    tr.append(description,node('td',dateLabel(m.date)),node('td',m.payment),type,node('td',(m.type==='ingreso'?'+ ':'− ')+money(m.cents),'amount-cell '+m.type));
    if(actions){const td=node('td');const buttons=node('div',undefined,'row-actions');for(const [action,label] of [['edit','Editar'],['delete','Eliminar']]){const b=node('button',label,action);b.type='button';b.dataset.action=action;b.dataset.id=m.id;b.setAttribute('aria-label',`${label}: ${m.description}, ${dateLabel(m.date)}, ${money(m.cents)}`);buttons.append(b);}td.append(buttons);tr.append(td);}
    body.append(tr);
  }
  table.append(body);scroll.append(table);container.append(scroll);
}
function renderChart(rows) {
  const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 600 245');svg.setAttribute('role','img');
  const weeks=Array.from({length:5},()=>({ingreso:0,gasto:0}));for(const m of rows)weeks[Math.floor((Number(m.date.slice(8))-1)/7)][m.type]+=m.cents;
  const max=Math.max(...weeks.flatMap(w=>[w.ingreso,w.gasto]),10000);const scale=Math.ceil(max/50000)*50000;
  const desc=document.createElementNS(ns,'title');desc.textContent='Caja por semana. '+weeks.map((w,i)=>`Semana ${i+1}: ingresos ${money(w.ingreso)}, gastos ${money(w.gasto)}`).join('. ');svg.append(desc);
  const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text)e.textContent=text;svg.append(e);return e;};
  for(let i=0;i<=4;i++){const y=20+i*46;add('line',{x1:67,x2:586,y1:y,y2:y,stroke:'#d7e4f0','stroke-dasharray':'3 4'});add('text',{x:57,y:y+4,'text-anchor':'end',fill:'#50657d','font-size':11},'S/ '+Math.round(scale*(4-i)/4/100));}
  weeks.forEach((w,i)=>{const x=99+i*100;for(const [j,key]of ['ingreso','gasto'].entries()){const height=w[key]/scale*184;add('rect',{x:x+j*25,y:204-height,width:19,height,rx:4,class:key==='ingreso'?'chart-income':'chart-expense'});}add('text',{x:x+22,y:230,'text-anchor':'middle',fill:'#50657d','font-size':12},'Sem. '+(i+1));});
  $('#chart').replaceChildren(svg);
}
function renderPayments(rows) { const target=$('#payment-breakdown');target.replaceChildren();const income=rows.filter(m=>m.type==='ingreso');const all=income.reduce((s,m)=>s+m.cents,0); for(const payment of PAYMENTS){const total=income.filter(m=>m.payment===payment).reduce((s,m)=>s+m.cents,0); const row=node('div',undefined,'payment-row'),title=node('div',undefined,'payment-title'),label=node('span');label.append(node('i',payment.charAt(0),'payment-icon '+payment.toLowerCase()),document.createTextNode(payment));title.append(label,node('strong',money(total)));const track=node('div',undefined,'track');track.setAttribute('aria-hidden','true');const bar=node('div');bar.style.width=(all?total/all*100:0)+'%';track.append(bar);row.append(title,track);target.append(row);} }
function currentFilters(){return{search:$('#search').value,type:$('#filter-type').value,payment:$('#filter-payment').value,from:$('#from-date').value,to:$('#to-date').value};}
function historyRows(){const filters=currentFilters();return filters.from&&filters.to&&filters.from>filters.to?[]:filterRows(movements,filters);}
function renderHistory(){const filters=currentFilters();$('#range-error').hidden=!(filters.from&&filters.to&&filters.from>filters.to);const rows=historyRows();const t=totals(rows);$('#result-count').textContent=`${rows.length} de ${movements.length} movimientos · Saldo filtrado: ${money(t.saldo)}`;drawTable($('#history-table'),rows,true);$('#export').disabled=!rows.length;}
function render(){if(!$('#month').value)$('#month').value=today().slice(0,7);const month=$('#month').value;const rows=filterRows(movements).filter(m=>m.date.startsWith(month));const t=totals(rows);$('#income-total').textContent=money(t.ingreso);$('#expense-total').textContent=money(t.gasto);$('#balance-total').textContent=money(t.saldo);renderChart(rows);renderPayments(rows);drawTable($('#recent-table'),rows.slice(0,5));renderHistory();}
async function load(){
  $('#loading').hidden=false;$('#retry').disabled=true;let cached=null;
  try {const s=localStorage.getItem(STORE);if(s!==null){const parsed=JSON.parse(s);if(parsed.version!==1||!Array.isArray(parsed.movements)||!parsed.movements.every(isMovement)||new Set(parsed.movements.map(m=>m.id)).size!==parsed.movements.length)throw Error('Invalid saved data');cached=parsed.movements;}}catch{$('#storage-warning').hidden=false;$('#storage-warning').textContent='No pudimos leer los registros guardados. No se sobrescribirán automáticamente; revisa tu navegador antes de registrar nuevos movimientos.';}
  if(cached!==null){movements=cached;$('#load-error').hidden=true;}else{
    try{const response=await fetch('data/movements.json',{cache:'no-store'});if(!response.ok)throw Error('HTTP');const data=await response.json();if(!Array.isArray(data.movements)||!data.movements.every(isMovement))throw Error('Invalid JSON');movements=data.movements;$('#load-error').hidden=true;}
    catch{movements=[];$('#load-error').hidden=false;}
  }
  const latest=movements.reduce((s,m)=>m.date>s?m.date:s,'');$('#month').value=latest?latest.slice(0,7):today().slice(0,7);ready=true;$('#loading').hidden=true;$('#retry').disabled=false;render();
}
$('#movement-form').addEventListener('submit',event=>{
  event.preventDefault();if(!ready)return;clearErrors();const result=validate(Object.fromEntries(new FormData(event.currentTarget)));
  if(Object.keys(result.errors).length){for(const [key,message]of Object.entries(result.errors)){$('#'+key).setAttribute('aria-invalid','true');$('#'+key+'-error').textContent=message;}$('#form-errors').hidden=false;$('#'+Object.keys(result.errors)[0]).focus();return;}
  const isEdit=editingId!==null;const movement={...result.value,id:editingId||crypto.randomUUID()};if(isEdit)movements=movements.map(m=>m.id===editingId?movement:m);else movements.push(movement);persist();$('#month').value=movement.date.slice(0,7);event.currentTarget.reset();render();location.hash='resumen';toast(isEdit?'Movimiento actualizado.':'Movimiento guardado.');
});
$('#movement-form').addEventListener('reset',()=>queueMicrotask(resetForm));
document.querySelectorAll('input[name="type"]').forEach(r=>r.addEventListener('change',()=>{setCategories();$('#category-error').textContent='';$('#category').removeAttribute('aria-invalid');}));
$('#cancel-edit').addEventListener('click',()=>{$('#movement-form').reset();location.hash='historial';});
$('#history-table').addEventListener('click',event=>{const button=event.target.closest('button[data-id]');if(!button)return;const m=movements.find(x=>x.id===button.dataset.id);if(!m)return;
  if(button.dataset.action==='edit'){$('#movement-form').reset();queueMicrotask(()=>{editingId=m.id;$(`input[name="type"][value="${m.type}"]`).checked=true;setCategories(m.category);for(const key of ['description','date','payment'])$('#'+key).value=m[key];$('#amount').value=(m.cents/100).toFixed(2);$('#form-title').textContent='Editar movimiento';$('#save-button').textContent='Guardar cambios';$('#cancel-edit').hidden=false;location.hash='registro';$('#description').focus();});}
  else{deletingId=m.id;$('#delete-description').textContent=`${m.description} · ${money(m.cents)} · ${dateLabel(m.date)}`;$('#delete-dialog').showModal();$('#keep-movement').focus();}
});
$('#keep-movement').addEventListener('click',()=>$('#delete-dialog').close());
$('#confirm-delete').addEventListener('click',()=>{movements=movements.filter(m=>m.id!==deletingId);persist();$('#delete-dialog').close();deletingId=null;render();const h=$('#history-title');h.tabIndex=-1;h.focus();toast('Movimiento eliminado.');});
$('#month').addEventListener('change',render);
for(const id of ['search','filter-type','filter-payment','from-date','to-date'])$('#'+id).addEventListener('input',renderHistory);
$('#clear-filters').addEventListener('click',()=>{for(const id of ['search','filter-type','filter-payment','from-date','to-date'])$('#'+id).value='';renderHistory();});
$('#export').addEventListener('click',()=>{const rows=historyRows();if(!rows.length)return;const csv=[['Fecha','Tipo','Descripción','Categoría','Medio de pago','Monto S/'],...rows.map(m=>[m.date,m.type,m.description,m.category,m.payment,(m.cents/100).toFixed(2)])].map(row=>row.map(csvCell).join(';')).join('\r\n');const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=node('a');a.href=url;a.download='sentrybox-movimientos-'+today()+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Se exportaron los movimientos que coinciden con tus filtros.');});
$('#retry').addEventListener('click',load);window.addEventListener('hashchange',()=>route(true));
window.addEventListener('storage',event=>{if(event.key===STORE){try{const data=JSON.parse(event.newValue);if(data?.version===1&&Array.isArray(data.movements)&&data.movements.every(isMovement)){movements=data.movements;render();toast('Los registros se actualizaron desde otra pestaña.');}}catch{}}});
resetForm();route();load();
