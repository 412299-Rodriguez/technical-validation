/**
 * Layout wrapper for authenticated pages, rendering the navbar plus nested routes.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {}
