import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MusicService } from '../../../services/music-service';
import { LibraryService } from '../../../services/library-service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  styleUrl: './bottom-nav.css',
  templateUrl: './bottom-nav.html',
})
export class BottomNav {
  private readonly music = inject(MusicService);
  readonly library = inject(LibraryService);
  readonly featuredTrack = computed(() => this.music.catalog().tracks[0]);
  readonly isPlaying = signal(false);

  togglePlay(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPlaying.update((state) => !state);
  }
}
