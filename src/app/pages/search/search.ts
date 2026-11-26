import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MusicService } from '../../services/music-service';
import { TrackList } from '../../shared/components/track-list/track-list';

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}

@Component({
  selector: 'app-search',
  imports: [RouterLink, TrackList],
  templateUrl: './search.html',
})
export class Search {
  readonly music = inject(MusicService);
  readonly query = signal('');
  readonly term = computed(() => normalize(this.query().trim()));
  readonly tracks = computed(() => this.music.catalog().tracks.filter(
    (item) => normalize(`${item.title} ${item.artist}`).includes(this.term()),
  ));
  readonly playlists = computed(() => this.music.catalog().playlists.filter(
    (item) => normalize(`${item.title} ${item.description}`).includes(this.term()),
  ));
  readonly artists = computed(() => this.music.catalog().artists.filter(
    (item) => normalize(`${item.name} ${item.genre}`).includes(this.term()),
  ));
  readonly count = computed(() => this.tracks().length + this.playlists().length + this.artists().length);
}
