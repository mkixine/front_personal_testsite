import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { AuthService } from '../../services/auth.service';
import { MemberService } from '../../services/member.service';
import { CategoryService } from '../../services/category.service';
import { ContentResponse, ContentRequest, ContentLiquidationRequest, ContentListParams, LiquidationItem } from '../../models/api.types';
import { ContentModalComponent } from '../../components/content-modal/content-modal.component';

interface SummaryItem  {
    creditorId: number|string,
    liquidatorId: number|string,
    totalAmount: number,
    id: (number|string)[]
}
  
@Component({
  selector: 'app-settlement',
  standalone: true,
  imports: [CommonModule, FormsModule, ContentModalComponent],
  templateUrl: './settlement.component.html',
  styles: []
})
export class SettlementComponent implements OnInit {
  contentList: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // モーダル関連
  showModal: boolean = false;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  modalData: ContentRequest & {liquidation: LiquidationItem[]} = {
    subject: '',
    amount: '',
    purpose: '',
    ymd: '',
    contents_type: 27,
    topics_flg: 1,
    open_flg: 1,
    creditor: 0,
    finished: "0",
    // 清算者情報を初期化
    liquidation: []
  };
  editingContentId: string = '';
  
  // 展開状態管理
  expandedContentIndex: number | null = null;
  
  // メンバーとカテゴリのキャッシュ
  members: any[] = [];
  categories: any[] = [];
  
  // フィルター状態
  currentFilter: 'all' | 'unpaid' | 'paid' = 'unpaid';

  constructor(
    private contentService: ContentService,
    private authService: AuthService,
    private memberService: MemberService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 認証チェック
    this.checkAuthAndLoadContent();
    // メンバーとカテゴリを読み込み
    this.loadMembers();
    this.loadCategories();
  }

