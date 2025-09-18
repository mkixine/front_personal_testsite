import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  LoginRequest, 
  ContentRequest, 
  ContentListParams, 
  MemberListParams 
} from '../models/api.types';

/**
 * APIサービスの使用例
 * このファイルは参考用です。実際のコンポーネントで使用する際の例を示しています。
 */
@Injectable({
  providedIn: 'root'
})
export class ApiUsageExample {

  constructor(private api: ApiService) {}

  /**
   * ログインの例
   */
  loginExample(): Observable<any> {
    const loginData: LoginRequest = {
      email: 'user@example.com',
      password: 'password123',
      login_save: 1
    };

    return this.api.auth.login(loginData, {
      _output_format: 'json',
      _lang: 'ja'
    });
  }

  /**
   * プロフィール取得の例
   */
  getProfileExample(): Observable<any> {
    return this.api.auth.getProfile({
      _output_format: 'json',
      _lang: 'ja'
    });
  }

  /**
   * コンテンツ一覧取得の例
   */
  getContentListExample(): Observable<any> {
    const params: ContentListParams = {
      cnt: 10,
      pageID: 1,
      'contents_type[]': [27], // テスト清算ページ
    };

    return this.api.content.getContentList(params);
  }

  /**
   * コンテンツ更新の例
   */
  updateContentExample(topicsId: string): Observable<any> {
    const updateData: ContentRequest = {
      subject: '更新されたタイトル',
      amount: '5000',
      purpose: '更新された用途',
      ymd: new Date().toISOString().split('T')[0], // 今日の日付
      contents_type: 27,
      open_flg: 1,
      creditor: 1, // デフォルトのcreditor ID
      finished: "0",
      payer: [],
      rate: [],
      payment: [],
      paid: []      
    };

    return this.api.content.updateContent(topicsId, updateData);
  }

  /**
   * メンバー一覧取得の例
   */
  getMemberListExample(): Observable<any> {
    const params: MemberListParams = {
      cnt: 20,
      pageID: 1,
    };

    return this.api.member.getMemberList(params);
  }

  /**
   * 特定のメンバー情報取得の例
   */
  getSpecificMembersExample(): Observable<any> {
    return this.api.member.getMembersByIds([1, 2, 3], {
      cnt: 10
    });
  }
}
