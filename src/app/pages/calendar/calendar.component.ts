import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CalendarEventCreateRequest, CalendarEventService } from '../../services/calendar-event.service';
import { environment } from '../../../environments/environment';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
}

interface IcalEvent {
  title: string;
  start: Date;
  end: Date | null;
}

interface EventFormState {
  title: string;
  description: string;
  allDay: boolean;
  isGlobal: boolean;
  date: string;
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            <div class="mb-3">
              <div class="inline-flex rounded-md border border-gray-200 p-1 bg-gray-50">
                <button
                  type="button"
                  (click)="activeMiniTab = 'embed'"
                  [class]="
                    'px-3 py-1 text-sm rounded ' +
                    (activeMiniTab === 'embed'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800')
                  "
                >
                  埋め込みカレンダー
                </button>
                <button
                  type="button"
                  (click)="activeMiniTab = 'manage'"
                  [class]="
                    'px-3 py-1 text-sm rounded ' +
                    (activeMiniTab === 'manage'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800')
                  "
                >
                  日付ごとの予定追加[WIP]
                </button>
              </div>
            </div>

            <div *ngIf="activeMiniTab === 'embed'">
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

            <div class="mt-2 pt-1" *ngIf="activeMiniTab === 'manage'">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">日付ごとの予定追加</h2>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="changeMonth(-1)"
                    class="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-m"
                  >
                    前月
                  </button>
                  <span class="text-m font-medium text-gray-700">{{ currentMonthLabel }}</span>
                  <button
                    type="button"
                    (click)="changeMonth(1)"
                    class="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-m"
                  >
                    次月
                  </button>
                </div>
              </div>
              <p *ngIf="hasIcalSource" class="mb-3 text-xs text-gray-500">
                iCal連携: {{ iCalLoadError ? '読込失敗' : '読込済み' }}
              </p>
              <p *ngIf="iCalLoadError" class="mb-3 text-xs text-red-600">
                {{ iCalLoadError }}
              </p>

              <div class="grid grid-cols-7 gap-0 text-xs text-gray-500 mb-2">
                <div class="text-center">日</div>
                <div class="text-center">月</div>
                <div class="text-center">火</div>
                <div class="text-center">水</div>
                <div class="text-center">木</div>
                <div class="text-center">金</div>
                <div class="text-center">土</div>
              </div>

              <div class="grid grid-cols-7 gap-0">
                <div
                  *ngFor="let day of calendarDays"
                  class="border rounded-sm p-2 min-h-32"
                  [class.bg-gray-50]="!day.isCurrentMonth"
                  [class.border-blue-300]="isSameDate(day.date, today)"
                >
                  <div class="flex justify-between items-center">
                    <span
                      class="text-sm"
                      [class.text-gray-400]="!day.isCurrentMonth"
                      [class.font-semibold]="isSameDate(day.date, today)"
                    >
                      {{ day.dayNumber }}
                    </span>
                    <button
                      type="button"
                      (click)="openEventModal(day.date)"
                      class="w-6 h-6 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm leading-6"
                      title="この日に予定を追加"
                    >
                      +
                    </button>
                  </div>
                  <div class="mt-1 space-y-1">
                    <div
                      *ngFor="let evt of getDayPreviewEvents(day.date)"
                      class="text-[10px] leading-4 px-1 py-0.5 rounded bg-blue-100 text-blue-800 truncate"
                      [title]="evt.title"
                    >
                      {{ evt.title }}
                    </div>
                    <div
                      *ngIf="getRemainingEventCount(day.date) > 0"
                      class="text-[10px] text-gray-500"
                    >
                      +{{ getRemainingEventCount(day.date) }}件
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <div
        *ngIf="isEventModalOpen"
        class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
        (click)="closeEventModal()"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg p-6" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">予定を追加</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-4">
              <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" [(ngModel)]="eventForm.allDay" />
                終日（時刻なし）
              </label>
              <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" [(ngModel)]="eventForm.isGlobal" />
                全体
              </label>
            </div>
            
            <div class="flex items-center gap-2">
              <p *ngIf="!eventForm.isGlobal" class="text-xs text-gray-500 whitespace-nowrap">
                [{{ accountName || 'アカウント' }}]
              </p>
              <input
                type="text"
                [(ngModel)]="eventForm.title"
                placeholder="予定タイトル"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div *ngIf="eventForm.allDay" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="date"
                [(ngModel)]="eventForm.fromDate"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="date"
                [(ngModel)]="eventForm.toDate"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div *ngIf="!eventForm.allDay" class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="date"
                [(ngModel)]="eventForm.date"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="time"
                [(ngModel)]="eventForm.fromTime"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                type="time"
                [(ngModel)]="eventForm.toTime"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <textarea
              [(ngModel)]="eventForm.description"
              rows="3"
              placeholder="内容（任意）"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            ></textarea>
          </div>
          <p *ngIf="eventErrorMessage" class="mt-3 text-sm text-red-600">{{ eventErrorMessage }}</p>
          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              (click)="closeEventModal()"
              class="px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700"
            >
              キャンセル
            </button>
            <button
              type="button"
              (click)="submitEvent()"
              [disabled]="isSubmittingEvent"
              class="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium"
            >
              {{ isSubmittingEvent ? '追加中...' : '追加する' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CalendarComponent {
  activeMiniTab: 'embed' | 'manage' = 'embed';
  hasCalendarEmbedSrc: boolean;
  calendarEmbedUrl: SafeResourceUrl | null;
  hasIcalSource: boolean;
  iCalLoadError: string = '';
  currentDate: Date = new Date();
  today: Date = new Date();
  calendarDays: CalendarDay[] = [];
  iCalEventsByDate: Record<string, IcalEvent[]> = {};
  isEventModalOpen: boolean = false;
  isSubmittingEvent: boolean = false;
  eventErrorMessage: string = '';
  eventSuccessMessage: string = '';
  accountName: string = '';
  eventForm: EventFormState = {
    title: '',
    description: '',
    allDay: false,
    isGlobal: true,
    date: '',
    fromDate: '',
    toDate: '',
    fromTime: '09:00',
    toTime: '10:00'
  };

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private authService: AuthService,
    private calendarEventService: CalendarEventService
  ) {
    this.hasCalendarEmbedSrc = environment.googleCalendarEmbedSrc.trim().length > 0;
    this.hasIcalSource = environment.googleCalendarIcalUrl.trim().length > 0;
    this.calendarEmbedUrl = this.hasCalendarEmbedSrc
      ? this.sanitizer.bypassSecurityTrustResourceUrl(environment.googleCalendarEmbedSrc)
      : null;
    this.generateCalendar();
    this.setDefaultEventForm(new Date());
    this.loadIcalEvents();
    this.loadAccountName();
  }

  get currentMonthLabel(): string {
    return `${this.currentDate.getFullYear()}年${this.currentDate.getMonth() + 1}月`;
  }

  goToSettlement(): void {
    this.router.navigate(['/settlement']);
  }

  changeMonth(offset: number): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + offset, 1);
    this.generateCalendar();
  }

  openEventModal(date: Date): void {
    this.eventErrorMessage = '';
    this.eventSuccessMessage = '';
    this.setDefaultEventForm(date);
    this.isEventModalOpen = true;
  }

  closeEventModal(): void {
    this.isEventModalOpen = false;
  }

  submitEvent(): void {
    this.eventErrorMessage = '';
    this.eventSuccessMessage = '';

    if (!this.eventForm.title.trim()) {
      this.eventErrorMessage = 'タイトルは必須です。';
      return;
    }

    const period = this.buildPeriod();
    if (!period) {
      return;
    }

    this.isSubmittingEvent = true;
    const title = this.eventForm.isGlobal
      ? this.eventForm.title.trim()
      : `[${this.accountName || 'アカウント'}]${this.eventForm.title.trim()}`;

    this.calendarEventService.createEvent({
      title,
      description: this.eventForm.description?.trim() || '',
      from: period.from,
      to: period.to,
      allDay: this.eventForm.allDay,
      isGlobal: this.eventForm.isGlobal
    }).subscribe({
      next: () => {
        this.isSubmittingEvent = false;
        this.eventSuccessMessage = '予定を追加しました。';
        this.isEventModalOpen = false;
      },
      error: (error: Error) => {
        this.isSubmittingEvent = false;
        this.eventErrorMessage = error.message;
      }
    });
  }

  private buildPeriod(): { from: string; to: string } | null {
    if (this.eventForm.allDay) {
      if (!this.eventForm.fromDate || !this.eventForm.toDate) {
        this.eventErrorMessage = '開始日と終了日を入力してください。';
        return null;
      }
      if (this.eventForm.fromDate > this.eventForm.toDate) {
        this.eventErrorMessage = '終了日は開始日以降を指定してください。';
        return null;
      }
      return {
        from: this.eventForm.fromDate,
        to: this.eventForm.toDate
      };
    }

    if (!this.eventForm.date || !this.eventForm.fromTime || !this.eventForm.toTime) {
      this.eventErrorMessage = '日付・開始時刻・終了時刻を入力してください。';
      return null;
    }

    const from = `${this.eventForm.date}T${this.eventForm.fromTime}`;
    const to = `${this.eventForm.date}T${this.eventForm.toTime}`;
    if (new Date(from).getTime() >= new Date(to).getTime()) {
      this.eventErrorMessage = '終了時刻は開始時刻より後にしてください。';
      return null;
    }

    return { from, to };
  }

  isSameDate(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  getDayPreviewEvents(date: Date): IcalEvent[] {
    return this.getDayEvents(date).slice(0, 2);
  }

  getRemainingEventCount(date: Date): number {
    const count = this.getDayEvents(date).length;
    return count > 2 ? count - 2 : 0;
  }

  private generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const startDate = new Date(year, month, 1 - startOffset);

    this.calendarDays = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return {
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month
      };
    });
  }

