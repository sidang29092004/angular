import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { MusicService } from '../../services/music-service';
import { LibraryService } from '../../services/library-service';
import { TrackList } from '../../shared/components/track-list/track-list';

@Component({
  selector: 'app-detail',
  imports: [RouterLink, TrackList],
  templateUrl: './detail.html',
})
export class Detail {
  readonly music = inject(MusicService);
  readonly library = inject(LibraryService);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly kind = computed(() => this.data()['kind'] as string);
  readonly id = computed(() => this.params().get('id'));
  readonly track = computed(() => this.music.catalog().tracks.find((item) => item.id === this.id()));
  readonly playlist = computed(() => this.music.catalog().playlists.find((item) => item.id === this.id()));
  readonly artist = computed(() => this.music.catalog().artists.find((item) => item.id === this.id()));
  readonly entity = computed(() => {
    if (this.kind() === 'playlist') {
      const item = this.playlist();
      return item && { title: item.title, image: item.image, description: item.description, label: 'Playlist' };
    }
    if (this.kind() === 'artist') {
      const item = this.artist();
      return item && { title: item.name, image: item.image, description: item.bio || item.genre, label: 'Nghệ sĩ' };
    }
    const item = this.track();
    return item && { title: item.title, image: item.image, description: item.description || item.playlist, label: 'Bài hát' };
  });
  readonly relatedTracks = computed(() => {
    const catalog = this.music.catalog();
    if (this.kind() === 'playlist') {
      return catalog.tracks.filter((item) => item.playlistId === this.id() || item.playlist === this.playlist()?.title);
    }
    if (this.kind() === 'artist') {
      return catalog.tracks.filter((item) => item.artistId === this.id() || item.artist === this.artist()?.name);
    }
    return catalog.tracks.filter((item) => item.id !== this.id());
  });
  readonly trackArtist = computed(() => this.music.catalog().artists.find(
    (item) => item.id === this.track()?.artistId || item.name === this.track()?.artist,
  ));
  readonly trackPlaylist = computed(() => this.music.catalog().playlists.find(
    (item) => item.id === this.track()?.playlistId || item.title === this.track()?.playlist,
  ));

  constructor() {
    effect(() => this.title.setTitle(`${this.entity()?.title || 'Chi tiết'} — spotife`));
  }
}
