import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <h1 class="text-3xl font-bold text-gray-900">カレンダー</h1>
            <button
              type="button"
              (click)="goToSettlement()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              清算管理へ戻る
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 sm:px-0">
          <div class="bg-white shadow sm:rounded-lg p-4 sm:p-6">
            <div
              *ngIf="hasCalendarEmbedSrc && calendarEmbedUrl; else noCalendarSrc"
              class="w-full overflow-hidden rounded-md border border-gray-200"
            >
              <iframe
                [src]="calendarEmbedUrl"
                class="w-full h-[800px]"
                frameborder="0"
                scrolling="no"
                title="Google Calendar"
              ></iframe>
            </div>

            <ng-template #noCalendarSrc>
              <div class="rounded-md bg-amber-50 border border-amber-200 p-4 text-amber-800">
                <p class="font-medium">Googleカレンダーの埋め込みURLが未設定です。</p>
                <p class="text-sm mt-1">
                  src/environments/environment.ts の googleCalendarEmbedSrc に Google カレンダーの埋め込みURLを設定してください。
                </p>
              </div>
            </ng-template>
          </div>
        </div>
      </main>
    </div>
  `
})
export class CalendarComponent {
  hasCalendarEmbedSrc: boolean;
  calendarEmbedUrl: SafeResourceUrl | null;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.hasCalendarEmbedSrc = environment.googleCalendarEmbedSrc.trim().length > 0;
    this.calendarEmbedUrl = this.hasCalendarEmbedSrc
      ? this.sanitizer.bypassSecurityTrustResourceUrl(environment.googleCalendarEmbedSrc)
      : null;
  }

  goToSettlement(): void {
    this.router.navigate(['/settlement']);
  }
}
