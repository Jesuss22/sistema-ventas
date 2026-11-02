# Sistema de Ventas

Aplicación web de inventario, clientes, punto de venta y reportes con frontend estático, Express y MySQL.

## Puesta en marcha

1. Crear la base de datos ejecutando [`schema.sql`](./schema.sql).
2. Copiar [`backend/.env.example`](./backend/.env.example) como `backend/.env`.
3. Configurar las credenciales de MySQL y generar un `JWT_SECRET` aleatorio de al menos 32 caracteres.
4. Instalar dependencias: `npm install --prefix backend`.
5. Crear un usuario administrador mediante `POST /api/auth/registrar` (el endpoint requiere un administrador existente; para el primero, insertar un hash bcrypt en `usuarios`).
6. Cargar los datos demo: `npm run seed:demo --prefix backend`.
7. Iniciar: `npm start`.

El sistema queda disponible en `http://localhost:3000`. Las pruebas manuales y credenciales de demostración se documentan en [`docs/pruebas.md`](./docs/pruebas.md).

## Módulos de gestión

El menú incluye ahora Dashboard de Inicio, Productos, Clientes, Punto de venta,
Proveedores / Compras, Caja, Reportes y Usuarios. El menú se genera desde
[`frontend/js/menu.js`](./frontend/js/menu.js), por lo que las pantallas
comparten navegación y estado activo sin duplicar esa lógica.

El esquema incorpora `proveedores`, `compras`, `detalle_compra`, `cajas` y
`movimientos_caja`. Las pantallas iniciales de proveedores, caja y usuarios
están preparadas como base visual; sus endpoints CRUD pueden implementarse
sobre esas tablas sin alterar ventas ni inventario.

## Capturas

- [Productos](./capturas/productos.png)
- [Clientes](./capturas/clientes.png)
- [Punto de venta](./capturas/ventas.png)
- [Reportes](./capturas/reportes.png)
- [Mi cuenta](./capturas/cuenta.png)

## Seguridad

- El login está limitado a 5 intentos fallidos por IP cada 15 minutos.
- JWT exige un secreto configurado y no acepta el valor de ejemplo.
- CORS se restringe a `CORS_ORIGINS`.
- Los errores 500 devuelven un mensaje genérico y un identificador para correlacionar el registro interno.
