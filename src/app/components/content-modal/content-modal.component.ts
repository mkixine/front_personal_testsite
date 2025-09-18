import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ContentRequest, MemberItem, CategoryItem, PayerInfo, PaidStatus, LiquidationItem } from '../../models/api.types';
import { MemberService } from '../../services/member.service';
import { CategoryService } from '../../services/category.service';

interface LiquidationGroup {
  payer: number;
  rate: string;
  payment: string;
  paid: number;
}

@Component({
  selector: 'app-content-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-modal.component.html',
  styles: []
})
export class ContentModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() isSubmitting: boolean = false;
  @Input() modalData: ContentRequest & {liquidation: LiquidationItem[]} = {
      subject: '',
      amount: '',
      purpose: '',
      ymd: '',
      contents_type: 0,
      topics_flg: 1,
      open_flg: 1,
      creditor: 0,
      finished: "0",
      liquidation: []
    };

  @Output() modalSubmit = new EventEmitter<ContentRequest>();
  @Output() modalClose = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  
  members: MemberItem[] = [];
  categories: CategoryItem[] = [];
  liquidationGroups: LiquidationGroup[] = [];
  maxGroups = 3;

  constructor(
    private memberService: MemberService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.loadCategories();
    this.initializeDate();
    this.initializeFinishedFlag();
    this.initializeLiquidationGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // modalDataが変更された場合の処理
    if (changes['modalData']) {
      if (!this.isEditMode) {
        // 新規作成時は支払い者を0にリセット
        this.modalData.creditor = 0;
        this.initializeDate();
        this.initializeFinishedFlag();
        this.initializeLiquidationGroups();
      } else {
        // 編集時は既存の清算者情報を設定
        this.initializeLiquidationGroupsFromModalData();
      }
    }
  }

  private loadMembers(): void {
    this.memberService.getMemberList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.members = response.list || [];
          console.log('取得されたメンバー一覧:', this.members);
          console.log('メンバーID一覧:', this.members.map(m => m.member_id));
        },
        error: (error) => {
          console.error('メンバー一覧の取得に失敗しました:', error);
        }
      });
  }

  private loadCategories(): void {
    this.categoryService.getCategoryList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.list || [];
        },
        error: (error) => {
          console.error('カテゴリ一覧の取得に失敗しました:', error);
        }
      });
  }

  private initializeLiquidationGroups(): void {
    this.liquidationGroups = [
      { 
        payer: 0, 
        rate: '', 
        payment: '', 
        paid: 0 
      }
    ];
  }

  private initializeLiquidationGroupsFromModalData(): void {
    console.log('編集モード: 既存の清算者情報を初期化');
    console.log('modalData.liquidation:', this.modalData.liquidation);

    this.liquidationGroups = [];

    // liquidation配列から清算グループを構築
    if (this.modalData.liquidation && Array.isArray(this.modalData.liquidation)) {
      this.modalData.liquidation.forEach((item: any) => {
        const group: LiquidationGroup = {
          payer: item.payer?.module_id || 0,
          rate: item.rate || '',
          payment: item.payment || '',
          paid: typeof item.paid === 'object' && item.paid?.key ? parseInt(item.paid.key) : (parseInt(item.paid) || 0)
        };
        this.liquidationGroups.push(group);
      });
    }

    // 清算グループが空の場合は初期化
    if (this.liquidationGroups.length === 0) {
      this.initializeLiquidationGroups();
    }

    console.log('初期化された清算グループ:', this.liquidationGroups);
  }

  private getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private initializeDate(): void {
    // 新規作成時のみ今日の日付を自動設定
    if (!this.isEditMode) {
      this.modalData.ymd = this.getTodayDateString();
    }
  }

  private initializeFinishedFlag(): void {
    // 新規作成時のみ清算完了フラグを未清算に設定
    if (!this.isEditMode) {
      this.modalData.finished = "0";
    }
  }

  onCategoryChange(): void {
    // カテゴリ変更時はプリセットしない
    // 支払い者も設定されている場合のみプリセットを実行
    this.checkAndPresetLiquidationGroups();
  }

  onAmountChange(): void {
    // 清算総額変更時もプリセットを実行
    this.checkAndPresetLiquidationGroups();
  }

  onRateChange(index: number): void {
    // 清算割合変更時に清算金額を再計算
    const group = this.liquidationGroups[index];
    if (group && group.rate && this.modalData.amount) {
      const rate = parseFloat(group.rate);
      const amount = parseFloat(this.modalData.amount);
      if (!isNaN(rate) && !isNaN(amount)) {
        group.payment = Math.round(rate * amount / 100).toString();
        console.log(`清算者${index + 1}の清算金額を再計算: ${group.payment}`);
      }
    }
  }

  onPaidChange(): void {
    // 清算済みフラグ変更時に清算完了フラグを更新
    this.updateFinishedFlag();
  }

  private updateFinishedFlag(): void {
    // すべての清算者が清算済みかチェック
    const allPaid = this.liquidationGroups.every(group => group.paid == 1);
    
    if (allPaid) {
      this.modalData.finished = "1";
      console.log('すべての清算者が清算済みのため、清算完了フラグを清算済みに設定');
    } else {
      this.modalData.finished = "0";
      console.log('未清算の清算者がいるため、清算完了フラグを未清算に設定');
    }
  }

  private checkAndPresetLiquidationGroups(): void {
    console.log('プリセット条件チェック - カテゴリ:', this.modalData.contents_type, '支払い者:', this.modalData.creditor, '清算総額:', this.modalData.amount);
    
    // 編集モードの場合はプリセットを実行しない
    if (this.isEditMode) {
      console.log('編集モードのためプリセットをスキップ');
      return;
    }
    
    // カテゴリと支払い者の両方が設定されている場合のみプリセットを実行
    if (!this.modalData.contents_type || typeof this.modalData.creditor !== 'number' || !this.modalData.creditor) {
      console.log('プリセット条件を満たしていません');
      return;
    }
    
    const selectedCategory = this.categories.find(cat => cat.topics_category_id === this.modalData.contents_type);
    console.log('選択されたカテゴリ:', selectedCategory);
    
    if (selectedCategory?.ext_col_01) {
      console.log('ext_col_01の値:', selectedCategory.ext_col_01);
      try {
        const presetData = JSON.parse(selectedCategory.ext_col_01);
        console.log('プリセットデータ:', presetData);
        this.presetLiquidationGroups(presetData);
      } catch (error) {
        console.error('カテゴリのプリセットデータの解析に失敗しました:', error);
        this.initializeLiquidationGroups();
      }
    } else {
        console.log('プリセットデータルールなし');
        this.presetLiquidationGroups({});
    }
  }

  private presetLiquidationGroups(presetData: any): void {
    console.log('プリセット実行開始');
    // 1番目の清算者（支払い者）を先に設定
    
    const creditorRate = Object.entries(presetData).find(([memberId]) => parseInt(memberId) === this.modalData.creditor as number)?.[1] as number ?? 0;
    const amount = this.modalData.amount ? parseInt(this.modalData.amount) : 0;
    this.liquidationGroups = [{
      payer: this.modalData.creditor as number,
      rate: creditorRate.toString(),
      payment: creditorRate && amount ? Math.round(creditorRate * amount / 100).toString() : '',
      paid: 1 // 支払い者は自動的に清算済み as string
    }];
    
    // 支払い者を除外したプリセットデータを取得
    const creditorId = this.modalData.creditor as number;
    const filteredPresetData = Object.entries(presetData).filter(([memberId]) => 
      parseInt(memberId) !== creditorId
    );
    
    // 2番目以降の清算者をプリセットデータから設定（支払い者を除外）
    filteredPresetData.forEach(([memberId, rate]) => {
      if (this.liquidationGroups.length < this.maxGroups) {
        const payerRate =  parseInt(rate as string) ?? 0;
    
        this.liquidationGroups.push({
          payer: parseInt(memberId),
          rate: (rate as any).toString(),
          payment: payerRate && amount ? Math.round(payerRate * amount / 100).toString() : '',
          paid: 0
        });
      }
    });
    console.log('プリセット完了:', this.liquidationGroups);
  }

  onCreditorChange(): void {
    // 文字列から数値に変換
    const creditorId = typeof this.modalData.creditor === 'string' ? parseInt(this.modalData.creditor) : this.modalData.creditor;
    this.modalData.creditor = creditorId;
    
    console.log('支払い者変更:', this.modalData.creditor);
    console.log('現在の清算グループ:', this.liquidationGroups);
    
    // 編集モードの場合は自動設定をスキップ
    if (this.isEditMode) {
      console.log('編集モードのため自動設定をスキップ');
      return;
    }
    
    // 支払い者が0の場合は処理をスキップ
    if (this.modalData.creditor === 0) {
      console.log('支払い者が未選択のため処理をスキップ');
      return;
    }
    
    // 清算グループが空の場合は初期化
    if (this.liquidationGroups.length === 0) {
      this.initializeLiquidationGroups();
    }
    
    // 1番目の清算者に支払い者を自動設定
    if (this.liquidationGroups.length > 0 && typeof this.modalData.creditor === 'number') {
      this.liquidationGroups[0].payer = this.modalData.creditor;
      this.liquidationGroups[0].paid = 1;
      console.log('1番目の清算者を更新:', this.liquidationGroups[0]);
    }
    
    // カテゴリと支払い者の両方が設定されている場合、プリセットを実行
    this.checkAndPresetLiquidationGroups();
  }

  addLiquidationGroup(): void {
    if (this.liquidationGroups.length < this.maxGroups) {
      this.liquidationGroups.push({ payer: 0, rate: '', payment: '', paid: 0 });
      // 清算者追加後に清算完了フラグを更新
      this.updateFinishedFlag();
    }
  }

  removeLiquidationGroup(index: number): void {
    if (this.liquidationGroups.length > 1) {
      this.liquidationGroups.splice(index, 1);
      // 清算者削除後に清算完了フラグを更新
      this.updateFinishedFlag();
    }
  }

  getMemberName(memberId: number): string {
    const member = this.members.find(m => m.member_id === memberId);
    return member ? member.nickname : '';
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.topics_category_id === categoryId);
    return category ? category.category_nm : '';
  }

  onSubmit(): void {
    // 清算グループのデータをmodalDataに設定
    this.modalData.payer = this.liquidationGroups.map(group => ({
      module_type: 'member',
      module_id: parseInt(group.payer as unknown as string)
    }));

    this.modalData.rate = this.liquidationGroups.map(group => group.rate.toString());
    this.modalData.payment = this.liquidationGroups.map(group => group.payment.toString());
    this.modalData.paid = this.liquidationGroups.map(group => group.paid.toString());

    let submitModalData = this.modalData as ContentRequest & {liquidation?: LiquidationItem[]};
    delete submitModalData.liquidation;
    this.modalSubmit.emit(submitModalData);
  }

  closeModal(): void {
    this.modalClose.emit();
  }
}
