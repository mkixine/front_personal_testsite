import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { 
  ContentRequest, 
  ContentResponse, 
  ContentListParams, 
  CommonApiParams, 
  ContentLiquidationRequest
} from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class ContentService extends ApiBaseService {

  /**
   * コンテンツ作成
   * @param contentData コンテンツデータ
   * @param params 共通パラメータ
   * @returns 作成レスポンス
   */
  createContent(contentData: ContentRequest, params?: CommonApiParams): Observable<ContentResponse> {
    return this.post<ContentResponse>('/rcms-api/7/insert', contentData, params);
  }

  /**
   * コンテンツ一覧取得
   * @param params 一覧取得パラメータ
   * @returns コンテンツ一覧
   */
  getContentList(params?: ContentListParams): Observable<ContentResponse> {
    return this.get<ContentResponse>('/rcms-api/7/list', params);
  }

  /**
   * コンテンツ更新
   * @param topicsId トピックID
   * @param contentData 更新データ
   * @param params 共通パラメータ
   * @returns 更新レスポンス
   */
  updateContent(
    topicsId: string, 
    contentData: ContentRequest | ContentLiquidationRequest, 
    params?: CommonApiParams
  ): Observable<ContentResponse> {
    return this.post<ContentResponse>(`/rcms-api/7/update/${topicsId}`, contentData, params);
  }

}