import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserRole, roles } from '../core/models';
import { RestaurantStore, toast } from '../core/store';

@Component({
  selector: 'app-user-editor',
  imports: [ReactiveFormsModule, RouterLink],
  template: `<div class="page"><div class="page-heading"><div><a routerLink="/usuarios" class="back-link"><span class="material-symbols-rounded">arrow_back</span> Volver a usuarios</a><h1>{{id?'Editar usuario':'Nuevo usuario'}}</h1><p>{{id?'Actualiza la información de este miembro.':'Agrega un nuevo miembro a tu equipo.'}}</p></div></div><form class="surface form-card narrow-form" [formGroup]="form" (ngSubmit)="save()"><div class="section-heading"><div><h2>Datos del colaborador</h2><p>Información de contacto y función en el restaurante</p></div></div><div class="form-grid"><div class="field"><label for="first-name">Nombre <span class="required">*</span></label><input id="first-name" class="control" formControlName="firstName" placeholder="Ej. María">@if(invalid('firstName')){<small class="field-error">Ingresa un nombre válido.</small>}</div><div class="field"><label for="last-name">Apellidos <span class="required">*</span></label><input id="last-name" class="control" formControlName="lastName" placeholder="Ej. Rojas">@if(invalid('lastName')){<small class="field-error">Ingresa los apellidos.</small>}</div><div class="field"><label for="user-email">Correo electrónico <span class="required">*</span></label><input id="user-email" type="email" class="control" formControlName="email" placeholder="nombre@restaurante.com">@if(invalid('email')){<small class="field-error">Ingresa un correo válido.</small>}</div><div class="field"><label for="user-phone">Teléfono <span class="required">*</span></label><input id="user-phone" class="control" formControlName="phone" placeholder="987 654 321">@if(invalid('phone')){<small class="field-error">Ingresa un teléfono.</small>}</div><div class="field"><label for="user-role">Rol <span class="required">*</span></label><select id="user-role" class="control" formControlName="role">@for(role of roles;track role){<option [value]="role">{{role}}</option>}</select></div><div class="field full"><label class="switch-row"><input type="checkbox" formControlName="active"><span class="switch"></span><span><strong>Colaborador activo</strong><small>Disponible para aparecer en las operaciones del restaurante.</small></span></label></div></div><div class="form-actions"><a routerLink="/usuarios" class="btn btn-secondary">Cancelar</a><button type="submit" class="btn btn-primary"><span class="material-symbols-rounded">save</span>{{id?'Guardar cambios':'Crear usuario'}}</button></div></form></div>`,
})
export class UserEditorPage {
  readonly store = inject(RestaurantStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly roles = roles;
  readonly id = Number(this.route.snapshot.paramMap.get('id')) || 0;
  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    role: ['Mesero' as UserRole, Validators.required],
    active: [true],
  });
  constructor() { const user = this.store.users().find(item => item.id === this.id); if (user) this.form.patchValue(user); }
  invalid(name: keyof typeof this.form.controls) { const control = this.form.controls[name]; return control.touched && control.invalid; }
  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const data = this.form.getRawValue();
    if (this.store.users().some(user => user.email.toLowerCase() === data.email.toLowerCase() && user.id !== this.id)) { toast('Este correo ya está registrado', 'error'); return; }
    this.store.upsertUser(data, this.id || undefined);
    toast(this.id ? 'Usuario actualizado' : 'Usuario creado correctamente');
    void this.router.navigateByUrl('/usuarios');
  }
}
