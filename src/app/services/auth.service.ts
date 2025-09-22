import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, of } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { LoginRequest, LoginResponse, ProfileResponse, CommonApiParams } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiBaseService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private readonly currentUserSubject = new BehaviorSubject<ProfileResponse | null>(null);

  // リアクティブな状態管理
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  // Signal-based state
  private readonly authState = signal<{
    isAuthenticated: boolean;
    user: ProfileResponse | null;
  }>({
    isAuthenticated: false,
    user: null
  });

  public readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  public readonly currentUser = computed(() => this.authState().user);

  constructor(http: HttpClient) {
    super(http);
    this.initializeAuthState();
  }

  /**
   * 認証状態の初期化
   */
  private initializeAuthState(): void {
    // ブラウザ環境でのみローカルストレージから認証状態を復元
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedAuthState = localStorage.getItem('authState');
      if (savedAuthState) {
        try {
          const parsed = JSON.parse(savedAuthState);
          this.authState.set(parsed);
          this.isAuthenticatedSubject.next(parsed.isAuthenticated);
          this.currentUserSubject.next(parsed.user);
        } catch (error) {
          console.error('認証状態の復元に失敗:', error);
          this.clearAuthState();
        }
      }
    }
  }

  /**
   * ログイン
   * @param loginData ログイン情報
   * @param params 共通パラメータ
   * @returns ログインレスポンス
   */
  login(loginData: LoginRequest, params?: CommonApiParams): Observable<LoginResponse> {
    loginData.login_save = loginData.login_save ?? 1;
    return this.post<LoginResponse>('/rcms-api/7/login', loginData, params).pipe(
      tap((response) => {
        // ログイン成功時にプロフィールを取得
        this.getProfile().subscribe();
      }),
      catchError((error) => {
        this.clearAuthState();
        throw error;
      })
    );
  }

  /**
   * ユーザープロフィール取得
   * @param params 共通パラメータ
   * @returns プロフィール情報
   */
  getProfile(params?: CommonApiParams): Observable<ProfileResponse | null> {
    return this.get<ProfileResponse>('/rcms-api/7/profile', params).pipe(
      tap((profile) => {
        this.setAuthenticatedUser(profile);
      }),
      catchError((error) => {
        this.clearAuthState();
        return of(null);
      })
    );
  }

  /**
   * ログアウト
   * @param params 共通パラメータ
   * @returns ログアウトレスポンス
   */
  logout(params?: CommonApiParams): Observable<any> {
    return this.post<any>('/rcms-api/7/logout', {}, params).pipe(
      tap(() => {
        this.clearAuthState();
      }),
      catchError((error) => {
        // エラーが発生してもローカルの認証状態はクリア
        this.clearAuthState();
        throw error;
      })
    );
  }

  /**
   * 認証状態を設定
   */
  private setAuthenticatedUser(user: ProfileResponse): void {
    const authState = {
      isAuthenticated: true,
      user: user
    };
    
    this.authState.set(authState);
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
    
    // ブラウザ環境でのみローカルストレージに保存
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('authState', JSON.stringify(authState));
    }
  }

  /**
   * 認証状態をクリア
   */
  private clearAuthState(): void {
    const authState = {
      isAuthenticated: false,
      user: null
    };
    
    this.authState.set(authState);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    // ブラウザ環境でのみローカルストレージから削除
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('authState');
    }
  }

  /**
   * 認証状態をチェック
   */
  checkAuthStatus(): Observable<boolean> {
    return this.getProfile().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
