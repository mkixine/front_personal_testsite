import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { AuthService } from './auth.service';
import { MemberListParams, MemberResponse } from '../models/api.types';

export interface ProfileUpdateRequest {
  email?: string;
  login_pwd?: string;
  group_id?: number[];
  login_ok_flg?: number;
  validate_only?: boolean;
  auto_login?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService extends ApiBaseService {

  constructor(protected override http: HttpClient, private authService: AuthService) {
    super(http);
  }

  /**
   * メンバー一覧取得
   * @param params 一覧取得パラメータ
   * @returns メンバー一覧
   */
  getMemberList(params?: MemberListParams): Observable<MemberResponse> {
    return this.get<MemberResponse>('/rcms-api/7/members', params, this.authService);
  }

  /**
   * 特定のメンバー情報取得
   * @param memberIds メンバーID配列
   * @param params 追加パラメータ
   * @returns メンバー情報
   */
  getMembersByIds(memberIds: number[], params?: Omit<MemberListParams, 'id[]'>): Observable<MemberResponse> {
    const requestParams: MemberListParams = {
      'id[]': memberIds,
      ...params
    };
    return this.getMemberList(requestParams);
  }

  /**
   * 特定のグループのメンバー取得
   * @param groupIds グループID配列
   * @param params 追加パラメータ
   * @returns メンバー情報
   */
  getMembersByGroups(groupIds: number[], params?: Omit<MemberListParams, 'group_id[]'>): Observable<MemberResponse> {
    const requestParams: MemberListParams = {
      'group_id[]': groupIds,
      ...params
    };
    return this.getMemberList(requestParams);
  }

  /**
   * プロフィール更新
   * @param updateData 更新データ
   * @returns 更新結果
   */
  updateProfile(updateData: ProfileUpdateRequest): Observable<any> {
    return this.post<any>('/rcms-api/7/ipass', updateData, undefined, this.authService);
  }
}
