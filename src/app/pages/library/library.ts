import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MusicService } from '../../services/music-service';
import { LibraryService } from '../../services/library-service';
import { TrackList } from '../../shared/components/track-list/track-list';

@Component({
  selector: 'app-library',
  imports: [RouterLink, TrackList],
  template: `
    <p class="eyebrow">NHỮNG GIAI ĐIỆU MUỐN GIỮ LẠI</p>
    <h1 class="page-title">Thư viện của bạn</h1>
    <p class="page-description">{{ tracks().length }} bài hát yêu thích · Lưu trên thiết bị này.</p>
    @if (tracks().length) {
      <app-track-list [tracks]="tracks()" />
    } @else {
      <div class="empty-state">
        <svg class="icon empty-icon" aria-hidden="true"><use href="#icon-heart" /></svg>
        <h2>Một chỗ cho nhạc đúng gu</h2>
        <p class="page-description">Chạm vào trái tim bên cạnh bài hát để thêm vào thư viện.</p>
        <a class="primary-button" routerLink="/search">Tìm bài hát yêu thích</a>
      </div>
    }
  `,
})
export class Library {
  readonly music = inject(MusicService);
  readonly library = inject(LibraryService);
  readonly tracks = computed(() => this.music.catalog().tracks.filter(
    (item) => this.library.favorites().includes(item.id),
  ));
}
