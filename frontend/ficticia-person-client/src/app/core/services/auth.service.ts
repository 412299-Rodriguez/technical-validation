import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthSession } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly session$ = new BehaviorSubject<AuthSession | null>(null);

  setSession(session: AuthSession): void {
    this.session$.next(session);
  }

  clearSession(): void {
    this.session$.next(null);
  }

  /** Clears the current session so UI components can treat the user as logged out. */
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
}
