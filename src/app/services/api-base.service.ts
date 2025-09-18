import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiBaseService {
  private readonly baseUrl = 'https://mkixine-json.g.kuroco.app';

  constructor(private http: HttpClient) {}

  /**
   * GETリクエストを送信
   */
  protected get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<T>(url, { 
      params: httpParams,
      withCredentials: true // Cookieを送信
    });
  }

  /**
   * POSTリクエストを送信
   */
  protected post<T>(endpoint: string, body: any, params?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const httpParams = this.buildHttpParams(params);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<T>(url, body, { 
      headers, 
      params: httpParams,
      withCredentials: true // Cookieを送信
    });
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
}
