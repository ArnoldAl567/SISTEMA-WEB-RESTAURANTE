import { Injectable, computed, inject, signal } from '@angular/core';
import Swal from 'sweetalert2';
import { AppNotification, Category, DeliveryDetails, Dish, Order, OrderStatus, RestaurantSettings, RestaurantTable, User, orderTotal } from './models';
import { seedCategories, seedDeliveryOrders, seedDishes, seedNotifications, seedOrders, seedSettings, seedTables, seedUsers } from './mock-data';

function stored<T>(key:string, fallback:T):T {
  try { const value=localStorage.getItem(`sazon-${key}`); return value?JSON.parse(value) as T:fallback; } catch { return fallback; }
}
function save<T>(key:string,value:T) { try { localStorage.setItem(`sazon-${key}`,JSON.stringify(value)); } catch { /* Storage can be disabled. */ } }
function loadDishes():Dish[]{return stored<Dish[]>('dishes',seedDishes).map(d=>{const current=seedDishes.find(seed=>seed.id===d.id);return current?.image.includes('images.pexels.com')&&(d.image.includes('images.unsplash.com')||d.image.includes('/6763275/'))&&d.createdAt==='2026-09-01T10:00:00'?{...d,image:current.image}:d;});}
function loadOrders():Order[]{const list=stored<Order[]>('orders',seedOrders);return [...seedDeliveryOrders.filter(seed=>!list.some(order=>order.id===seed.id)),...list.map(order=>({...order,channel:order.channel??'mesa'}))];}
function loadUsers():User[]{const raw=stored<(User&{password?:string})[]>('users',seedUsers);const list=raw.map(({password,...user})=>user);const users=[...list,...seedUsers.filter(user=>user.role==='Motorizado'&&!list.some(saved=>saved.email===user.email))];if(raw.some(user=>user.password))save('users',users);return users;}
export function toast(title:string,icon:'success'|'error'|'info'='success') {
  void Swal.fire({toast:true,position:'top-end',icon,title,showConfirmButton:false,timer:2900,timerProgressBar:true,customClass:{popup:'app-toast'}});
}
export async function confirmDelete(title:string,description='Esta acción no se puede deshacer.'):Promise<boolean> {
  const result=await Swal.fire({title,text:description,icon:'warning',showCancelButton:true,confirmButtonText:'Eliminar',cancelButtonText:'Cancelar',confirmButtonColor:'#c2410c',reverseButtons:true});
  return result.isConfirmed;
}

