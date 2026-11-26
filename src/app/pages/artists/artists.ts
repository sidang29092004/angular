import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MusicService } from '../../services/music-service';

@Component({
  selector: 'app-artists',
  imports: [RouterLink],
  template: `
    <p class="eyebrow">NHỮNG GIỌNG CA RẤT RIÊNG</p>
    <h1 class="page-title">Nghệ sĩ</h1>
    <p class="page-description">Gặp gỡ người kể câu chuyện bằng âm nhạc.</p>
    <div class="browse-grid">
      @for (artist of music.catalog().artists; track artist.id) {
        <a class="browse-card artist-card" [routerLink]="['/artist', artist.id]">
          <img [src]="artist.image" [alt]="artist.name" width="170" height="170" loading="lazy" />
          <strong>{{ artist.name }}</strong><small>{{ artist.genre }}</small>
        </a>
      } @empty {
        <p class="page-description">Danh sách nghệ sĩ đang được cập nhật.</p>
      }
    </div>
  `,
})
export class Artists {
  readonly music = inject(MusicService);
}
