export type OrderStatus = 'Pendiente' | 'Preparando' | 'Listo' | 'Entregado' | 'Cancelado';
export type TableStatus = 'Disponible' | 'Ocupada' | 'Reservada' | 'Mantenimiento';
export type UserRole = 'Administrador' | 'Cajero' | 'Mesero' | 'Cocina' | 'Motorizado';
export type DeliveryStatus = 'Por preparar' | 'Preparando' | 'Por asignar' | 'Asignado' | 'En camino' | 'Entregado' | 'Cancelado';

export interface Category { id: number; name: string; description: string; active: boolean; }
export interface Dish { id: number; name: string; description: string; price: number; image: string; categoryId: number; available: boolean; createdAt: string; }
export interface User { id: number; firstName: string; lastName: string; email: string; phone: string; role: UserRole; active: boolean; lastAccess: string; }
export interface OrderItem { dishId: number; name: string; price: number; quantity: number; }
export interface DeliveryDetails { phone: string; district: string; address: string; reference: string; instructions: string; fee: number; status: DeliveryStatus; driverId?: number; assignedAt?: string; dispatchedAt?: string; deliveredAt?: string; }
export interface Order { id: number; channel?: 'mesa' | 'delivery'; tableId: number; customer: string; waiter: string; items: OrderItem[]; discount: number; status: OrderStatus; createdAt: string; delivery?: DeliveryDetails; }
export interface RestaurantTable { id: number; capacity: number; status: TableStatus; orderId?: number; occupiedSince?: string; }
export interface AppNotification { id: number; title: string; detail: string; time: string; read: boolean; icon: string; }
export interface DashboardStats { sales: number; orders: number; occupied: number; tableCount: number; average: number; weekSales: number[]; }
export interface RestaurantSettings { name: string; ruc: string; phone: string; email: string; address: string; currency: string; timezone: string; tax: number; notifications: boolean; logo: string; }
export const orderStatuses: OrderStatus[] = ['Pendiente', 'Preparando', 'Listo', 'Entregado', 'Cancelado'];
export const roles: UserRole[] = ['Administrador', 'Cajero', 'Mesero', 'Cocina', 'Motorizado'];
export const money = (value: number) => `S/ ${value.toFixed(2)}`;
export const orderTotal = (order: Order) => Math.max(0, order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) - order.discount) + (order.delivery?.fee ?? 0);
