import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'auth',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
      }
    ]
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./core/layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'persons',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/persons/pages/person-list/person-list.component').then(
                (m) => m.PersonListComponent
              )
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/persons/pages/person-form/person-form.component').then(
                (m) => m.PersonFormComponent
              )
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/persons/pages/person-detail/person-detail.component').then(
                (m) => m.PersonDetailComponent
              )
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