  private setDefaultEventForm(date: Date): void {
    const dateText = this.toDateValue(date);
    this.eventForm.date = dateText;
    this.eventForm.fromDate = dateText;
    this.eventForm.toDate = dateText;
    this.eventForm.fromTime = '09:00';
    this.eventForm.toTime = '10:00';
  }

  private toDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private loadAccountName(): void {
    this.authService.getProfile().subscribe({
      next: (profile: any) => {
        this.accountName = profile?.nickname || profile?.name || profile?.email || '';
      },
      error: () => {
        this.accountName = '';
      }
    });
  }

  private loadIcalEvents(): void {
    const rawUrl = environment.googleCalendarIcalUrl.trim();
    if (!rawUrl) {
      return;
    }

    const iCalUrl = rawUrl.startsWith('webcal://')
      ? rawUrl.replace('webcal://', 'https://')
      : rawUrl;

    this.http.get(iCalUrl, { responseType: 'text' }).subscribe({
      next: (icsText: string) => {
        const events = this.parseIcs(icsText);
        this.iCalEventsByDate = this.groupEventsByDate(events);
        this.iCalLoadError = '';
      },
      error: () => {
        this.iCalLoadError = 'iCalの取得に失敗しました。CORS制限の場合はサーバー経由で取得してください。';
      }
    });
  }

