import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { Artist, Feedback, Playlist, Track } from '../../models/music';
import { MusicService } from '../../services/music-service';
import { ThemeService } from '../../services/theme-service';

type AdminPage = 'overview' | 'tracks' | 'artists' | 'playlists' | 'feedback';
type CatalogKind = 'tracks' | 'artists' | 'playlists';

interface AdminForm {
  title: string;
  artist: string;
  genre: string;
  image: string;
  duration: string;
  playlistId: string;
  description: string;
  bio: string;
}

const emptyForm = (): AdminForm => ({
  title: '', artist: '', genre: '', image: '', duration: '3:30', playlistId: '', description: '', bio: '',
});

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  readonly music = inject(MusicService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  readonly page = signal<AdminPage>('overview');
  readonly query = signal('');
  readonly editorOpen = signal(false);
  readonly editorKind = signal<CatalogKind>('tracks');
  readonly editingId = signal<string | null>(null);
  readonly notice = signal('');
  form = emptyForm();

  readonly pageTitle = computed(() => ({
    overview: 'Tổng quan', tracks: 'Bài hát', artists: 'Nghệ sĩ', playlists: 'Playlist', feedback: 'Đánh giá',
  })[this.page()]);
  readonly catalog = this.music.catalog;
  readonly tracks = computed(() => this.catalog().tracks.filter((item) => this.matches(`${item.title} ${item.artist} ${item.playlist}`)));
  readonly artists = computed(() => this.catalog().artists.filter((item) => this.matches(`${item.name} ${item.genre}`)));
  readonly playlists = computed(() => this.catalog().playlists.filter((item) => this.matches(`${item.title} ${item.description}`)));
  readonly feedbacks = computed(() => this.catalog().feedbacks.filter((item) => this.matches(`${item.name} ${item.quote}`)));
  readonly averageRating = computed(() => {
    const items = this.catalog().feedbacks;
    if (!items.length) return '—';
    return (items.reduce((sum, item) => sum + item.rating, 0) / items.length).toFixed(1);
  });

  constructor() {
    this.syncPage();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.syncPage());
  }

  setPage(page: AdminPage): void {
    this.page.set(page);
    this.query.set('');
  }

  openCreate(kind: CatalogKind): void {
    this.editorKind.set(kind);
    this.editingId.set(null);
    this.form = emptyForm();
    const playlists = this.catalog().playlists;
    this.form.playlistId = playlists[0]?.id ?? '';
    this.editorOpen.set(true);
  }

  openEdit(kind: CatalogKind, item: Track | Artist | Playlist): void {
    this.editorKind.set(kind);
    this.editingId.set(item.id);
    if (kind === 'tracks') {
      const track = item as Track;
      this.form = {
        ...emptyForm(), title: track.title, artist: track.artist, image: track.image,
        duration: track.duration, playlistId: track.playlistId ?? '', description: track.description ?? '',
      };
    } else if (kind === 'artists') {
      const artist = item as Artist;
      this.form = { ...emptyForm(), title: artist.name, genre: artist.genre, image: artist.image, bio: artist.bio ?? '' };
    } else {
      const playlist = item as Playlist;
      this.form = { ...emptyForm(), title: playlist.title, description: playlist.description, image: playlist.image };
    }
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
  }

  saveItem(): void {
    const kind = this.editorKind();
    const current = this.catalog();
    const title = this.form.title.trim();
    if (!title || (kind === 'tracks' && !this.form.artist.trim()) || (kind === 'artists' && !this.form.genre.trim())) {
      this.showNotice('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    const id = this.editingId() ?? this.makeId(title, kind);
    const image = this.form.image.trim() || 'assets/images/ocean.jpg';
    let next = current;
    if (kind === 'tracks') {
      const existing = current.tracks.find((item) => item.id === id);
      const playlist = current.playlists.find((item) => item.id === this.form.playlistId) ?? current.playlists[0];
      const artist = current.artists.find((item) => item.name.toLocaleLowerCase() === this.form.artist.trim().toLocaleLowerCase());
      const item: Track = {
        id, title, artist: this.form.artist.trim(), image,
        duration: this.form.duration.trim() || '3:30', playlist: playlist?.title ?? 'Chưa phân loại',
        playlistId: playlist?.id, artistId: artist?.id, description: this.form.description.trim(),
      };
      next = { ...current, tracks: this.replaceItem(current.tracks, item, existing) };
    } else if (kind === 'artists') {
      const existing = current.artists.find((item) => item.id === id);
      const item: Artist = {
        id, name: title, genre: this.form.genre.trim(), image, bio: this.form.bio.trim(),
      };
      next = {
        ...current,
        artists: this.replaceItem(current.artists, item, existing),
        tracks: existing ? current.tracks.map((track) => track.artistId === id ? { ...track, artist: title } : track) : current.tracks,
      };
    } else {
      const existing = current.playlists.find((item) => item.id === id);
      const item: Playlist = {
        id, title, description: this.form.description.trim(), image, imageAlt: title,
        coverClass: existing?.coverClass ?? 'cover-custom', coverTitle: existing?.coverTitle ?? title,
        coverSubtitle: existing?.coverSubtitle, largeSubtitle: existing?.largeSubtitle,
      };
      next = {
        ...current,
        playlists: this.replaceItem(current.playlists, item, existing),
        tracks: existing ? current.tracks.map((track) => track.playlistId === id ? { ...track, playlist: title } : track) : current.tracks,
      };
    }

    this.music.saveCatalog(next);
    this.closeEditor();
    this.showNotice(this.editingId() ? 'Đã cập nhật nội dung.' : 'Đã thêm nội dung mới.');
  }

  removeItem(kind: CatalogKind | 'feedback', id: string): void {
    if (typeof window !== 'undefined' && !window.confirm('Xóa nội dung này khỏi thư viện trên trình duyệt này?')) return;
    const current = this.catalog();
    if (kind === 'tracks') this.music.saveCatalog({ ...current, tracks: current.tracks.filter((item) => item.id !== id) });
    if (kind === 'artists') this.music.saveCatalog({ ...current, artists: current.artists.filter((item) => item.id !== id) });
    if (kind === 'playlists') this.music.saveCatalog({ ...current, playlists: current.playlists.filter((item) => item.id !== id) });
    if (kind === 'feedback') this.music.saveCatalog({ ...current, feedbacks: current.feedbacks.filter((item) => item.id !== id) });
    this.showNotice('Đã xóa nội dung.');
  }

  playlistName(id?: string): string {
    return this.catalog().playlists.find((item) => item.id === id)?.title ?? 'Chưa phân loại';
  }

  playlistTrackCount(id: string): number {
    return this.catalog().tracks.filter((item) => item.playlistId === id).length;
  }

  formattedDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
  }

  private syncPage(): void {
    const section = this.router.url.split('?')[0].split('/')[2] as AdminPage | undefined;
    const pages: AdminPage[] = ['overview', 'tracks', 'artists', 'playlists', 'feedback'];
    this.page.set(section && pages.includes(section) ? section : 'overview');
  }

  private matches(value: string): boolean {
    const term = this.query().trim().toLocaleLowerCase();
    return !term || value.toLocaleLowerCase().includes(term);
  }

  private makeId(title: string, kind: CatalogKind): string {
    const base = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || kind.slice(0, -1);
    const existing = new Set([
      ...this.catalog().tracks.map((item) => item.id),
      ...this.catalog().artists.map((item) => item.id),
      ...this.catalog().playlists.map((item) => item.id),
    ]);
    let id = base;
    let suffix = 2;
    while (existing.has(id)) id = `${base}-${suffix++}`;
    return id;
  }

  private replaceItem<T extends { id: string }>(items: readonly T[], item: T, existing?: T): readonly T[] {
    return existing ? items.map((current) => current.id === item.id ? item : current) : [...items, item];
  }

  private showNotice(message: string): void {
    this.notice.set(message);
    globalThis.setTimeout(() => this.notice.set(''), 2800);
  }
}
