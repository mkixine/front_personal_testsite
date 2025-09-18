import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { MemberListParams, MemberResponse } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class MemberService extends ApiBaseService {

  /**
   * メンバー一覧取得
   * @param params 一覧取得パラメータ
   * @returns メンバー一覧
   */
  getMemberList(params?: MemberListParams): Observable<MemberResponse> {
    return this.get<MemberResponse>('/rcms-api/7/members', params);
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
}
