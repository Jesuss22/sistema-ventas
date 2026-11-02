# Pruebas manuales

## Preparación

1. Ejecutar `schema.sql` en MySQL.
2. Configurar `backend/.env`.
3. Iniciar el backend con `npm start`.
4. Crear un usuario administrador y ejecutar `npm run seed:demo --prefix backend`.

La semilla carga 12 productos, 8 clientes y 5 ventas, y es idempotente.

Para una instalación demo local puede usarse `admin@tienda.com` con `Admin1234`; cambia esta contraseña antes de publicar el sistema.

## Flujo funcional

| Caso | Pasos | Resultado esperado |
|---|---|---|
| Inicio de sesión | Abrir `/`, ingresar credenciales válidas | Redirección a productos y sesión activa |
| Inventario | Abrir Productos y buscar `DEMO-001` | Se muestran los productos demo y alertas de stock |
| Clientes | Abrir Clientes y filtrar por `Rosa` | Se muestra el cliente demo |
| Venta | Abrir Punto de venta, añadir productos y cobrar | Se registra la venta y se descuenta stock |
| Reportes | Abrir Reportes y cambiar el periodo | KPIs, ranking, poco stock y ventas recientes |

## Seguridad

- Sin token, `/api/productos` responde `401`.
- Tras cinco credenciales incorrectas dentro de 15 minutos, login responde `429`.
- Un error interno responde `500` con `Error interno del servidor` y un `id`, sin mostrar mensajes de MySQL.
