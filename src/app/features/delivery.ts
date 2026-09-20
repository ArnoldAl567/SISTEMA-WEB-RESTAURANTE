import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { money, orderTotal } from '../core/models';
import { RestaurantStore } from '../core/store';

@Component({
  selector: 'app-delivery',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page delivery-page"><div class="page-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span> OPERACIONES</div><h1>Delivery</h1><p>Prepara, asigna y sigue los pedidos hasta su entrega.</p></div><a routerLink="/ordenar" target="_blank" class="btn btn-primary"><span class="material-symbols-rounded">open_in_new</span> Ver menú público</a></div>
      <div class="delivery-kpis"><div class="surface delivery-kpi"><span class="material-symbols-rounded">receipt_long</span><div><strong>{{count('Por preparar')}}</strong><small>Por preparar</small></div></div><div class="surface delivery-kpi"><span class="material-symbols-rounded">restaurant</span><div><strong>{{count('Por asignar')}}</strong><small>Listos para asignar</small></div></div><div class="surface delivery-kpi"><span class="material-symbols-rounded">two_wheeler</span><div><strong>{{count('Asignado')}}</strong><small>Motorizado asignado</small></div></div><div class="surface delivery-kpi"><span class="material-symbols-rounded">route</span><div><strong>{{count('En camino')}}</strong><small>En camino</small></div></div></div>
      <section class="surface delivery-list"><div class="delivery-list-head"><div><h2>Pedidos a domicilio</h2><p>{{filtered().length}} pedidos encontrados</p></div><div class="delivery-filters"><div class="search-field"><span class="material-symbols-rounded">search</span><input type="search" placeholder="Pedido, cliente o distrito" aria-label="Buscar delivery" [ngModel]="query()" (ngModelChange)="query.set($event)"></div><select class="control" aria-label="Filtrar estado" [ngModel]="filter()" (ngModelChange)="filter.set($event)"><option value="Todos">Todos los estados</option>@for(status of statuses;track status){<option [value]="status">{{status}}</option>}</select></div></div>
        <div class="delivery-order-list">@for(order of filtered();track order.id){<a class="delivery-order-row" [routerLink]="['/delivery',order.id]"><div class="delivery-row-icon"><span class="material-symbols-rounded">two_wheeler</span></div><div class="delivery-row-main"><div><strong>#PED-{{order.id}}</strong><span class="delivery-badge" [class]="statusClass(order.delivery?.status)">{{order.delivery?.status}}</span></div><p>{{order.customer}} <span>·</span> {{order.delivery?.district}}</p><small>{{order.delivery?.address}}</small></div><div class="delivery-row-side"><strong>{{money(orderTotal(order))}}</strong><small>{{date(order.createdAt)}}</small></div><span class="material-symbols-rounded delivery-row-arrow">arrow_forward</span></a>}@empty{<div class="empty-state"><span class="material-symbols-rounded">two_wheeler</span><h3>Sin pedidos en este estado</h3><p>Prueba otro filtro o comparte el menú público con tus clientes.</p></div>}</div>
      </section>
    </div>
  `,
})
export class DeliveryPage {
  readonly store = inject(RestaurantStore);
  readonly money = money;
  readonly orderTotal = orderTotal;
  readonly query = signal('');
  readonly filter = signal('Todos');
  readonly statuses = ['Por preparar', 'Preparando', 'Por asignar', 'Asignado', 'En camino', 'Entregado', 'Cancelado'];
  readonly filtered = computed(() => this.store.orders().filter(order => {
    if (order.channel !== 'delivery') return false;
    const term = this.query().trim().toLowerCase();
    return (this.filter() === 'Todos' || order.delivery?.status === this.filter()) && (!term || `${order.id} ${order.customer} ${order.delivery?.district}`.toLowerCase().includes(term));
  }).sort((a, b) => b.id - a.id));
  count(status: string) { return this.store.orders().filter(order => order.channel === 'delivery' && order.delivery?.status === status).length; }
  date(value: string) { return new Date(value).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  statusClass(status?: string) { return `delivery-status-${(status ?? '').toLowerCase().replaceAll(' ', '-')}`; }
}
