import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MusicService } from '../../../services/music-service';

@Component({
  selector: 'app-tracks-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tracks-section.html',
  styleUrl: './tracks-section.css',
})
export class TracksSection {
  private readonly music = inject(MusicService);
  readonly tracks = computed(() => this.music.catalog().tracks);
}
