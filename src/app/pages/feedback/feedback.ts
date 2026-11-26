import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MusicService } from '../../services/music-service';
import { LibraryService } from '../../services/library-service';

@Component({
  selector: 'app-feedback-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './feedback.html',
})
export class FeedbackPage {
  readonly music = inject(MusicService);
  readonly library = inject(LibraryService);
  readonly pending = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');
  rating = 5;
  quote = '';

  submit(form: NgForm): void {
    if (this.pending()) return;
    if (form.invalid || !String(form.value.name).trim() || this.quote.trim().length < 10) {
      form.control.markAllAsTouched();
      return;
    }
    this.pending.set(true);
    this.error.set('');
    this.music.sendFeedback({ name: form.value.name.trim(), rating: Number(this.rating), quote: this.quote.trim() }).subscribe({
      next: () => {
        this.pending.set(false);
        this.sent.set(true);
        this.music.load();
      },
      error: (error: HttpErrorResponse) => {
        this.pending.set(false);
        this.error.set(error.error?.message || 'Chưa gửi được cảm nhận. Bạn hãy thử lại.');
      },
    });
  }
}
