import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { LoginRequest, LoginResponse, ProfileResponse, CommonApiParams } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiBaseService {

  /**
   * ログイン
   * @param loginData ログイン情報
   * @param params 共通パラメータ
   * @returns ログインレスポンス
   */
  login(loginData: LoginRequest, params?: CommonApiParams): Observable<LoginResponse> {
    loginData.login_save = loginData.login_save ?? 1;
    return this.post<LoginResponse>('/rcms-api/7/login', loginData, params);
  }

  /**
   * ユーザープロフィール取得
   * @param params 共通パラメータ
   * @returns プロフィール情報
   */
  getProfile(params?: CommonApiParams): Observable<ProfileResponse> {
    return this.get<ProfileResponse>('/rcms-api/7/profile', params);
  }

  /**
   * ログアウト
   * @param params 共通パラメータ
   * @returns ログアウトレスポンス
   */
  logout(params?: CommonApiParams): Observable<any> {
    return this.post<any>('/rcms-api/7/logout', {}, params);
  }
}
