import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CalendarEventCreateRequest {
  title: string;
  description?: string;
  from: string;
  to: string;
  allDay?: boolean;
  isGlobal?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {
  constructor(private http: HttpClient) {}

  createEvent(payload: CalendarEventCreateRequest): Observable<void> {
    const endpoint = environment.googleCalendarEventApiUrl.trim();
    if (!endpoint) {
      return throwError(() => new Error('予定追加APIのURLが未設定です。'));
    }

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const token = environment.googleCalendarEventApiToken.trim();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<void>(endpoint, payload, { headers }).pipe(
      timeout(environment.apiTimeout),
      catchError(() => throwError(() => new Error('予定の追加に失敗しました。API設定を確認してください。')))
    );
  }
}
