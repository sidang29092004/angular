import { afterNextRender, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './shared/components/header/header';
import { BottomNav } from './shared/components/bottom-nav/bottom-nav';
import { Footer } from './shared/components/footer/footer';
import { MusicService } from './services/music-service';
import { ThemeService } from './services/theme-service';

function checkIsAdmin(router: Router): boolean {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.pathname.startsWith('/admin');
  }
  return router.url.startsWith('/admin');
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, BottomNav],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '[class.is-admin]': 'isAdmin()',
  },
})
export class App {
  readonly music = inject(MusicService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  readonly isAdmin = signal(checkIsAdmin(this.router));

  constructor() {
    this.updateLayout();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateLayout();
    });
    afterNextRender(() => this.music.load());
  }

  private updateLayout(): void {
    const url = typeof window !== 'undefined' && window.location ? window.location.pathname : this.router.url;
    this.isAdmin.set(url.startsWith('/admin'));
  }
}
