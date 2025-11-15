import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface NotificationMessage {
  type: 'success' | 'info' | 'warning' | 'error';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly messages$ = new Subject<NotificationMessage>();

  onMessage(): Observable<NotificationMessage> {
    return this.messages$.asObservable();
  }

  notify(message: NotificationMessage): void {
    this.messages$.next(message);
  }

  success(text: string): void {
    this.notify({ type: 'success', text });
  }

  error(text: string): void {
    this.notify({ type: 'error', text });
  }
}