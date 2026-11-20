# Verificación de SentryBox v1

## Resultado de esta entrega (20 de noviembre de 2026)

- Seis pruebas automáticas aprobadas con `node --test`.
- Sintaxis de los módulos de JavaScript comprobada con `node --check`.
- El servidor local inició correctamente en el puerto 4173.
- La vista previa no pudo abrirse: el navegador devolvió un error de conexión y el entorno bloqueó la comprobación HTTP local. No se ha completado una revisión visual ni una prueba de interacción de extremo a extremo.
- No se han ejecutado Lighthouse o axe ni se han realizado pruebas con participantes. Las comprobaciones manuales que siguen son tareas pendientes, no resultados obtenidos.

## Pruebas automáticas

Ejecutar `npm test`: montos y decimales, fechas reales y futuras, categorías compatibles, datos JSON, identificadores únicos, saldos negativos, búsqueda y filtros combinados, y protección básica de celdas CSV.

## Recorrido manual para revisar la aplicación

1. Abrir el resumen: aparecen los 18 movimientos ficticios en noviembre de 2026. Comparar ingresos, gastos y saldo con el JSON.
2. Registrar «Venta de prueba», ingreso, S/ 25,50, fecha de hoy, Ventas, Yape. Verificar el aviso y el incremento de S/ 25,50 en ingresos y saldo del mes correspondiente.
3. En el historial, buscar «Venta de prueba». Editarla a S/ 30 y comprobar que el incremento neto adicional sea S/ 4,50.
4. Recargar la página. Confirmar que se conservan los cambios.
5. Eliminar el registro: primero cancelar y comprobar que sigue; después confirmar y comprobar que desaparece y se actualiza el resumen.
6. Intentar guardar vacío, con monto cero/negativo, tres decimales y fecha futura. Deben aparecer mensajes comprensibles y el foco debe llegar al primer campo inválido.
7. Cambiar entre ingreso y gasto. Las categorías deben corresponder al tipo seleccionado.
8. Combinar búsqueda, tipo, medio y fechas. Probar un rango de fechas invertido y uno sin coincidencias; limpiar filtros.
9. Exportar CSV con un filtro. Abrirlo y verificar que incluya solo los resultados visibles y mantenga tildes y decimales.
10. Elegir un mes sin movimientos. Comprobar ceros y el mensaje vacío.
11. Revisar a 390 px, 768 px y 1440 px. La página no debe desbordarse; las tablas pueden desplazarse dentro de su contenedor.
12. Usar Tab, Shift+Tab, Enter y Escape. Revisar el enlace de salto, navegación, formulario, tabla, botones y diálogo.

