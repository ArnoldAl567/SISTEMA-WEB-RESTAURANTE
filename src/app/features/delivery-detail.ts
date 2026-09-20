import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { money, orderTotal } from '../core/models';
import { RestaurantStore, toast } from '../core/store';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-delivery-detail',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page delivery-detail-page"><div class="page-heading"><div><a routerLink="/delivery" class="back-link"><span class="material-symbols-rounded">arrow_back</span> Volver a delivery</a><h1>Pedido #PED-{{id}}</h1><p>Gestiona la preparación y la entrega a domicilio.</p></div>@if(order();as o){<span class="delivery-badge delivery-heading-badge" [class]="statusClass(o.delivery?.status)">{{o.delivery?.status}}</span>}</div>
      @if(order();as o){<div class="delivery-detail-grid"><div class="delivery-detail-main"><section class="surface detail-card"><div class="section-heading"><div><h2>Datos de entrega</h2><p>Información para la cocina y el motorizado</p></div><span class="material-symbols-rounded detail-icon">location_on</span></div><div class="info-grid"><div><small>Cliente</small><strong>{{o.customer}}</strong></div><div><small>Celular</small><strong><a [href]="'tel:'+o.delivery?.phone">{{o.delivery?.phone}}</a></strong></div><div><small>Distrito</small><strong>{{o.delivery?.district}}</strong></div><div><small>Fecha y hora</small><strong>{{date(o.createdAt)}}</strong></div><div class="info-wide"><small>Dirección</small><strong>{{o.delivery?.address}}</strong></div><div class="info-wide"><small>Referencia</small><strong>{{o.delivery?.reference||'Sin referencia'}}</strong></div><div class="info-wide"><small>Indicaciones</small><strong>{{o.delivery?.instructions||'Sin indicaciones adicionales'}}</strong></div></div></section>
        <section class="surface detail-card"><div class="section-heading"><div><h2>Productos del pedido</h2><p>{{o.items.length}} productos para preparar</p></div></div><div class="table-scroll"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>@for(item of o.items;track item.dishId){<tr><td class="bold">{{item.name}}</td><td>{{item.quantity}}</td><td>{{money(item.price)}}</td><td class="bold">{{money(item.price*item.quantity)}}</td></tr>}</tbody></table></div><div class="detail-total"><div><span>Productos</span><strong>{{money(orderTotal(o)-(o.delivery?.fee??0))}}</strong></div><div><span>Envío</span><strong>{{money(o.delivery?.fee??0)}}</strong></div><div><span>Total</span><strong>{{money(orderTotal(o))}}</strong></div></div></section></div>
        <aside class="delivery-detail-side"><section class="surface detail-card"><div class="section-heading"><div><h2>Estado de la entrega</h2><p>Avanza cada etapa en orden.</p></div></div><div class="delivery-steps">@for(step of steps;track step.label;let index=$index){<div class="delivery-step" [class.done]="progress(o.delivery?.status)>=index"><span class="delivery-step-icon material-symbols-rounded">{{step.icon}}</span><div><strong>{{step.label}}</strong><small>{{step.detail}}</small></div></div>}</div></section>
          <section class="surface detail-card delivery-actions"><h2>Acciones del pedido</h2>@if(o.delivery?.status==='Por preparar'){<p>Confirma que cocina empezó a preparar este pedido.</p><button class="btn btn-primary full-width" (click)="prepare()"><span class="material-symbols-rounded">skillet</span> Iniciar preparación</button>}@else if(o.delivery?.status==='Preparando'){<p>Cuando los platos estén terminados, márcalos como listos para despacho.</p><button class="btn btn-primary full-width" (click)="ready()"><span class="material-symbols-rounded">check_circle</span> Marcar listo para envío</button>}@else if(o.delivery?.status==='Por asignar'){<p>El pedido está listo. Asigna un motorizado disponible.</p><div class="field"><label for="driver-select">Motorizado</label><select class="control" id="driver-select" [ngModel]="selectedDriver()" (ngModelChange)="selectedDriver.set(+$event)"><option [ngValue]="0">Selecciona un motorizado</option>@for(driver of store.availableDrivers(id);track driver.id){<option [ngValue]="driver.id">{{driver.firstName}} {{driver.lastName}}</option>}</select></div>@if(!store.availableDrivers(id).length){<p class="delivery-alert">No hay motorizados disponibles. Revisa los pedidos en camino.</p>}<button class="btn btn-primary full-width" [disabled]="!selectedDriver()" (click)="assign()"><span class="material-symbols-rounded">person_add</span> Asignar motorizado</button>}@else if(o.delivery?.status==='Asignado'){<p>Motorizado asignado: <strong>{{driverName(o.delivery?.driverId)}}</strong>.</p><button class="btn btn-primary full-width" (click)="dispatch()"><span class="material-symbols-rounded">two_wheeler</span> Entregar al motorizado</button><div class="field"><label for="driver-reassign">Cambiar motorizado</label><select class="control" id="driver-reassign" [ngModel]="selectedDriver()" (ngModelChange)="selectedDriver.set(+$event)"><option [ngValue]="0">Selecciona otro</option>@for(driver of store.availableDrivers(id);track driver.id){<option [ngValue]="driver.id">{{driver.firstName}} {{driver.lastName}}</option>}</select></div><button class="btn btn-secondary full-width" [disabled]="!selectedDriver()" (click)="assign()">Guardar cambio</button>}@else if(o.delivery?.status==='En camino'){<p><strong>{{driverName(o.delivery?.driverId)}}</strong> está llevando el pedido a {{o.delivery?.district}}.</p><button class="btn btn-primary full-width" (click)="complete()"><span class="material-symbols-rounded">task_alt</span> Confirmar entrega</button>}@else if(o.delivery?.status==='Entregado'){<div class="delivery-finished"><span class="material-symbols-rounded">check_circle</span><strong>Pedido entregado</strong><small>{{o.delivery?.deliveredAt?date(o.delivery!.deliveredAt!):''}}</small></div>}@else{<p class="delivery-alert">Este pedido fue cancelado.</p>}
          @if(o.delivery?.status!=='Entregado'&&o.delivery?.status!=='Cancelado'){<button class="delivery-cancel" (click)="cancel()">Cancelar pedido</button>}</section>
          <a [routerLink]="['/ordenar/confirmacion',id]" target="_blank" class="delivery-public-link"><span class="material-symbols-rounded">open_in_new</span> Ver seguimiento del cliente</a>
        </aside></div>}@else{<div class="surface empty-state"><span class="material-symbols-rounded">search_off</span><h3>Pedido delivery no encontrado</h3><a routerLink="/delivery" class="btn btn-primary">Ver pedidos delivery</a></div>}
    </div>
  `,
})
export class DeliveryDetailPage {
  readonly store = inject(RestaurantStore);
  private readonly route = inject(ActivatedRoute);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly order = computed(() => this.store.orders().find(order => order.id === this.id && order.channel === 'delivery'));
  readonly money = money;
  readonly orderTotal = orderTotal;
  readonly selectedDriver = signal(0);
  readonly steps = [
    { label: 'Recibido', detail: 'Pedido registrado', icon: 'receipt_long' },
    { label: 'Preparación', detail: 'Cocina prepara los platos', icon: 'skillet' },
    { label: 'Motorizado asignado', detail: 'Listo para despacho', icon: 'person_pin_circle' },
    { label: 'En camino', detail: 'Camino a la dirección', icon: 'two_wheeler' },
    { label: 'Entregado', detail: 'Entrega confirmada', icon: 'task_alt' },
  ];
  date(value: string) { return new Date(value).toLocaleString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  statusClass(status?: string) { return `delivery-status-${(status ?? '').toLowerCase().replaceAll(' ', '-')}`; }
  driverName(id?: number) { const driver = this.store.users().find(user => user.id === id); return driver ? `${driver.firstName} ${driver.lastName}` : 'Sin asignar'; }
  progress(status?: string) { return status === 'Entregado' ? 4 : status === 'En camino' ? 3 : status === 'Asignado' ? 2 : status === 'Por asignar' || status === 'Preparando' ? 1 : status === 'Por preparar' ? 0 : -1; }
  prepare() { this.store.updateOrderStatus(this.id, 'Preparando'); toast('Pedido en preparación'); }
  ready() { this.store.updateOrderStatus(this.id, 'Listo'); toast('Pedido listo para asignar'); }
  assign() { if (this.store.assignDeliveryDriver(this.id, this.selectedDriver())) { this.selectedDriver.set(0); toast('Motorizado asignado'); } else toast('Selecciona un motorizado disponible', 'error'); }
  dispatch() { if (this.store.dispatchDelivery(this.id)) toast('Pedido entregado al motorizado'); else toast('No se pudo despachar el pedido', 'error'); }
  complete() { if (this.store.completeDelivery(this.id)) toast('Entrega confirmada'); else toast('No se pudo completar la entrega', 'error'); }
  async cancel() { const result = await Swal.fire({ title: '¿Cancelar pedido?', text: 'El pedido quedará marcado como cancelado.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Cancelar pedido', cancelButtonText: 'Volver', confirmButtonColor: '#c2410c' }); if (result.isConfirmed) { this.store.updateOrderStatus(this.id, 'Cancelado'); toast('Pedido cancelado', 'info'); } }
}
