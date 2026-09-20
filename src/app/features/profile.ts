import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrentUserService, toast } from '../core/store';

@Component({selector:'app-profile',imports:[ReactiveFormsModule],template:`
<div class="page"><div class="page-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span> EQUIPO</div><h1>Perfil del administrador</h1><p>Actualiza los datos del perfil de demostración.</p></div></div>
<div class="profile-layout"><section class="surface profile-hero"><div class="profile-banner"></div><div class="profile-hero-body"><div class="avatar profile-avatar">{{initials}}</div><h2>{{current.user().firstName}} {{current.user().lastName}}</h2><p>{{current.user().email}}</p><span class="role-badge">{{current.user().role}}</span></div><div class="profile-meta"><div><span class="material-symbols-rounded">mail</span>{{current.user().email}}</div><div><span class="material-symbols-rounded">call</span>{{current.user().phone}}</div></div></section>
<form class="surface form-card" [formGroup]="form" (ngSubmit)="save()"><div class="section-heading"><div><h2>Información personal</h2><p>Datos que se muestran en el sistema</p></div></div><div class="form-grid"><div class="field"><label for="profile-first">Nombre</label><input id="profile-first" class="control" formControlName="firstName"></div><div class="field"><label for="profile-last">Apellidos</label><input id="profile-last" class="control" formControlName="lastName"></div><div class="field"><label for="profile-email">Correo</label><input id="profile-email" type="email" class="control" formControlName="email"></div><div class="field"><label for="profile-phone">Teléfono</label><input id="profile-phone" class="control" formControlName="phone"></div></div><div class="form-actions"><button type="submit" class="btn btn-primary"><span class="material-symbols-rounded">save</span>Guardar cambios</button></div></form></div></div>`})
export class ProfilePage {
  readonly current=inject(CurrentUserService);private fb=inject(FormBuilder);
  readonly form=this.fb.nonNullable.group({firstName:['',Validators.required],lastName:['',Validators.required],email:['',[Validators.required,Validators.email]],phone:['',Validators.required]});
  get initials(){const u=this.current.user();return `${u.firstName[0]??'A'}${u.lastName[0]??'A'}`;}
  constructor(){this.form.patchValue(this.current.user());}
  save(){this.form.markAllAsTouched();if(this.form.invalid){toast('Revisa los datos del perfil','error');return;}this.current.updateProfile({...this.current.user(),...this.form.getRawValue()});toast('Perfil actualizado correctamente');}
}
