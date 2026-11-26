import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MusicService } from '../../../services/music-service';

@Component({
  selector: 'app-playlist-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './playlist-section.html',
  styleUrl: './playlist-section.css',
})
export class PlaylistSection {
  private readonly music = inject(MusicService);
  readonly playlists = computed(() => this.music.catalog().playlists);
}
