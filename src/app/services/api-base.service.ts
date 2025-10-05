import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, retry, catchError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiBaseService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(protected http: HttpClient) {}

  /**
   * GETリクエストを送信
   */
  protected get<T>(endpoint: string, params?: any, authService?: AuthService): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.buildHeaders(authService);
    
    return this.http.get<T>(url, { 
      headers,
      params: httpParams
    }).pipe(
      timeout(environment.apiTimeout),
      retry(environment.maxRetryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * POSTリクエストを送信
   */
  protected post<T>(endpoint: string, body: any, params?: any, authService?: AuthService): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    const headers = this.buildHeaders(authService);
    
    return this.http.post<T>(url, body, { 
      headers, 
      params: httpParams
    }).pipe(
      timeout(environment.apiTimeout),
      retry(environment.maxRetryAttempts),
      catchError(this.handleError)
    );
  }

  /**
   * ヘッダーを構築
   */
  protected buildHeaders(authService?: AuthService): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // アクセストークンが有効な場合は追加
    if (authService && authService.isTokenValid()) {
      const accessToken = authService.getAccessToken();
      if (accessToken) {
        headers = headers.set('X-RCMS-API-ACCESS-TOKEN', accessToken);
      }
    }

    return headers;
  }

  /**
   * パラメータをHttpParamsに変換
   */
  private buildHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(item => {
              httpParams = httpParams.append(key, item.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }
    
    return httpParams;
  }

  /**
   * エラーハンドリング
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '予期しないエラーが発生しました。';
    
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      // クライアントサイドエラー
      errorMessage = `エラー: ${error.error.message}`;
    } else {
      // サーバーサイドエラー
      switch (error.status) {
        case 401:
          errorMessage = '認証に失敗しました。ログインし直してください。';
          break;
        case 403:
          errorMessage = 'アクセス権限がありません。';
          break;
        case 404:
          errorMessage = 'リソースが見つかりません。';
          break;
        case 500:
          errorMessage = 'サーバーエラーが発生しました。しばらく時間をおいて再試行してください。';
          break;
        default:
          errorMessage = `エラーが発生しました (${error.status})`;
      }
    }
    
    if (environment.enableLogging) {
      console.error('API Error:', error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
