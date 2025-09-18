// 認証関連の型定義
export interface LoginRequest {
  email: string;
  password: string;
  login_save?: 0 | 1;
}

export interface LoginResponse {
  // レスポンスの型は実際のAPIレスポンスに応じて調整
  [key: string]: any;
}

export interface ProfileResponse {
  // プロフィール情報の型は実際のAPIレスポンスに応じて調整
  [key: string]: any;
}

// コンテンツ関連の型定義
export interface ContentRequest {
  subject: string;
  slug?: string;
  contents_type?: number | number[];
  topics_flg?: 0 | 1;
  regular_flg?: number;
  open_flg?: 0 | 1 | 2;
  dispatch_github_workflow?: 0 | 1;
  secure_level?: number[];
  open_sta_ymdhi?: string;
  open_end_ymdhi?: string;
  ymd: string;
  creditor: CreditorInfo | number;
  purpose: string;
  amount: string;
  payer?: PayerInfo[];
  rate?: string[];
  payment?: string[];
  paid?: string[];
  finished: string;
  validate_only?: boolean;
  approvalflow_id?: number;
  _doc_waiting?: 1 | null;
}
export interface ContentLiquidationRequest {
    paid: string[];
    finished: string;
}
export interface CreditorInfo {
  module_type: string;
  module_id: number;
}

export interface PayerInfo {
  module_type: string;
  module_id: number;
}

export interface PaidStatus {
  key: '0' | '1';
  label: '未清算' | '清算済';
}

export interface FinishedStatus {
  key: '0' | '1';
  label: '未清算' | '清算済';
}

// 清算関連の型定義
export interface LiquidationItem {
  paid: PaidStatus | {};
  payer: PayerInfo;
  payment: string;
  rate: string;
}

export interface ContentItem {
  topics_id: number;
  ymd: string;
  contents_type: number;
  subject: string;
  topics_flg: number;
  open_flg: number;
  regular_flg: number;
  inst_ymdhi: string;
  update_ymdhi: string;
  topics_group_id: number;
  member_id: number;
  slug: string;
  order_no: number;
  col_sort: string;
  group_nm: string;
  group_description: string;
  contents_type_cnt: number;
  contents_type_nm: string;
  contents_type_slug: string | null;
  contents_type_parent_nm: string | null;
  category_parent_id: number | null;
  contents_type_ext_col_01: string | null;
  contents_type_ext_col_02: string | null;
  contents_type_ext_col_03: string | null;
  contents_type_ext_col_04: string | null;
  contents_type_ext_col_05: string | null;
  contents_type_list: number[];
  creditor: CreditorInfo;
  purpose: string;
  amount: string;
  liquidation: LiquidationItem[];
  finished: FinishedStatus | {};
}

export interface PageInfo {
  totalCnt: number;
}

// エラー関連の型定義
export interface ApiError {
  code: string;
  message: string;
}

export interface ContentResponse {
  errors: ApiError[];
  messages: any[];
  list: ContentItem[];
  pageInfo: PageInfo;
}

// コンテンツ一覧取得のパラメータ
export interface ContentListParams {
  cnt?: number;
  pageID?: number;
  filter?: string;
  custom_search_id?: number;
  'contents_type[]'?: (string | number)[];
  'category_parent_id[]'?: (string | number)[];
  'exclude_category_parent_id[]'?: (string | number)[];
}

// カテゴリ関連の型定義
export interface CategoryListParams {
  cnt?: number;
  pageID?: number;
}

export interface CategoryResponse {
  errors: ApiError[];
  messages: any[];
  list: CategoryItem[];
  pageInfo: PageInfo;
}

export interface CategoryItem {
  topics_category_id: number;
  category_nm: string;
  category_slug: string;
  category_parent_id: number | null;
  ext_col_01: string | null;
  ext_col_02: string | null;
  ext_col_03: string | null;
  ext_col_04: string | null;
  ext_col_05: string | null;
  [key: string]: any;
}

// メンバー関連の型定義
export interface MemberListParams {
  cnt?: number;
  pageID?: number;
  'id[]'?: number[];
  'group_id[]'?: number[];
  [key: string]: any;
}

export interface MemberItem {
  member_id: number;
  member_slug: string;
  nickname: string;
  email: string;
  [key: string]: any;
}

export interface MemberResponse {
  errors: ApiError[];
  messages: any[];
  list: MemberItem[];
  pageInfo: PageInfo;
}

// 共通のAPIパラメータ
export interface CommonApiParams {
  _output_format?: string;
  _lang?: string;
  _charset?: string;
}
