import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-not-found',imports:[RouterLink],template:`<div class="not-found"><div class="brand-mark"><span class="material-symbols-rounded">restaurant</span></div><span class="error-number">404</span><h1>Esta página no está en el menú</h1><p>La ruta que buscas no existe o ya no está disponible.</p><a routerLink="/dashboard" class="btn btn-primary"><span class="material-symbols-rounded">arrow_back</span>Volver al inicio</a></div>`})
export class NotFoundPage {}
