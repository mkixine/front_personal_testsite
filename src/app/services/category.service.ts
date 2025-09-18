import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { CategoryListParams, CategoryResponse, CommonApiParams } from '../models/api.types';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiBaseService {

  /**
   * カテゴリ一覧取得
   * @param params 一覧取得パラメータ
   * @returns カテゴリ一覧
   */
  getCategoryList(params?: CategoryListParams & CommonApiParams): Observable<CategoryResponse> {
    return this.get<CategoryResponse>('/rcms-api/7/categories', params);
  }
}
