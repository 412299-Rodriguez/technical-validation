import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { AuthSession, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../../shared/models/auth.model';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'ficticia.auth.session';
  private readonly session$ = new BehaviorSubject<AuthSession | null>(null);

  constructor(private readonly http: HttpClient, @Inject(PLATFORM_ID) private readonly platformId: Object) {
    this.session$.next(this.restoreSession());
  }

  login(payload: LoginRequest): Observable<AuthSession> {
    const url = `${environment.apiBaseUrl}/api/auth/login`;
    return this.http.post<LoginResponse>(url, payload).pipe(
      tap((response) => {
        const session: AuthSession = {
          token: response.token,
          user: {
            email: response.username,
            name: response.username
          },
          roles: response.roles
        };
        this.setSession(session);
      }),
      map(() => this.session$.value as AuthSession)
    );
  }

  setSession(session: AuthSession | null): void {
    this.session$.next(session);
    if (!this.isBrowser()) {
      return;
    }
    if (session) {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  clearSession(): void {
    this.setSession(null);
  }

  logout(): void {
    this.clearSession();
  }

  isAuthenticated(): boolean {
    return !!this.session$.value;
  }

  getToken(): string | null {
    return this.session$.value?.token ?? null;
  }

  sessionChanges(): Observable<AuthSession | null> {
    return this.session$.asObservable();
  }

  get sessionSnapshot(): AuthSession | null {
    return this.session$.value;
  }

  private restoreSession(): AuthSession | null {
    if (!this.isBrowser()) {
      return null;
    }
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    const url = `${environment.apiBaseUrl}/api/auth/register`;
    return this.http.post<RegisterResponse>(url, payload);
  }
}
