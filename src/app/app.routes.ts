import { Routes } from '@angular/router';
import { AppLayout } from './shared/layout';
export const routes:Routes=[
  {path:'login',redirectTo:'dashboard',pathMatch:'full'},
  {path:'ordenar',loadComponent:()=>import('./features/customer-order').then(m=>m.CustomerOrderPage),title:'Pide delivery'},
  {path:'ordenar/confirmacion/:id',loadComponent:()=>import('./features/customer-confirmation').then(m=>m.CustomerConfirmationPage),title:'Pedido recibido'},
  {path:'motorizado',loadComponent:()=>import('./features/driver').then(m=>m.DriverPage),title:'Mis entregas'},
  {path:'',component:AppLayout,children:[
    {path:'',pathMatch:'full',redirectTo:'dashboard'},
    {path:'dashboard',loadComponent:()=>import('./features/dashboard').then(m=>m.DashboardPage),title:'Dashboard'},
    {path:'pedidos',loadComponent:()=>import('./features/orders').then(m=>m.OrdersPage),title:'Pedidos'},
    {path:'pedidos/nuevo',loadComponent:()=>import('./features/order-editor').then(m=>m.OrderEditorPage),title:'Nuevo pedido'},
    {path:'pedidos/:id',loadComponent:()=>import('./features/order-detail').then(m=>m.OrderDetailPage),title:'Detalle de pedido'},
    {path:'delivery',loadComponent:()=>import('./features/delivery').then(m=>m.DeliveryPage),title:'Delivery'},
    {path:'delivery/:id',loadComponent:()=>import('./features/delivery-detail').then(m=>m.DeliveryDetailPage),title:'Detalle de delivery'},
    {path:'mesas',loadComponent:()=>import('./features/tables').then(m=>m.TablesPage),title:'Mesas'},
    {path:'catalogo',loadComponent:()=>import('./features/catalog').then(m=>m.CatalogPage),title:'Catálogo'},
    {path:'catalogo/nuevo',loadComponent:()=>import('./features/dish-editor').then(m=>m.DishEditorPage),title:'Nuevo plato'},
    {path:'catalogo/:id/editar',loadComponent:()=>import('./features/dish-editor').then(m=>m.DishEditorPage),title:'Editar plato'},
    {path:'categorias',loadComponent:()=>import('./features/categories').then(m=>m.CategoriesPage),title:'Categorías'},
    {path:'usuarios',loadComponent:()=>import('./features/users').then(m=>m.UsersPage),title:'Usuarios'},
    {path:'usuarios/nuevo',loadComponent:()=>import('./features/user-editor').then(m=>m.UserEditorPage),title:'Nuevo usuario'},
    {path:'usuarios/:id/editar',loadComponent:()=>import('./features/user-editor').then(m=>m.UserEditorPage),title:'Editar usuario'},
    {path:'configuracion',loadComponent:()=>import('./features/settings').then(m=>m.SettingsPage),title:'Configuración'},
    {path:'perfil',loadComponent:()=>import('./features/profile').then(m=>m.ProfilePage),title:'Mi perfil'},
  ]},
  {path:'**',loadComponent:()=>import('./features/not-found').then(m=>m.NotFoundPage)}
];
