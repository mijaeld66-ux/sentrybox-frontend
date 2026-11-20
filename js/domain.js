export const CATEGORIES = { ingreso: ['Ventas', 'Otros ingresos'], gasto: ['Mercadería', 'Servicios', 'Alquiler', 'Transporte', 'Otros gastos'] };
export const PAYMENTS = ['Efectivo', 'Yape', 'Plin', 'Transferencia'];
export function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function parseCents(value) {
  const s = String(value).trim();
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(s)) return null;
  const [whole, fraction=''] = s.replace(',', '.').split('.');
  return Number(whole)*100 + Number(fraction.padEnd(2,'0'));
}
export function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s+'T12:00:00Z').toISOString().slice(0,10) === s; }
export function validate(raw, maxDate = today()) {
  const errors = {};
  if (!raw.description?.trim() || raw.description.trim().length < 3 || raw.description.trim().length > 100) errors.description = 'Escribe una descripción de entre 3 y 100 caracteres.';
  const cents = parseCents(raw.amount);
  if (cents === null || cents <= 0 || cents > 100000000) errors.amount = 'Ingresa un monto mayor que 0 y hasta S/ 1 000 000, con máximo dos decimales.';
  if (!validDate(raw.date) || raw.date > maxDate) errors.date = 'Selecciona una fecha válida que no sea futura.';
  if (!CATEGORIES[raw.type]?.includes(raw.category)) errors.category = 'Selecciona una categoría para este tipo de movimiento.';
  if (!PAYMENTS.includes(raw.payment)) errors.payment = 'Selecciona un medio de pago.';
  return { errors, value: { type: raw.type, description: raw.description?.trim(), cents, date: raw.date, category: raw.category, payment: raw.payment } };
}
export function isMovement(m) { return m && typeof m.id === 'string' && m.id.length > 0 && Number.isSafeInteger(m.cents) && m.cents > 0 && m.cents <= 100000000 && validDate(m.date) && typeof m.description === 'string' && m.description.trim().length >= 3 && m.description.length <= 100 && CATEGORIES[m.type]?.includes(m.category) && PAYMENTS.includes(m.payment); }
export function totals(rows) { return rows.reduce((a,m) => { a[m.type] += m.cents; a.saldo = a.ingreso-a.gasto; return a; }, { ingreso:0, gasto:0, saldo:0 }); }
export function filterRows(rows, { search='', type='', payment='', from='', to='' } = {}) {
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return rows.filter(m => (!type || m.type===type) && (!payment || m.payment===payment) && (!from || m.date>=from) && (!to || m.date<=to) && normalize(m.description+' '+m.category).includes(normalize(search.trim()))).sort((a,b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
export function csvCell(value) { const s = String(value); return '"'+ (/^[=+\-@\t\r\n]/.test(s) ? "'"+s : s).replaceAll('"','""') +'"'; }