@Injectable({providedIn:'root'})
export class RestaurantStore {
  readonly categories=signal<Category[]>(stored('categories',seedCategories));
  readonly dishes=signal<Dish[]>(loadDishes());
  readonly orders=signal<Order[]>(loadOrders());
  readonly tables=signal<RestaurantTable[]>(stored('tables',seedTables));
  readonly users=signal<User[]>(loadUsers());
  readonly notifications=signal<AppNotification[]>(stored('notifications',seedNotifications));
  readonly settings=signal<RestaurantSettings>(stored('settings',seedSettings));
  readonly unread=computed(()=>this.notifications().filter(n=>!n.read).length);
  readonly recentOrders=computed(()=>[...this.orders()].sort((a,b)=>b.id-a.id).slice(0,6));
  readonly topDishes=computed(()=>this.dishes().slice(0,4).map((dish,i)=>({...dish,sold:[85,72,65,48][i]})));
  constructor() {
    if (typeof window !== 'undefined') window.addEventListener('storage', event => {
      if (event.key === 'sazon-orders') this.orders.set(loadOrders());
      if (event.key === 'sazon-users') this.users.set(loadUsers());
      if (event.key === 'sazon-notifications') this.notifications.set(stored('notifications',seedNotifications));
      if (event.key === 'sazon-dishes') this.dishes.set(loadDishes());
      if (event.key === 'sazon-categories') this.categories.set(stored('categories',seedCategories));
      if (event.key === 'sazon-settings') this.settings.set(stored('settings',seedSettings));
    });
  }
  upsertDish(data:Omit<Dish,'id'|'createdAt'>,id?:number) { const list=this.dishes(); const dish:Dish={...data,id:id??Math.max(0,...list.map(d=>d.id))+1,createdAt:id?list.find(d=>d.id===id)?.createdAt??new Date().toISOString():new Date().toISOString()}; this.dishes.set(id?list.map(d=>d.id===id?dish:d):[dish,...list]);save('dishes',this.dishes()); }
  deleteDish(id:number) { this.dishes.update(list=>list.filter(d=>d.id!==id));save('dishes',this.dishes()); }
  toggleDish(id:number) { this.dishes.update(list=>list.map(d=>d.id===id?{...d,available:!d.available}:d));save('dishes',this.dishes()); }
  upsertCategory(data:Omit<Category,'id'>,id?:number) { const list=this.categories();const item={...data,id:id??Math.max(0,...list.map(c=>c.id))+1};this.categories.set(id?list.map(c=>c.id===id?item:c):[...list,item]);save('categories',this.categories()); }
  deleteCategory(id:number) {this.categories.update(list=>list.filter(c=>c.id!==id));save('categories',this.categories());}
  upsertUser(data:Omit<User,'id'|'lastAccess'>,id?:number) {const list=this.users();const item:User={...data,id:id??Math.max(0,...list.map(u=>u.id))+1,lastAccess:id?list.find(u=>u.id===id)?.lastAccess??new Date().toISOString():new Date().toISOString()};this.users.set(id?list.map(u=>u.id===id?item:u):[item,...list]);save('users',this.users());}
  deleteUser(id:number) {this.users.update(list=>list.filter(u=>u.id!==id));save('users',this.users());}
  createOrder(tableId:number,customer:string,items:Order['items'],discount=0):Order {const order:Order={id:Math.max(1052,...this.orders().map(o=>o.id))+1,channel:'mesa',tableId,customer:customer||'Cliente de mesa',waiter:'Arnold Alvarez',items,discount,status:'Pendiente',createdAt:new Date().toISOString()};this.orders.update(list=>[order,...list]);save('orders',this.orders());this.updateTable(tableId,'Ocupada',order.id);return order;}
  createDeliveryOrder(customer:string,items:Order['items'],details:Pick<DeliveryDetails,'phone'|'district'|'address'|'reference'|'instructions'|'fee'>):Order {
    const order:Order={id:Math.max(2053,...this.orders().map(o=>o.id))+1,channel:'delivery',tableId:0,customer,waiter:'Pedido online',items,discount:0,status:'Pendiente',createdAt:new Date().toISOString(),delivery:{...details,status:'Por preparar'}};
    this.orders.update(list=>[order,...list]);save('orders',this.orders());
    this.notifications.update(list=>[{id:Date.now(),title:'Nuevo pedido delivery',detail:`El pedido #PED-${order.id} espera preparación.`,time:'Ahora',read:false,icon:'two_wheeler'},...list]);save('notifications',this.notifications());
    return order;
  }
  updateOrderStatus(id:number,status:OrderStatus) {this.orders.update(list=>list.map(o=>o.id===id?{...o,status,delivery:o.delivery?{...o.delivery,status:status==='Cancelado'?'Cancelado':status==='Preparando'?'Preparando':status==='Listo'&&['Por preparar','Preparando'].includes(o.delivery.status)?'Por asignar':o.delivery.status}:undefined}:o));save('orders',this.orders());const order=this.orders().find(o=>o.id===id);if(order?.channel!=='delivery'&&order&&(status==='Entregado'||status==='Cancelado'))this.updateTable(order.tableId,'Disponible');}
  availableDrivers(excludeOrderId?:number):User[]{const busy=new Set(this.orders().filter(o=>o.id!==excludeOrderId&&o.channel==='delivery'&&['Asignado','En camino'].includes(o.delivery?.status??'')).map(o=>o.delivery?.driverId));return this.users().filter(u=>u.role==='Motorizado'&&u.active&&!busy.has(u.id));}
  assignDeliveryDriver(orderId:number,driverId:number):boolean {const order=this.orders().find(o=>o.id===orderId);if(!order?.delivery||order.status!=='Listo'||!['Por asignar','Asignado'].includes(order.delivery.status)||!this.availableDrivers(orderId).some(u=>u.id===driverId))return false;this.orders.update(list=>list.map(o=>o.id===orderId?{...o,delivery:{...o.delivery!,driverId,status:'Asignado' as const,assignedAt:new Date().toISOString()}}:o));save('orders',this.orders());return true;}
  dispatchDelivery(orderId:number):boolean {const order=this.orders().find(o=>o.id===orderId);if(order?.delivery?.status!=='Asignado'||!order.delivery.driverId)return false;this.orders.update(list=>list.map(o=>o.id===orderId?{...o,delivery:{...o.delivery!,status:'En camino' as const,dispatchedAt:new Date().toISOString()}}:o));save('orders',this.orders());return true;}
  completeDelivery(orderId:number):boolean {const order=this.orders().find(o=>o.id===orderId);if(order?.delivery?.status!=='En camino')return false;this.orders.update(list=>list.map(o=>o.id===orderId?{...o,status:'Entregado' as const,delivery:{...o.delivery!,status:'Entregado' as const,deliveredAt:new Date().toISOString()}}:o));save('orders',this.orders());return true;}
  updateTable(id:number,status:RestaurantTable['status'],orderId?:number) {this.tables.update(list=>list.map(t=>t.id===id?{...t,status,orderId:status==='Ocupada'?orderId:undefined,occupiedSince:status==='Ocupada'?new Date().toISOString():undefined}:t));save('tables',this.tables());}
  markNotificationsRead() {this.notifications.update(list=>list.map(n=>({...n,read:true})));save('notifications',this.notifications());}
  updateSettings(value:RestaurantSettings) {this.settings.set(value);save('settings',value);}
  orderTotal=orderTotal;
}

@Injectable({providedIn:'root'}) export class CurrentUserService {
  readonly store=inject(RestaurantStore);
  readonly user=computed(()=>this.store.users().find(user=>user.id===1)??seedUsers[0]);
  updateProfile(user:User){this.store.upsertUser(user,user.id);}
}
@Injectable({providedIn:'root'}) export class DishService {readonly store=inject(RestaurantStore); readonly items=this.store.dishes; upsert(data:Omit<Dish,'id'|'createdAt'>,id?:number){this.store.upsertDish(data,id);} delete(id:number){this.store.deleteDish(id);} }
@Injectable({providedIn:'root'}) export class CategoryService {readonly store=inject(RestaurantStore); readonly items=this.store.categories;}
@Injectable({providedIn:'root'}) export class OrderService {readonly store=inject(RestaurantStore); readonly items=this.store.orders;}
@Injectable({providedIn:'root'}) export class TableService {readonly store=inject(RestaurantStore); readonly items=this.store.tables;}
@Injectable({providedIn:'root'}) export class UserService {readonly store=inject(RestaurantStore); readonly items=this.store.users;}
@Injectable({providedIn:'root'}) export class NotificationService {readonly store=inject(RestaurantStore); readonly items=this.store.notifications;}
@Injectable({providedIn:'root'}) export class DashboardService {readonly store=inject(RestaurantStore); readonly stats=computed(()=>({sales:1850,orders:48,occupied:this.store.tables().filter(t=>t.status==='Ocupada').length,tableCount:this.store.tables().length,average:38.5,weekSales:[920,1240,1080,1420,1300,1890,1850]}));}
