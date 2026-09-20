import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme';
@Component({selector:'app-root',imports:[RouterOutlet],templateUrl:'./app.html'})
export class App { readonly theme = inject(ThemeService); }
