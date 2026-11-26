import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Track } from '../../../models/music';
import { LibraryService } from '../../../services/library-service';

@Component({
  selector: 'app-track-list',
  imports: [RouterLink],
  template: `
    <ul class="music-list">
      @for (track of tracks(); track track.id) {
        <li class="music-row">
          <a class="music-row-link" [routerLink]="['/track', track.id]">
            <img [src]="track.image" [alt]="'Ảnh bìa ' + track.title" width="48" height="48" loading="lazy" />
            <span><strong>{{ track.title }}</strong><small>{{ track.artist }} · {{ track.duration }}</small></span>
          </a>
          <button class="icon-button favorite-button" type="button"
            [class.is-saved]="library.favorites().includes(track.id)"
            [attr.aria-pressed]="library.favorites().includes(track.id)"
            [attr.aria-label]="(library.favorites().includes(track.id) ? 'Bỏ lưu ' : 'Lưu ') + track.title"
            (click)="library.toggle(track.id)">
            <svg class="icon" aria-hidden="true"><use href="#icon-heart" /></svg>
          </button>
        </li>
      } @empty {
        <li class="empty-description">Chưa có bài hát trong danh sách này.</li>
      }
    </ul>
    <p class="sr-only" role="status">{{ library.message() }}</p>
  `,
})
export class TrackList {
  readonly tracks = input.required<readonly Track[]>();
  readonly library = inject(LibraryService);
}