  private checkAuthAndLoadContent(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.loadContentList();
      },
      error: (error) => {
        console.log('未ログイン状態です:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  private loadContentList(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // フィルターパラメータを設定
    const params: ContentListParams = {};
    if (this.currentFilter === 'unpaid') {
      params.filter = 'finished nin [1]';
    } else if (this.currentFilter === 'paid') {
      params.filter = 'finished in [1]';
    }

    this.contentService.getContentList(params).subscribe({
      next: (response) => {
        this.contentList = response.list || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('コンテンツ一覧取得エラー:', error);
        this.errorMessage = 'コンテンツ一覧の取得に失敗しました。';
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalData = {
      subject: '',
      amount: '',
      purpose: '',
      ymd: '',
      contents_type: 27,
      topics_flg: 1,
      open_flg: 1,
      creditor: 0, // 新規作成時は未選択
      finished: "0",
      // 清算者情報を初期化
      liquidation: []
    };
    this.showModal = true;
  }

  openEditModal(content: any): void {
    this.isEditMode = true;
    this.editingContentId = content.topics_id || content.id;
    this.modalData = {
      subject: content.subject || '',
      amount: content.amount || '',
      purpose: content.purpose || '',
      ymd: content.ymd || '',
      contents_type: content.contents_type,
      topics_flg: 1,
      open_flg: 1,
      creditor: content.creditor?.module_id || 0, // 既存のcreditorまたはデフォルト値
      finished: content.finished?.key || "0",
      // liquidation配列をそのまま渡す
      liquidation: content.liquidation || []
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.editingContentId = '';
    this.modalData = {
      subject: '',
      amount: '',
      purpose: '',
      ymd: '',
      contents_type: 27,
      topics_flg: 1,
      open_flg: 1,
      creditor: 0,
      finished: "0",
      // 清算者情報を初期化
      liquidation: []
    };
  }

  onModalSubmit(modalData: ContentRequest): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    if (this.isEditMode) {
      // 更新処理
      this.contentService.updateContent(this.editingContentId, modalData).subscribe({
        next: (response) => {
          console.log('更新成功:', response);
          this.closeModal();
          this.loadContentList();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('更新エラー:', error);
          this.errorMessage = '更新に失敗しました。';
          this.isSubmitting = false;
        }
      });
    } else {
      // 作成処理
      this.contentService.createContent(modalData).subscribe({
        next: (response) => {
          console.log('作成成功:', response);
          this.closeModal();
          this.loadContentList();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('作成エラー:', error);
          this.errorMessage = '作成に失敗しました。';
          this.isSubmitting = false;
        }
      });
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('ログアウト完了:', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('ログアウトエラー:', error);
        // エラーが発生してもログイン画面に遷移
        this.router.navigate(['/login']);
      }
    });
  }

  // 展開状態の切り替え
  toggleContentExpansion(index: number): void {
    this.expandedContentIndex = this.expandedContentIndex === index ? null : index;
  }

  // メンバー一覧を読み込み
  private loadMembers(): void {
    this.memberService.getMemberList().subscribe({
      next: (response) => {
        this.members = response.list || [];
      },
      error: (error) => {
        console.error('メンバー一覧の取得に失敗しました:', error);
      }
    });
  }

  // カテゴリ一覧を読み込み
  private loadCategories(): void {
    this.categoryService.getCategoryList().subscribe({
      next: (response) => {
        this.categories = response.list || [];
      },
      error: (error) => {
        console.error('カテゴリ一覧の取得に失敗しました:', error);
      }
    });
  }

  // メンバー名を取得
  getMemberName(memberId: number): string {
    const member = this.members.find(m => m.member_id === memberId);
    return member ? member.nickname : '不明';
  }

  // カテゴリ名を取得
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.topics_category_id == categoryId);
    return category ? category.category_nm : '不明';
  }

  // 未精算の清算者を取得
  getUnpaidLiquidators(content: any): any[] {
    if (!content.liquidation || !Array.isArray(content.liquidation)) {
      return [];
    }
    return content.liquidation.filter((item: any) => {
      const paid = typeof item.paid === 'object' ? item.paid?.key : item.paid;
      return paid === '0' || paid === 0;
    });
  }

  // 未精算の清算者名を取得
  getUnpaidLiquidatorNames(content: any): string {
    const unpaidLiquidators = this.getUnpaidLiquidators(content);
    return unpaidLiquidators.map(l => this.getMemberName(l.payer?.module_id)).join(', ');
  }

  // フィルターを設定
  setFilter(filter: 'all' | 'unpaid' | 'paid'): void {
    this.currentFilter = filter;
    this.expandedContentIndex = null; // 展開状態をリセット
    this.loadContentList(); // APIを再呼び出し
  }

  // フィルタリングされたコンテンツリストを取得（APIから取得したデータをそのまま返す）
  getFilteredContentList(): any[] {
    return this.contentList;
  }

  // 全体清算状況サマリーを取得
  getOverallSettlementSummary(): any[] {
    const summaryMap = new Map<string, SummaryItem>();

    this.contentList.forEach(content => {
      if (!content.liquidation || !Array.isArray(content.liquidation)) {
        return;
      }

      const creditorId = content.creditor?.module_id;
      if (!creditorId) {
        return;
      }

      content.liquidation.forEach((liquidation: any) => {
        const paid = typeof liquidation.paid === 'object' ? liquidation.paid?.key : liquidation.paid;
        
        // 未清算の場合のみ集計
        if (paid === '0' || paid === 0) {
          const liquidatorId = liquidation.payer?.module_id;
          if (!liquidatorId) {
            return;
          }

          const key = `${creditorId}-${liquidatorId}`;
          const amount = parseInt(liquidation.payment) || 0;

          if (summaryMap.has(key)) {
            const existing = summaryMap.get(key) as SummaryItem;
            existing.totalAmount += amount;
            existing.id.push(content.topics_id);
          } else {
            summaryMap.set(key, {
              creditorId,
              liquidatorId,
              totalAmount: amount,
              id: [content.topics_id]
            });
          }
        }
      });
    });

    const sortedSummary = Array.from(summaryMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
    
    const sortedMergedSummary = sortedSummary.reduce((acc: SummaryItem[], summary: SummaryItem) => {
      const reversedSummary = acc.find(s => s.liquidatorId === summary.creditorId && s.creditorId === summary.liquidatorId);
      if (reversedSummary) {
        reversedSummary.totalAmount -= summary.totalAmount;
        reversedSummary.id.push(...summary.id);
      } else {
        acc.push({...summary});
      }
      return acc;
    }, [] as SummaryItem[]);
    return sortedMergedSummary;
  }

  // サマリー行の一括清算処理
  markSummaryAsPaid(summary: any): void {
    if (this.isSubmitting) return;

    // 確認ダイアログ
    const liquidatorName = this.getMemberName(summary.liquidatorId);
    const creditorName = this.getMemberName(summary.creditorId);
    const amount = summary.totalAmount;
    const count = summary.id.length;
    const confirmed = confirm(`${liquidatorName} → ${creditorName}の${amount}円（${count}件）を一括で清算済みにしますか？`);
    
    if (!confirmed) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    // 対象のコンテンツIDを取得
    const targetContentIds = summary.id;
    let completedUpdates = 0;
    const totalUpdates = targetContentIds.length;

    // 各コンテンツを順次更新
    targetContentIds.forEach((contentId: string) => {
      const content = this.contentList.find(c => c.topics_id === contentId || c.id === contentId);
      if (!content) {
        completedUpdates++;
        if (completedUpdates === totalUpdates) {
          this.isSubmitting = false;
          this.loadContentList();
        }
        return;
      }

      // 該当する清算者（liquidatorId）の清算データを更新
      const updatedLiquidation = content.liquidation.map((liquidation: any) => {
        const liquidatorId = liquidation.payer?.module_id;
        if (liquidatorId === summary.liquidatorId) {
          return {
            ...liquidation,
            paid: { key: '1', label: '清算済' }
          };
        } else if (liquidatorId === summary.creditorId && content.creditor?.module_id === summary.liquidatorId) {
          // 逆方向の清算も清算済みにする
          return {
            ...liquidation,
            paid: { key: '1', label: '清算済' }
          }
        }
        return liquidation;
      });

      // 全ての清算が完了したかチェック
      const allPaid = updatedLiquidation.every((item: any) => {
        const paid = typeof item.paid === 'object' ? item.paid?.key : item.paid;
        return paid === '1' || paid === 1;
      });

      // 更新データを準備
      const updateData: ContentLiquidationRequest = {
        finished: allPaid ? "1" : "0", // 全て清算済みの場合は清算完了フラグも更新
        paid: updatedLiquidation.map((item: any) => item.paid.key.toString())
      };

      // APIで更新
      this.contentService.updateContent(contentId, updateData).subscribe({
        next: (response) => {
          console.log(`コンテンツ${contentId}の清算更新成功:`, response);
          completedUpdates++;
          
          // 全ての更新が完了したらデータを再読み込み
          if (completedUpdates === totalUpdates) {
            this.isSubmitting = false;
            this.loadContentList();
          }
        },
        error: (error) => {
          console.error(`コンテンツ${contentId}の清算更新エラー:`, error);
          this.errorMessage = '清算状態の更新に失敗しました。';
          this.isSubmitting = false;
        }
      });
    });
  }

}
