import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md mx-auto">
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            プロフィール編集
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            メールアドレスとパスワードを変更できます
          </p>
        </div>

        <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- 現在のメールアドレス表示 -->
            <div *ngIf="currentEmail" class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                現在のメールアドレス
              </label>
              <div class="p-3 bg-gray-50 border border-gray-300 rounded-md">
                {{ currentEmail }}
              </div>
            </div>

            <!-- 新しいメールアドレス -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                新しいメールアドレス
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="新しいメールアドレスを入力"
              />
              <div *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
                <div *ngIf="profileForm.get('email')?.errors?.['required']">メールアドレスは必須です</div>
                <div *ngIf="profileForm.get('email')?.errors?.['email']">有効なメールアドレスを入力してください</div>
              </div>
            </div>

            <!-- パスワード変更セクション -->
            <div class="border-t border-gray-200 pt-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">パスワード変更</h3>
                <button
                  type="button"
                  (click)="togglePasswordChange()"
                  [class]="'px-4 py-2 rounded-md text-sm font-medium transition-colors ' + (showPasswordChange ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')"
                >
                  {{ showPasswordChange ? 'パスワード変更をキャンセル' : 'パスワード変更する' }}
                </button>
              </div>

              <!-- パスワード変更フォーム（条件付き表示） -->
              <div *ngIf="showPasswordChange" class="space-y-4">
                <!-- 新しいパスワード -->
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700">
                    新しいパスワード
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    formControlName="newPassword"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="新しいパスワードを入力"
                  />
                  <div *ngIf="profileForm.get('newPassword')?.invalid && profileForm.get('newPassword')?.touched" class="mt-1 text-sm text-red-600">
                    パスワードは8文字以上で入力してください
                  </div>
                </div>

                <!-- 確認用パスワード -->
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                    新しいパスワード（確認）
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    formControlName="confirmPassword"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="新しいパスワードを再入力"
                  />
                  <div *ngIf="profileForm.get('confirmPassword')?.invalid && profileForm.get('confirmPassword')?.touched" class="mt-1 text-sm text-red-600">
                    <div *ngIf="profileForm.get('confirmPassword')?.errors?.['required']">確認用パスワードは必須です</div>
                    <div *ngIf="profileForm.get('confirmPassword')?.errors?.['mismatch']">パスワードが一致しません</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- エラーメッセージ -->
            <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
              <div class="text-sm text-red-800">
                {{ errorMessage }}
              </div>
            </div>

            <!-- 成功メッセージ -->
            <div *ngIf="successMessage" class="rounded-md bg-green-50 p-4">
              <div class="text-sm text-green-800">
                {{ successMessage }}
              </div>
            </div>

            <!-- 送信ボタン -->
            <div>
              <button
                type="submit"
                [disabled]="profileForm.invalid || isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  更新中...
                </span>
                <span *ngIf="!isLoading">プロフィールを更新</span>
              </button>
            </div>
          </form>

          <!-- 戻るボタン -->
          <div class="mt-6">
            <button
              type="button"
              (click)="goBack()"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentEmail: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showPasswordChange: boolean = false;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.minLength(8)]],
      confirmPassword: ['', []]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadCurrentProfile();
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value && confirmPassword.value) {
      return newPassword.value === confirmPassword.value ? null : { mismatch: true };
    }
    return null;
  }

  private loadCurrentProfile(): void {
    // 現在のユーザー情報を取得
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        if (user && user.email) {
          this.currentEmail = user.email;
          this.profileForm.patchValue({
            email: user.email
          });
        }
      },
      error: (error: any) => {
        console.error('プロフィール情報の取得に失敗しました:', error);
        this.errorMessage = 'プロフィール情報の取得に失敗しました';
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.profileForm.value;
      const updateData: any = {
        email: formData.email
      };

      // パスワード変更が選択されている場合のみパスワード関連のフィールドを追加
      if (this.showPasswordChange && formData.newPassword) {
        updateData.login_pwd = formData.newPassword;
      }

      this.memberService.updateProfile(updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'プロフィールが正常に更新されました';
          this.currentEmail = formData.email;
          
          // 3秒後に成功メッセージをクリア
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('プロフィール更新エラー:', error);
          
          if (error.status === 400) {
            this.errorMessage = '入力データが無効です';
          } else {
            this.errorMessage = 'プロフィールの更新に失敗しました';
          }
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  togglePasswordChange(): void {
    this.showPasswordChange = !this.showPasswordChange;
    
    if (!this.showPasswordChange) {
      // パスワード変更を無効にする場合、パスワード関連フィールドをクリア
      this.profileForm.get('newPassword')?.setValue('');
      this.profileForm.get('confirmPassword')?.setValue('');
    }
  }
}
