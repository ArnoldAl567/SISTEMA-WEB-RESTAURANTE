import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Dish, OrderItem, money } from '../core/models';
import { FALLBACK_IMAGE } from '../core/mock-data';
import { RestaurantStore, toast } from '../core/store';
import { ThemeService } from '../core/theme';

const zones = [
  { name: 'Miraflores', fee: 7 },
  { name: 'Surquillo', fee: 8 },
  { name: 'San Isidro', fee: 9 },
  { name: 'Barranco', fee: 10 },
  { name: 'San Borja', fee: 10 },
];

@Component({
  selector: 'app-customer-order',
  imports: [ReactiveFormsModule],
  template: `
    <div class="customer-page">
      <header class="customer-header">
        <div class="customer-brand"><span class="customer-logo material-symbols-rounded">restaurant</span><span><strong>{{store.settings().name}}</strong><small>El sabor de compartir</small></span></div>
        <div class="customer-header-actions"><button class="icon-btn theme-toggle" type="button" (click)="theme.toggle()" [attr.aria-label]="theme.theme()==='dark'?'Cambiar a tema claro':'Cambiar a tema oscuro'" [attr.title]="theme.theme()==='dark'?'Tema claro':'Tema oscuro'"><span class="material-symbols-rounded">{{theme.theme()==='dark'?'light_mode':'dark_mode'}}</span></button><button class="customer-cart-link" type="button" (click)="scrollTo('tu-pedido')"><span class="material-symbols-rounded">shopping_bag</span> Tu pedido <b>{{itemCount()}}</b></button></div>
      </header>
      <main class="customer-container">
        <section class="customer-hero">
          <div><span class="customer-kicker"><span class="material-symbols-rounded">two_wheeler</span> DELIVERY A TU PUERTA</span><h1>Tu antojo favorito,<br><em>directo a casa.</em></h1><p>Explora nuestra carta, elige tus platos y nosotros nos encargamos de llevarlos hasta ti.</p><button type="button" (click)="scrollTo('carta')" class="btn btn-primary">Explorar la carta <span class="material-symbols-rounded">arrow_downward</span></button></div>
          <div class="hero-art"><span class="hero-art-ring"></span><img src="https://images.pexels.com/photos/28503590/pexels-photo-28503590.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Plato de comida peruana" (error)="fallback($event)"><span class="hero-stamp"><span class="material-symbols-rounded">local_shipping</span> Recién hecho<br>para ti</span></div>
        </section>
        <div class="customer-layout">
          <section id="carta" class="customer-menu">
            <div class="customer-section-heading"><div><span class="eyebrow"><span class="eyebrow-line"></span> NUESTRA CARTA</span><h2>¿Qué se te antoja hoy?</h2><p>Preparamos cada plato al momento con ingredientes frescos.</p></div><span class="menu-count">{{filtered().length}} platos disponibles</span></div>
            <div class="customer-toolbar"><div class="search-field"><span class="material-symbols-rounded">search</span><input type="search" placeholder="Buscar un plato..." aria-label="Buscar platos" [value]="query()" (input)="query.set($any($event.target).value)"></div><div class="customer-chips"><button type="button" [class.active]="category()===0" (click)="category.set(0)">Todos</button>@for(cat of store.categories();track cat.id){@if(cat.active){<button type="button" [class.active]="category()===cat.id" (click)="category.set(cat.id)">{{cat.name}}</button>}}</div></div>
            <div class="customer-dishes">@for(dish of filtered();track dish.id){<article class="customer-dish"><img [src]="dish.image" [alt]="dish.name" loading="lazy" (error)="fallback($event)"><div class="customer-dish-info"><small>{{categoryName(dish.categoryId)}}</small><h3>{{dish.name}}</h3><p>{{dish.description}}</p><div><strong>{{money(dish.price)}}</strong><button type="button" (click)="add(dish)" [attr.aria-label]="'Agregar '+dish.name"><span class="material-symbols-rounded">add</span> Agregar</button></div></div></article>}@empty{<div class="customer-empty">No encontramos platos con esa búsqueda.</div>}</div>
          </section>
          <aside id="tu-pedido" class="customer-checkout">
            <div class="checkout-heading"><div><span class="eyebrow"><span class="eyebrow-line"></span> TU SELECCIÓN</span><h2>Tu pedido</h2></div><span class="material-symbols-rounded">shopping_bag</span></div>
            <div class="checkout-items">@for(item of cart();track item.dishId){<div class="checkout-item"><div><strong>{{item.name}}</strong><small>{{money(item.price)}} c/u</small><button type="button" (click)="remove(item.dishId)">Quitar</button></div><div class="checkout-item-side"><strong>{{money(item.price*item.quantity)}}</strong><div class="checkout-qty"><button type="button" (click)="change(item.dishId,-1)" [attr.aria-label]="'Quitar una unidad de '+item.name">−</button><span>{{item.quantity}}</span><button type="button" (click)="change(item.dishId,1)" [attr.aria-label]="'Agregar una unidad de '+item.name">+</button></div></div></div>}@empty{<div class="checkout-empty"><span class="material-symbols-rounded">ramen_dining</span><strong>Tu pedido comienza aquí</strong><p>Agrega algo delicioso de nuestra carta.</p></div>}</div>
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <h3>Datos de entrega</h3><p class="checkout-form-intro">Completa los datos para que el motorizado llegue a ti.</p>
              <div class="field"><label for="delivery-name">Nombre completo *</label><input class="control" id="delivery-name" formControlName="name" autocomplete="name" placeholder="¿A nombre de quién va el pedido?">@if(form.controls.name.touched&&form.controls.name.invalid){<small class="field-error">Ingresa tu nombre (mínimo 3 caracteres).</small>}</div>
              <div class="field"><label for="delivery-phone">Celular de contacto *</label><input class="control" id="delivery-phone" formControlName="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="9 dígitos">@if(form.controls.phone.touched&&form.controls.phone.invalid){<small class="field-error">Ingresa un celular peruano de 9 dígitos.</small>}</div>
              <div class="field"><label for="delivery-zone">Distrito *</label><select class="control" id="delivery-zone" formControlName="district"><option value="">Selecciona tu distrito</option>@for(zone of zones;track zone.name){<option [value]="zone.name">{{zone.name}} · {{money(zone.fee)}}</option>}</select>@if(form.controls.district.touched&&form.controls.district.invalid){<small class="field-error">Selecciona un distrito de cobertura.</small>}</div>
              <div class="field"><label for="delivery-address">Dirección de entrega *</label><input class="control" id="delivery-address" formControlName="address" autocomplete="street-address" placeholder="Calle, número, departamento">@if(form.controls.address.touched&&form.controls.address.invalid){<small class="field-error">Ingresa una dirección completa.</small>}</div>
              <div class="field"><label for="delivery-reference">Referencia</label><input class="control" id="delivery-reference" formControlName="reference" placeholder="Ej. portón negro, junto al parque"></div>
              <div class="field"><label for="delivery-instructions">Indicaciones para el motorizado</label><textarea class="control" id="delivery-instructions" formControlName="instructions" rows="2" placeholder="Ej. llamar al llegar"></textarea></div>
              <div class="checkout-prices"><div><span>Subtotal</span><strong>{{money(subtotal())}}</strong></div><div><span>Costo de envío</span><strong>{{form.controls.district.value?money(fee()):'Selecciona distrito'}}</strong></div><div class="checkout-grand"><span>Total</span><strong>{{money(subtotal()+fee())}}</strong></div></div>
              <button class="btn btn-primary full-width checkout-submit" type="submit" [disabled]="!cart().length"><span class="material-symbols-rounded">check_circle</span> Confirmar pedido</button><p class="checkout-note">Confirmaremos tu pedido para prepararlo y asignarlo a un motorizado.</p>
            </form>
          </aside>
        </div>
      </main>
      <button class="mobile-cart-bar" type="button" (click)="scrollTo('tu-pedido')" [class.has-items]="itemCount() > 0" [attr.aria-label]="'Ver pedido, '+itemCount()+' productos, total '+money(subtotal())">
        <span class="mobile-cart-icon"><span class="material-symbols-rounded">shopping_bag</span><b>{{itemCount()}}</b></span>
        <span><strong>{{itemCount() ? 'Ver mi pedido' : 'Tu pedido está vacío'}}</strong><small>{{itemCount() ? itemCount() + (itemCount() === 1 ? ' producto' : ' productos') : 'Elige algo de la carta'}}</small></span>
        <span class="mobile-cart-total">{{money(subtotal())}} <span class="material-symbols-rounded">arrow_upward</span></span>
      </button>
      <footer class="customer-footer"><span>{{store.settings().name}}</span><span>Preparado con cariño, entregado a tu puerta.</span></footer>
    </div>
  `,
})
export class CustomerOrderPage {
  readonly store = inject(RestaurantStore);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly money = money;
  readonly zones = zones;
  readonly query = signal('');
  readonly category = signal(0);
  readonly cart = signal<OrderItem[]>([]);
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
    district: ['', Validators.required],
    address: ['', [Validators.required, Validators.minLength(8)]],
    reference: [''],
    instructions: [''],
  });
  readonly filtered = computed(() => this.store.dishes().filter(d => d.available && (!this.category() || d.categoryId === this.category()) && d.name.toLowerCase().includes(this.query().trim().toLowerCase())));
  readonly itemCount = computed(() => this.cart().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() => this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0));
  readonly district = signal('');
  readonly fee = computed(() => zones.find(zone => zone.name === this.district())?.fee ?? 0);
  constructor() { this.form.controls.district.valueChanges.subscribe(value => this.district.set(value)); }
  categoryName(id: number) { return this.store.categories().find(category => category.id === id)?.name ?? 'Especialidad'; }
  add(dish: Dish) { this.cart.update(items => items.some(item => item.dishId === dish.id) ? items.map(item => item.dishId === dish.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { dishId: dish.id, name: dish.name, price: dish.price, quantity: 1 }]); toast(`${dish.name} agregado`, 'info'); }
  change(id: number, amount: number) { this.cart.update(items => items.map(item => item.dishId === id ? { ...item, quantity: item.quantity + amount } : item).filter(item => item.quantity > 0)); }
  remove(id: number) { this.cart.update(items => items.filter(item => item.dishId !== id)); }
  scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  submit() {
    this.form.markAllAsTouched();
    if (!this.cart().length) { toast('Agrega al menos un plato', 'error'); return; }
    if (this.form.invalid) { toast('Revisa tus datos de entrega', 'error'); return; }
    const { name, phone, district, address, reference, instructions } = this.form.getRawValue();
    const order = this.store.createDeliveryOrder(name.trim(), this.cart(), { phone: phone.trim(), district, address: address.trim(), reference: reference.trim(), instructions: instructions.trim(), fee: this.fee() });
    void this.router.navigate(['/ordenar/confirmacion', order.id]);
  }
  fallback(event: Event) { (event.target as HTMLImageElement).src = FALLBACK_IMAGE; }
}
