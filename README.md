# Sazón & Raíz · Restaurant OS

Frontend para un restaurante peruano, desarrollado con Angular 20, componentes standalone, Signals, formularios y SCSS. Incluye pedidos de mesa y un flujo de delivery para clientes, restaurante y motorizados.

## Iniciar

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
npm start
```

Abre `http://localhost:4200`. Por ahora no hay inicio de sesión: la aplicación entra directamente al panel principal.

El botón con el icono de luna o sol cambia entre tema claro y oscuro. Está disponible en el panel administrativo, el menú público y la vista del motorizado; la preferencia se conserva en el navegador.

## Delivery

1. El cliente entra a `/ordenar`, elige platos disponibles, indica sus datos y dirección, y confirma el pedido.
2. En `/ordenar/confirmacion/:id` puede revisar el resumen y el estado de su pedido.
3. El restaurante gestiona los pedidos en `/delivery`: inicia la preparación, marca el pedido listo, asigna un motorizado disponible y lo despacha.
4. El motorizado abre `/motorizado`, selecciona su nombre, consulta las entregas asignadas y marca el pedido como entregado después del despacho.

El costo de envío se calcula según el distrito elegido y se incluye en el total. Las direcciones de cobertura y sus tarifas de ejemplo están definidas en `src/app/features/customer-order.ts`.

## Pantallas

| Ruta | Función |
| --- | --- |
| `/dashboard` | Indicadores, gráficos, platos más vendidos y pedidos recientes |
| `/pedidos` | Pedidos de mesa y delivery con búsqueda, filtros, ordenamiento y paginación |
| `/pedidos/nuevo`, `/pedidos/:id` | Creación y seguimiento de pedidos de mesa |
| `/ordenar`, `/ordenar/confirmacion/:id` | Menú público, carrito, datos de entrega y seguimiento del cliente |
| `/delivery`, `/delivery/:id` | Gestión de cocina, asignación, despacho y entrega |
| `/motorizado` | Vista de entregas del motorizado |
| `/mesas` | Plano visual, filtros y estados de mesa |
| `/catalogo`, `/catalogo/nuevo`, `/catalogo/:id/editar` | Gestión de platos y disponibilidad |
| `/categorias` | Gestión de categorías |
| `/usuarios`, `/usuarios/nuevo`, `/usuarios/:id/editar` | Gestión de personal, incluido el rol Motorizado |
| `/configuracion`, `/perfil` | Configuración del restaurante y perfil de demostración |

`/login` redirige al dashboard. Las rutas desconocidas muestran una página 404.

## Datos y futura API

El estado está en `src/app/core/store.ts`. Los datos de demostración y los cambios se guardan en `localStorage`. Esto permite probar el flujo completo en **el mismo navegador y origen**. Todavía no hay sincronización entre dispositivos, notificaciones reales, pagos ni control de acceso. Para recibir pedidos de clientes y motorizados en dispositivos diferentes hay que conectar el frontend a un backend, por ejemplo la API de Laravel prevista en `src/environments/environment.ts`.

## Verificación

```bash
npm run build
npm test -- --watch=false
```

La interfaz adapta el menú, carrito, formularios, listas y panel de reparto a pantallas pequeñas.

## Publicar en Vercel

El repositorio tiene el proyecto Angular en su raíz. Importa `ArnoldAl567/SISTEMA-WEB-RESTAURANTE` desde Vercel y deja **Root Directory** en la raíz. `vercel.json` fija el comando de compilación, la carpeta `dist/SISTEMA_WEB_RESTAURANTE_FRONT/browser` y la redirección interna de rutas de Angular, así que no necesitas cambiar esos valores a mano.

Cada push a la rama principal podrá generar un despliegue mediante la integración Git de Vercel. Los pedidos siguen siendo datos de demostración guardados en `localStorage`: publicar este frontend no sincroniza pedidos entre dispositivos ni añade autenticación. Para usar el delivery de manera real se necesita conectar una API y una base de datos.
