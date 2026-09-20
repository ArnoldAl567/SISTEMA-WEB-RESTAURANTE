import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { money, orderTotal } from '../core/models';
import { RestaurantStore, toast } from '../core/store';
import { ThemeService } from '../core/theme';

@Component({
  selector: 'app-driver',
  imports: [FormsModule, RouterLink],
  template: `<div class="driver-page"><header class="driver-header"><div class="customer-brand"><span class="customer-logo material-symbols-rounded">two_wheeler</span><span><strong>{{store.settings().name}}</strong><small>Panel de reparto</small></span></div><div class="customer-header-actions"><button class="icon-btn theme-toggle" type="button" (click)="theme.toggle()" [attr.aria-label]="theme.theme()==='dark'?'Cambiar a tema claro':'Cambiar a tema oscuro'" [attr.title]="theme.theme()==='dark'?'Tema claro':'Tema oscuro'"><span class="material-symbols-rounded">{{theme.theme()==='dark'?'light_mode':'dark_mode'}}</span></button><a routerLink="/delivery" class="driver-admin-link">Panel operativo <span class="material-symbols-rounded">arrow_forward</span></a></div></header><main class="driver-container"><div class="driver-welcome"><span class="eyebrow"><span class="eyebrow-line"></span> REPARTO</span><h1>Mis entregas</h1><p>Consulta los pedidos que te asignaron y confirma cuando lleguen a su destino.</p></div><section class="surface driver-picker"><label for="driver-name">Seleccionar motorizado</label><select id="driver-name" class="control" [ngModel]="driverId()" (ngModelChange)="driverId.set(+$event)"><option [ngValue]="0">Selecciona tu nombre</option>@for(driver of drivers();track driver.id){<option [ngValue]="driver.id">{{driver.firstName}} {{driver.lastName}}</option>}</select></section>
    @if(driverId()){<div class="driver-summary"><div><strong>{{active().length}}</strong><span>Entregas activas</span></div><div><strong>{{completed().length}}</strong><span>Completadas</span></div></div><div class="driver-orders">@for(order of active();track order.id){<article class="surface driver-order"><div class="driver-order-head"><div><small>PEDIDO</small><h2>#PED-{{order.id}}</h2></div><span class="delivery-badge" [class]="statusClass(order.delivery?.status)">{{order.delivery?.status}}</span></div><div class="driver-destination"><span class="material-symbols-rounded">location_on</span><div><strong>{{order.delivery?.address}}</strong><span>{{order.delivery?.district}} · {{order.delivery?.reference||'Sin referencia'}}</span></div></div><div class="driver-contact"><span>{{order.customer}}</span><a [href]="'tel:'+order.delivery?.phone"><span class="material-symbols-rounded">call</span> {{order.delivery?.phone}}</a></div>@if(order.delivery?.instructions){<p class="driver-instructions">{{order.delivery?.instructions}}</p>}<div class="driver-order-foot"><strong>{{money(orderTotal(order))}}</strong>@if(order.delivery?.status==='Asignado'){<span>Espera el despacho del restaurante.</span>}@else{<button class="btn btn-primary" (click)="complete(order.id)"><span class="material-symbols-rounded">task_alt</span> Marcar entregado</button>}</div></article>}@empty{<div class="surface driver-empty"><span class="material-symbols-rounded">two_wheeler</span><h2>Sin entregas activas</h2><p>Los pedidos aparecerán aquí cuando el restaurante te los asigne.</p></div>}</div>@if(completed().length){<section class="driver-completed"><h2>Entregas completadas</h2>@for(order of completed();track order.id){<div><span>#PED-{{order.id}} · {{order.customer}}</span><strong>{{order.delivery?.district}}</strong></div>}</section>}}@else{<div class="surface driver-empty"><span class="material-symbols-rounded">person_search</span><h2>Selecciona tu nombre</h2><p>Verás tus pedidos asignados y direcciones de entrega.</p></div>}
  </main></div>`,
})
export class DriverPage {
  readonly store = inject(RestaurantStore);
  readonly theme = inject(ThemeService);
  readonly money = money;
  readonly orderTotal = orderTotal;
  readonly driverId = signal(0);
  readonly drivers = computed(() => this.store.users().filter(user => user.role === 'Motorizado' && user.active));
  readonly active = computed(() => this.store.orders().filter(order => order.channel === 'delivery' && order.delivery?.driverId === this.driverId() && ['Asignado', 'En camino'].includes(order.delivery?.status ?? '')).sort((a, b) => b.id - a.id));
  readonly completed = computed(() => this.store.orders().filter(order => order.channel === 'delivery' && order.delivery?.driverId === this.driverId() && order.delivery?.status === 'Entregado').sort((a, b) => b.id - a.id));
  statusClass(status?: string) { return `delivery-status-${(status ?? '').toLowerCase().replaceAll(' ', '-')}`; }
  complete(id: number) { if (this.store.completeDelivery(id)) toast('Entrega registrada'); else toast('La entrega todavía no está en camino', 'error'); }
}
