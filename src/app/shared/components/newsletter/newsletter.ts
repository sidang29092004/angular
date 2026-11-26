import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MusicService } from '../../../services/music-service';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './newsletter.html',
  styleUrl: './newsletter.css',
})
export class Newsletter {
  email = '';
  readonly registeredEmail = signal('');
  readonly pending = signal(false);
  readonly error = signal('');
  private readonly music = inject(MusicService);

  subscribe(form: NgForm): void {
    if (this.pending()) return;
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const email = this.email.trim().toLowerCase();
    this.pending.set(true);
    this.error.set('');
    this.registeredEmail.set('');
    this.music.subscribe(email).subscribe({
      next: () => {
        this.registeredEmail.set(email);
        this.pending.set(false);
        form.resetForm({ email: '' });
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.error?.message || 'Chưa kết nối được máy chủ. Bạn hãy thử lại.');
        this.pending.set(false);
      },
    });
  }
}
