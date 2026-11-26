import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MusicService } from '../../../services/music-service';

@Component({
  selector: 'app-artists-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './artists-section.html',
  styleUrl: './artists-section.css',
})
export class ArtistsSection {
  private readonly music = inject(MusicService);
  readonly artists = computed(() => this.music.catalog().artists.slice(0, 3));
}
