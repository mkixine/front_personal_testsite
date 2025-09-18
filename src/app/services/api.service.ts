import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ContentService } from './content.service';
import { MemberService } from './member.service';

/**
 * メインAPIサービス
 * すべてのAPIサービスを統合して提供
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  constructor(
    public auth: AuthService,
    public content: ContentService,
    public member: MemberService
  ) {}
}
