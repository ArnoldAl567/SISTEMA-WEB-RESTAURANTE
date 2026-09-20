import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { money, orderTotal, orderStatuses } from '../core/models';
import { RestaurantStore } from '../core/store';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, FormsModule],
  template: `<div class="page"><div class="page-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span> OPERACIONES</div><h1>Pedidos</h1><p>Gestiona los pedidos de mesa y delivery desde un solo lugar.</p></div><div class="heading-actions"><a class="btn btn-secondary" routerLink="/delivery"><span class="material-symbols-rounded">two_wheeler</span> Delivery</a><a class="btn btn-primary" routerLink="/pedidos/nuevo"><span class="material-symbols-rounded">add</span> Nuevo pedido</a></div></div>
    <div class="tabs">@for(tab of tabs;track tab){<button [class.active]="status()===tab" (click)="status.set(tab);page.set(1)">{{tab}} <span>{{count(tab)}}</span></button>}</div>
    <section class="surface list-surface"><div class="filter-bar"><div class="search-field"><span class="material-symbols-rounded">search</span><input placeholder="Buscar por pedido o cliente..." aria-label="Buscar pedidos" [ngModel]="query()" (ngModelChange)="query.set($event);page.set(1)"></div><div class="filter-actions"><label class="select-wrap"><span class="material-symbols-rounded">calendar_today</span><input aria-label="Filtrar por fecha" type="date" [ngModel]="date()" (ngModelChange)="date.set($event);page.set(1)"></label><label class="select-wrap"><span class="material-symbols-rounded">storefront</span><select aria-label="Filtrar por canal" [ngModel]="channel()" (ngModelChange)="channel.set($event);page.set(1)"><option value="Todos">Todos los canales</option><option value="mesa">Mesa</option><option value="delivery">Delivery</option></select></label><label class="select-wrap"><span class="material-symbols-rounded">sort</span><select aria-label="Ordenar pedidos" [ngModel]="sort()" (ngModelChange)="sort.set($event)"><option value="recent">Más recientes</option><option value="oldest">Más antiguos</option><option value="highest">Mayor total</option></select></label></div></div>
      <div class="table-scroll"><table><thead><tr><th>Pedido</th><th>Canal</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Estado</th><th>Fecha y hora</th><th></th></tr></thead><tbody>@for(order of visible();track order.id){<tr><td><a [routerLink]="detailLink(order.id,order.channel)" class="order-link">#PED-{{order.id}}</a></td><td><span class="table-pill">{{order.channel==='delivery'?'Delivery':'Mesa '+pad(order.tableId)}}</span></td><td>{{order.customer}}</td><td class="muted">{{order.items.length}} productos</td><td class="bold">{{money(orderTotal(order))}}</td><td><span class="badge" [class]="'badge status-'+order.status.toLowerCase()"><i></i>{{order.status}}</span></td><td class="muted">{{formatDate(order.createdAt)}}</td><td><a [routerLink]="detailLink(order.id,order.channel)" class="table-action" aria-label="Ver detalle"><span class="material-symbols-rounded">arrow_forward</span></a></td></tr>}@empty{<tr><td colspan="8"><div class="empty-state"><span class="material-symbols-rounded">receipt_long</span><h3>No encontramos pedidos</h3><p>Prueba con otros filtros o crea un nuevo pedido.</p><a routerLink="/pedidos/nuevo" class="btn btn-primary">Nuevo pedido</a></div></td></tr>}</tbody></table></div><div class="pagination"><span>Mostrando {{visible().length}} de {{filtered().length}} pedidos</span><div><button class="icon-btn" [disabled]="page()===1" (click)="page.set(page()-1)" aria-label="Página anterior"><span class="material-symbols-rounded">chevron_left</span></button><span>Página {{page()}} de {{pages()}}</span><button class="icon-btn" [disabled]="page()>=pages()" (click)="page.set(page()+1)" aria-label="Página siguiente"><span class="material-symbols-rounded">chevron_right</span></button></div></div></section></div>`,
})
export class OrdersPage {
  readonly store = inject(RestaurantStore);
  readonly money = money;
  readonly orderTotal = orderTotal;
  readonly tabs = ['Todos', ...orderStatuses];
  readonly query = signal('');
  readonly status = signal('Todos');
  readonly date = signal('');
  readonly channel = signal('Todos');
  readonly sort = signal('recent');
  readonly page = signal(1);
  readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    return this.store.orders().filter(order =>
      (this.status() === 'Todos' || order.status === this.status()) &&
      (this.channel() === 'Todos' || (order.channel ?? 'mesa') === this.channel()) &&
      (!this.date() || order.createdAt.slice(0, 10) === this.date()) &&
      (!term || order.customer.toLowerCase().includes(term) || String(order.id).includes(term))
    ).sort((a, b) => this.sort() === 'highest' ? orderTotal(b) - orderTotal(a) : this.sort() === 'oldest' ? a.id - b.id : b.id - a.id);
  });
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 10)));
  readonly visible = computed(() => this.filtered().slice((this.page() - 1) * 10, this.page() * 10));
  count(tab: string) { return tab === 'Todos' ? this.store.orders().length : this.store.orders().filter(order => order.status === tab).length; }
  detailLink(id: number, channel?: 'mesa' | 'delivery') { return [channel === 'delivery' ? '/delivery' : '/pedidos', id]; }
  pad(id: number) { return String(id).padStart(2, '0'); }
  formatDate(value: string) { return new Date(value).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
}
