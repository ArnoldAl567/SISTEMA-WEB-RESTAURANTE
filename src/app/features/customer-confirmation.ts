import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { money, orderTotal } from '../core/models';
import { RestaurantStore } from '../core/store';
import { ThemeService } from '../core/theme';

@Component({
  selector: 'app-customer-confirmation',
  imports: [RouterLink],
  template: `
    <div class="customer-page confirmation-page"><header class="customer-header"><a routerLink="/ordenar" class="customer-brand"><span class="customer-logo material-symbols-rounded">restaurant</span><span><strong>{{store.settings().name}}</strong><small>El sabor de compartir</small></span></a><div class="customer-header-actions"><button class="icon-btn theme-toggle" type="button" (click)="theme.toggle()" [attr.aria-label]="theme.theme()==='dark'?'Cambiar a tema claro':'Cambiar a tema oscuro'" [attr.title]="theme.theme()==='dark'?'Tema claro':'Tema oscuro'"><span class="material-symbols-rounded">{{theme.theme()==='dark'?'light_mode':'dark_mode'}}</span></button><a routerLink="/ordenar" class="customer-cart-link"><span class="material-symbols-rounded">arrow_back</span> Volver a la carta</a></div></header>
      <main class="confirmation-wrap">@if(order();as o){<div class="confirmation-success"><span class="material-symbols-rounded">check_circle</span><span class="eyebrow">PEDIDO RECIBIDO</span><h1>¡Gracias, {{firstName(o.customer)}}!</h1><p>Recibimos tu pedido <strong>#PED-{{o.id}}</strong>. Lo prepararemos y asignaremos a un motorizado para llevarlo a tu dirección.</p></div>
        <div class="confirmation-grid"><section class="surface confirmation-card"><div class="section-heading"><div><h2>Seguimiento de tu pedido</h2><p>La información se actualiza mientras avanzamos.</p></div><span class="delivery-badge" [class]="statusClass(o.delivery?.status)">{{o.delivery?.status}}</span></div><div class="delivery-steps">@for(step of steps;track step.label;let index=$index){<div class="delivery-step" [class.done]="progress(o.delivery?.status)>=index"><span class="delivery-step-icon material-symbols-rounded">{{step.icon}}</span><div><strong>{{step.label}}</strong><small>{{step.detail}}</small></div></div>}</div>@if(o.delivery?.status==='Cancelado'){<p class="delivery-cancel-note">Este pedido fue cancelado. Comunícate con el restaurante para recibir ayuda.</p>}</section>
        <section class="surface confirmation-card"><div class="section-heading"><div><h2>Resumen de la entrega</h2><p>Pedido #PED-{{o.id}}</p></div></div><div class="confirmation-info"><div><span>Cliente</span><strong>{{o.customer}}</strong></div><div><span>Celular</span><strong>{{o.delivery?.phone}}</strong></div><div><span>Dirección</span><strong>{{o.delivery?.address}}, {{o.delivery?.district}}</strong></div>@if(o.delivery?.reference){<div><span>Referencia</span><strong>{{o.delivery?.reference}}</strong></div>}@if(driverName(o.delivery?.driverId)){<div><span>Motorizado</span><strong>{{driverName(o.delivery?.driverId)}}</strong></div>}</div><div class="confirmation-products">@for(item of o.items;track item.dishId){<div><span>{{item.quantity}} × {{item.name}}</span><strong>{{money(item.quantity*item.price)}}</strong></div>}</div><div class="confirmation-totals"><div><span>Envío</span><strong>{{money(o.delivery?.fee??0)}}</strong></div><div><span>Total</span><strong>{{money(orderTotal(o))}}</strong></div></div></section></div><a routerLink="/ordenar" class="btn btn-primary confirmation-back">Volver a la carta</a>
      }@else{<div class="surface confirmation-card confirmation-missing"><span class="material-symbols-rounded">search_off</span><h1>Pedido no encontrado</h1><p>Revisa el número de pedido o vuelve a nuestra carta.</p><a routerLink="/ordenar" class="btn btn-primary">Ver la carta</a></div>}</main>
    </div>
  `,
})
export class CustomerConfirmationPage {
  readonly store = inject(RestaurantStore);
  readonly theme = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly order = computed(() => this.store.orders().find(order => order.id === this.id && order.channel === 'delivery'));
  readonly money = money;
  readonly orderTotal = orderTotal;
  readonly steps = [
    { label: 'Pedido recibido', detail: 'Tu pedido llegó a nuestra cocina.', icon: 'receipt_long' },
    { label: 'En preparación', detail: 'Estamos preparando tus platos.', icon: 'skillet' },
    { label: 'Motorizado asignado', detail: 'Tu pedido está listo para salir.', icon: 'two_wheeler' },
    { label: 'En camino', detail: 'El motorizado va hacia tu dirección.', icon: 'route' },
    { label: 'Entregado', detail: '¡Que lo disfrutes!', icon: 'check_circle' },
  ];
  firstName(name: string) { return name.split(' ')[0]; }
  driverName(id?: number) { const driver = this.store.users().find(user => user.id === id); return driver ? `${driver.firstName} ${driver.lastName}` : ''; }
  progress(status?: string) { return status === 'Entregado' ? 4 : status === 'En camino' ? 3 : status === 'Asignado' ? 2 : status === 'Por asignar' || status === 'Preparando' ? 1 : status === 'Por preparar' ? 0 : -1; }
  statusClass(status?: string) { return `delivery-status-${(status ?? '').toLowerCase().replaceAll(' ', '-')}`; }
}
