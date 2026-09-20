import { AppNotification, Category, Dish, Order, RestaurantSettings, RestaurantTable, User } from './models';

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;
const pexels = (id:number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1000`;
const images = [
  'photo-1546833999-b9f581a1996d','photo-1565299624946-b28f40a0ae38','photo-1504674900247-0877df9cc836',
  'photo-1547592180-85f173990554','photo-1559847844-5315695dadae','photo-1512621776951-a57141f2eefd',
  'photo-1546069901-ba9599a7e63c','photo-1568909344668-6f14a07b56ae','photo-1552566626-52f8b828add9',
  'photo-1574071318508-1cdbab80d002','photo-1571091718767-18b5b1457add','photo-1519708227418-c8fd9a32b7a2'
];
export const FALLBACK_IMAGE = '/images/dish-fallback.svg';
export const seedCategories: Category[] = [
  { id: 1, name: 'Entradas', description: 'Pequeños bocados para comenzar la experiencia.', active: true },
  { id: 2, name: 'Platos principales', description: 'Los favoritos de nuestra cocina peruana.', active: true },
  { id: 3, name: 'Parrillas', description: 'Preparaciones a la brasa, llenas de sabor.', active: true },
  { id: 4, name: 'Bebidas', description: 'Opciones frescas para acompañar cada plato.', active: true },
  { id: 5, name: 'Postres', description: 'El cierre perfecto para cada comida.', active: true }
];
const dishRows: [string,string,number,number,number][] = [
  ['Lomo Saltado','Tiras de res salteadas con cebolla, tomate, papas crocantes y arroz.',32,2,0],
  ['Ají de Gallina','Pollo deshilachado en cremosa salsa de ají amarillo.',29,2,1],
  ['Arroz Chaufa Especial','Arroz salteado al wok con pollo, cerdo y vegetales.',28,2,2],
  ['Pollo a la Parrilla','Pechuga marinada a la brasa con guarnición de la casa.',31,3,3],
  ['Causa Limeña','Papa amarilla, palta y relleno de pollo con mayonesa.',18,1,4],
  ['Tequeños de Queso','Masa crocante rellena de queso con salsa de palta.',16,1,5],
  ['Hamburguesa Artesanal','Carne de la casa, queso, vegetales y papas fritas.',30,2,7],
  ['Chicha Morada','Bebida tradicional de maíz morado y frutas.',8,4,6],
  ['Limonada Frozen','Limón fresco licuado con hielo y hierbabuena.',9,4,6],
  ['Tres Leches','Bizcocho suave bañado en tres leches.',15,5,4],
  ['Anticuchos de Corazón','Brochetas a la parrilla con papa dorada y choclo.',24,3,2],
  ['Ceviche Clásico','Pescado fresco, limón, cebolla morada y camote.',35,1,11],
  ['Tallarines Verdes','Pasta en salsa de albahaca con bistec de res.',30,2,9],
  ['Picarones','Aros dorados con miel de chancaca.',14,5,10],
  ['Inca Kola','Gaseosa peruana, botella personal.',8,4,6],
  ['Mazamorra Morada','Postre tradicional con frutas y canela.',12,5,4],
  ['Parrilla Mixta','Selección de carnes, chorizo y papas nativas.',58,3,2],
  ['Papa a la Huancaína','Rodajas de papa con salsa cremosa de ají.',17,1,3],
  ['Arroz con Mariscos','Arroz sazonado con una selección de mariscos.',38,2,11],
  ['Suspiro Limeño','Manjar blanco y merengue con un toque de canela.',16,5,4]
];
const featuredImages:Record<number,string>={
  0:pexels(28503590), 1:pexels(6763281), 2:pexels(17025344), 3:pexels(34110271),
  5:pexels(16971086), 7:pexels(28490837), 11:pexels(30766461)
};
export const seedDishes: Dish[] = dishRows.map(([name,description,price,categoryId,image],index) => ({
  id:index+1,name,description,price,categoryId,image:featuredImages[index]??photo(images[image]),available:index!==15,createdAt:'2026-09-01T10:00:00'
}));
const names = ['Carlos Mendoza','Lucía Torres','Diego Ramírez','Valeria Paredes','José Salazar','María Fernanda Ruiz','Andrés Flores','Camila Rojas','Luis Chávez','Sofía Castillo'];
const status = ['Preparando','Listo','Pendiente','Preparando','Preparando','Listo','Pendiente','Listo','Entregado','Cancelado'] as const;
export const seedOrders: Order[] = Array.from({length:25},(_,i) => {
  const a = seedDishes[(i*3)%seedDishes.length]; const b=seedDishes[(i*3+7)%seedDishes.length];
  return { id:1052-i, channel:'mesa', tableId:i%12+1, customer:names[i%names.length], waiter:['María Rojas','Diego Vargas','Ana Flores'][i%3],
    items:[{dishId:a.id,name:a.name,price:a.price,quantity:i%3+1},{dishId:b.id,name:b.name,price:b.price,quantity:1}],
    discount:0,status:status[i%status.length],createdAt:new Date(Date.now()-i*72*60*1000).toISOString() };
});
export const seedDeliveryOrders: Order[] = [
  {id:2051,channel:'delivery',tableId:0,customer:'Fernanda Castro',waiter:'Pedido online',items:[{dishId:1,name:'Lomo Saltado',price:32,quantity:2},{dishId:8,name:'Chicha Morada',price:8,quantity:1}],discount:0,status:'Pendiente',createdAt:new Date(Date.now()-18*60*1000).toISOString(),delivery:{phone:'987654321',district:'Miraflores',address:'Calle Berlín 245, dpto. 302',reference:'Portón negro junto a la farmacia',instructions:'Tocar el timbre una vez.',fee:7,status:'Por preparar'}},
  {id:2052,channel:'delivery',tableId:0,customer:'Ricardo Ponce',waiter:'Pedido online',items:[{dishId:2,name:'Ají de Gallina',price:29,quantity:1},{dishId:10,name:'Tres Leches',price:15,quantity:1}],discount:0,status:'Listo',createdAt:new Date(Date.now()-48*60*1000).toISOString(),delivery:{phone:'986123456',district:'San Isidro',address:'Av. Dos de Mayo 780',reference:'Recepción del edificio',instructions:'Entregar en recepción.',fee:9,status:'Asignado',driverId:101,assignedAt:new Date(Date.now()-5*60*1000).toISOString()}},
  {id:2053,channel:'delivery',tableId:0,customer:'Paola Bustamante',waiter:'Pedido online',items:[{dishId:3,name:'Arroz Chaufa Especial',price:28,quantity:2}],discount:0,status:'Listo',createdAt:new Date(Date.now()-70*60*1000).toISOString(),delivery:{phone:'985456789',district:'Surquillo',address:'Jr. Dante 114',reference:'Casa de fachada blanca',instructions:'Llamar al llegar.',fee:8,status:'En camino',driverId:102,assignedAt:new Date(Date.now()-23*60*1000).toISOString(),dispatchedAt:new Date(Date.now()-12*60*1000).toISOString()}}
];
export const seedTables: RestaurantTable[] = Array.from({length:12},(_,i) => ({
  id:i+1,capacity:i%4===0?6:i%3===0?2:4,status:i<8?'Ocupada':i<10?'Disponible':i===10?'Reservada':'Mantenimiento',
  orderId:i<8?1052-i:undefined,occupiedSince:i<8?new Date(Date.now()-(i+1)*28*60*1000).toISOString():undefined
}));
const userRows: [string,string,string,string,User['role']][] = [
  ['Arnold','Alvarez','arnold@restaurante.com','987 654 321','Administrador'],['María','Rojas','maria@restaurante.com','987 654 322','Mesero'],
  ['Diego','Vargas','diego@restaurante.com','987 654 323','Mesero'],['Lucía','Campos','lucia@restaurante.com','987 654 324','Cajero'],
  ['Ana','Flores','ana@restaurante.com','987 654 325','Mesero'],['Jorge','Pérez','jorge@restaurante.com','987 654 326','Cocina'],
  ['Rosa','García','rosa@restaurante.com','987 654 327','Cocina'],['Marco','Silva','marco@restaurante.com','987 654 328','Cajero'],
  ['Paola','Reyes','paola@restaurante.com','987 654 329','Mesero'],['Pedro','León','pedro@restaurante.com','987 654 330','Cocina'],
  ['Miguel','Quispe','miguel@restaurante.com','987 654 331','Motorizado'],['Kevin','Huamán','kevin@restaurante.com','987 654 332','Motorizado'],['Bruno','Ramos','bruno@restaurante.com','987 654 333','Motorizado']
];
export const seedUsers: User[] = userRows.map(([firstName,lastName,email,phone,role],i) => ({id:i<10?i+1:i+91,firstName,lastName,email,phone,role,active:i!==9,lastAccess:new Date(Date.now()-i*60*60*1000).toISOString()}));
export const seedNotifications: AppNotification[] = [
  {id:1,title:'Nuevo pedido recibido',detail:'El pedido #PED-1052 se agregó a la cocina.',time:'Hace 2 min',read:false,icon:'receipt_long'},
  {id:2,title:'Pedido listo para servir',detail:'El pedido #PED-1051 está listo.',time:'Hace 12 min',read:false,icon:'restaurant'},
  {id:3,title:'Mesa 04 solicita atención',detail:'Un cliente solicitó asistencia.',time:'Hace 25 min',read:false,icon:'table_restaurant'}
];
export const seedSettings: RestaurantSettings = {name:'Sazón & Raíz',ruc:'',phone:'(01) 456-7890',email:'hola@sazonyraiz.pe',address:'Av. Pardo 610, Miraflores, Lima',currency:'PEN',timezone:'America/Lima',tax:18,notifications:true,logo:''};
