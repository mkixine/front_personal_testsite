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
    // トークン有無の軽量判定のみ行い、APIは遷移先（settlement）に任せる
    if (this.authService.isTokenValid() || this.authService.isRefreshTokenValid()) {
      this.router.navigate(['/settlement']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
