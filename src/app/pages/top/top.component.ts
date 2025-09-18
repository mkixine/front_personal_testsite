import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-top',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">リダイレクト中...</p>
      </div>
    </div>
  `,
  styles: []
})
export class TopComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthAndRedirect();
  }

  private checkAuthAndRedirect(): void {
    // プロフィール取得でログイン状態を確認
    this.authService.getProfile().subscribe({
      next: (profile) => {
        // ログイン済みの場合、settlementページへリダイレクト
        this.router.navigate(['/settlement']);
      },
      error: (error) => {
        // ログインしていない場合、loginページへリダイレクト
        console.log('未ログイン状態です:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
