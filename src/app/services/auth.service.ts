import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, switchMap } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { LoginRequest, LoginResponse, TokenRequest, TokenResponse, ProfileResponse, CommonApiParams } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiBaseService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(http: HttpClient) {
    super(http);
    // メモリに保存されたトークンは初期化時にクリア
    this.accessToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * ログイン（Dynamic Token認証）
   * @param loginData ログイン情報
   * @param params 共通パラメータ
   * @returns アクセストークン
   */
  login(loginData: LoginRequest, params?: CommonApiParams): Observable<TokenResponse> {
    loginData.login_save = loginData.login_save ?? 1;
    
    // 1. ログインしてgrant_tokenを取得
    return this.post<LoginResponse>('/rcms-api/7/login', loginData, params, this).pipe(
      switchMap((loginResponse: LoginResponse) => {
        // 2. grant_tokenを使ってアクセストークンを取得
        const tokenRequest: TokenRequest = {
          grant_token: loginResponse.grant_token
        };
        return this.post<TokenResponse>('/rcms-api/7/token', tokenRequest, params, this);
      }),
      map((tokenResponse: TokenResponse) => {
        // 3. アクセストークンを保存
        this.setAccessToken(tokenResponse.access_token.value, tokenResponse.access_token.expiresAt);
        return tokenResponse;
      })
    );
  }

  /**
   * ユーザープロフィール取得
   * @param params 共通パラメータ
   * @returns プロフィール情報
   */
  getProfile(params?: CommonApiParams): Observable<ProfileResponse> {
    return this.get<ProfileResponse>('/rcms-api/7/profile', params, this);
  }

  /**
   * ログアウト
   * @param params 共通パラメータ
   * @returns ログアウトレスポンス
   */
  logout(params?: CommonApiParams): Observable<any> {
    // ログアウトAPIを呼び出してからアクセストークンをクリア
    return this.post<any>('/rcms-api/7/logout', {}, params, this).pipe(
      map((response) => {
        // API呼び出し成功後にアクセストークンをクリア
        this.clearAccessToken();
        return response;
      }),
      catchError((error) => {
        // エラーが発生してもアクセストークンをクリア
        this.clearAccessToken();
        throw error;
      })
    );
  }

  /**
   * 認証状態をチェック
   */
  checkAuthStatus(): Observable<boolean> {
    if (!this.isTokenValid()) {
      return of(false);
    }
    
    return this.getProfile().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * アクセストークンを取得
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * アクセストークンが有効かチェック
   */
  isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiresAt) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return this.tokenExpiresAt > now;
  }

  /**
   * アクセストークンを設定
   */
  private setAccessToken(token: string, expiresAt: number): void {
    this.accessToken = token;
    this.tokenExpiresAt = expiresAt;
    
    // メモリにのみ保存（localStorageは使用しない）
  }

  /**
   * アクセストークンをクリア
   */
  private clearAccessToken(): void {
    this.accessToken = null;
    this.tokenExpiresAt = null;
    
    // メモリから削除（localStorageは使用しない）
  }

}