  private getDayEvents(date: Date): IcalEvent[] {
    const key = this.toDateKey(date);
    return this.iCalEventsByDate[key] || [];
  }

  private groupEventsByDate(events: IcalEvent[]): Record<string, IcalEvent[]> {
    const result: Record<string, IcalEvent[]> = {};

    events.forEach((event) => {
      const startDate = this.toStartOfDay(event.start);
      const endDate = this.getDisplayEndDate(event);
      let currentDate = new Date(startDate);

      while (currentDate.getTime() <= endDate.getTime()) {
        const key = this.toDateKey(currentDate);
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(event);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    Object.keys(result).forEach((key) => {
      result[key].sort((a, b) => a.start.getTime() - b.start.getTime());
    });

    return result;
  }

  private parseIcs(icsText: string): IcalEvent[] {
    const normalized = icsText.replace(/\r\n[ \t]/g, '');
    const lines = normalized.split(/\r?\n/);
    const events: IcalEvent[] = [];
    let current: { title?: string; start?: Date; end?: Date | null } | null = null;

    lines.forEach((line) => {
      if (line === 'BEGIN:VEVENT') {
        current = {};
        return;
      }

      if (line === 'END:VEVENT' && current) {
        if (current.start) {
          events.push({
            title: current.title || '(タイトルなし)',
            start: current.start,
            end: current.end || null
          });
        }
        current = null;
        return;
      }

      if (!current) {
        return;
      }

      if (line.startsWith('SUMMARY')) {
        current.title = this.extractIcsValue(line);
      } else if (line.startsWith('DTSTART')) {
        current.start = this.parseIcsDate(this.extractIcsValue(line));
      } else if (line.startsWith('DTEND')) {
        current.end = this.parseIcsDate(this.extractIcsValue(line));
      }
    });

    return events;
  }

  private extractIcsValue(line: string): string {
    const separatorIndex = line.indexOf(':');
    return separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : '';
  }

  private parseIcsDate(value: string): Date {
    if (/^\d{8}$/.test(value)) {
      const year = Number(value.slice(0, 4));
      const month = Number(value.slice(4, 6)) - 1;
      const day = Number(value.slice(6, 8));
      return new Date(year, month, day);
    }

    const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);
      const hour = Number(match[4]);
      const minute = Number(match[5]);
      const second = Number(match[6] || '0');

      if (match[7] === 'Z') {
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      }

      return new Date(year, month, day, hour, minute, second);
    }

    return new Date(value);
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getDisplayEndDate(event: IcalEvent): Date {
    if (!event.end) {
      return this.toStartOfDay(event.start);
    }

    const end = new Date(event.end);
    const isEndAtMidnight =
      end.getHours() === 0 &&
      end.getMinutes() === 0 &&
      end.getSeconds() === 0 &&
      end.getMilliseconds() === 0;

    // iCalの終端は「終了日の 00:00 で排他的」なケースが多いため前日に寄せる
    if (isEndAtMidnight && end.getTime() > event.start.getTime()) {
      end.setMilliseconds(end.getMilliseconds() - 1);
    }

    return this.toStartOfDay(end);
  }
}
