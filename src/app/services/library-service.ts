import { afterNextRender, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  readonly favorites = signal<string[]>([]);
  readonly name = signal('Bạn yêu nhạc');
  readonly message = signal('');

  constructor() {
    afterNextRender(() => {
      try {
        const saved = JSON.parse(localStorage.getItem('spotife-library') ?? '[]');
        if (Array.isArray(saved)) this.favorites.set(saved.filter((id) => typeof id === 'string'));
        this.name.set(localStorage.getItem('spotife-name') || 'Bạn yêu nhạc');
      } catch {
        this.message.set('Trình duyệt chưa cho phép đọc thư viện đã lưu.');
      }
    });
  }

  toggle(id: string): void {
    const ids = this.favorites();
    this.favorites.set(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
    this.persist('spotife-library', JSON.stringify(this.favorites()));
  }

  saveName(name: string): void {
    const value = name.trim();
    if (!value) return;
    this.name.set(value.slice(0, 60));
    this.persist('spotife-name', this.name());
  }

  private persist(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
      this.message.set('Đã lưu trên thiết bị này.');
    } catch {
      this.message.set('Thay đổi đang được giữ trong phiên này vì trình duyệt chặn lưu trữ.');
    }
  }
}
