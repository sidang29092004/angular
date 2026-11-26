import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MusicService } from './services/music-service';

describe('spotife', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    vi.spyOn(TestBed.inject(MusicService), 'load').mockImplementation(() => {});
    TestBed.inject(MusicService).status.set('live');
    fixture = TestBed.createComponent(App);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
  });

  it('should create the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the music layout, feedback and newsletter', async () => {
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('header')).toBeTruthy();
    expect(page.querySelector('main h1')?.textContent).toContain('Hôm nay nghe gì?');
    expect(page.querySelectorAll('main section')).toHaveLength(6);
    expect(page.querySelectorAll('main aside.promo-banner')).toHaveLength(2);
    expect(page.querySelector('footer')).toBeTruthy();
    expect(page.querySelector('#feedback')).toBeTruthy();
    expect(page.querySelectorAll('#feedback .feedback-card')).toHaveLength(2);
    expect(
      [...page.querySelectorAll('#feedback figcaption strong')].map((element) =>
        element.textContent?.trim(),
      ),
    ).toEqual(['Minh Anh', 'Khánh Linh']);
    expect(page.querySelector('#newsletter form')).toBeTruthy();
  });

  it('should provide a valid destination for every navigation link', async () => {
    const page = fixture.nativeElement as HTMLElement;

    for (const link of page.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]')) {
      const destination = new URL(link.getAttribute('href')!, 'http://localhost').hash;
      expect(destination).not.toBe('');
      expect(page.querySelector(destination)).toBeTruthy();
    }
  });

  it('should navigate between home and profile using the shared navigation', async () => {
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector<HTMLAnchorElement>('.avatar')!.click();
    await fixture.whenStable();

    expect(router.url).toBe('/profile');
    expect(page.querySelector('app-profile')).toBeTruthy();
    expect(page.querySelector('app-home')).toBeNull();
    expect(page.querySelector('header')).toBeTruthy();
    expect(page.querySelector('footer')).toBeTruthy();
    expect(page.querySelector('.bottom-nav [aria-current="page"]')).toBeNull();

    page.querySelector<HTMLAnchorElement>('.bottom-nav .nav-item')!.click();
    await fixture.whenStable();

    expect(router.url).toBe('/');
    expect(page.querySelector('main h1')?.textContent).toContain('Hôm nay nghe gì?');
    expect(page.querySelector('app-profile')).toBeNull();
    expect(page.querySelector('.bottom-nav .nav-item.active')?.getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('should open home sections from profile through header, bottom navigation and footer', async () => {
    const page = fixture.nativeElement as HTMLElement;
    const destinations = [
      { selector: '.footer-links a[fragment="artists"]', fragment: 'artists' },
      { selector: '.footer-links a[fragment="feedback"]', fragment: 'feedback' },
      { selector: '.footer-links a[fragment="newsletter"]', fragment: 'newsletter' },
    ];

    for (const { selector, fragment } of destinations) {
      await router.navigateByUrl('/profile');
      await fixture.whenStable();
      page.querySelector<HTMLAnchorElement>(selector)!.click();
      await fixture.whenStable();

      expect(router.url).toBe(`/#${fragment}`);
      expect(page.querySelector(`#${fragment}`)).toBeTruthy();
      expect(page.querySelector('app-profile')).toBeNull();
    }
  });

  it.each([
    ['.search-link', '/search'],
    ['.bottom-nav a[href="/library"]', '/library'],
    ['.bottom-nav a[href="/artists"]', '/artists'],
  ])('should navigate with %s to %s', async (selector, destination) => {
    const page = fixture.nativeElement as HTMLElement;
    page.querySelector<HTMLAnchorElement>(selector)!.click();
    await fixture.whenStable();
    expect(router.url).toBe(destination);
    expect(page.querySelector('main h1')).toBeTruthy();
  });

  it('should update details when navigating between playlist IDs', async () => {
    await router.navigateByUrl('/playlist/chill');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('main h1').textContent).toContain('Chill một chút');
    await router.navigateByUrl('/playlist/indie');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('main h1').textContent).toContain('Indie trong tai');
    expect(fixture.nativeElement.querySelector('app-track-list').textContent).toContain('Đi qua những ngày mưa');
  });

  it('should handle an unknown detail ID', async () => {
    await router.navigateByUrl('/track/does-not-exist');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('main h1').textContent).toContain('Chưa tìm thấy nội dung');
  });

  it('should find Vietnamese titles without diacritics', async () => {
    await router.navigateByUrl('/search');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const search = page.querySelector<HTMLInputElement>('#music-search')!;
    search.value = 'di qua nhung ngay mua';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(page.querySelector('app-track-list')?.textContent).toContain('Đi qua những ngày mưa');
    expect(page.querySelectorAll('.music-row')).toHaveLength(1);
  });

  it('should render admin page and navigate between admin sections', async () => {
    await router.navigateByUrl('/admin');
    await fixture.whenStable();
    expect(router.url).toBe('/admin');
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('app-admin')).toBeTruthy();
    expect(page.querySelector('.admin-frame')).toBeTruthy();

    await router.navigateByUrl('/admin/feedback');
    await fixture.whenStable();
    expect(router.url).toBe('/admin/feedback');
    expect(page.querySelector('app-admin')).toBeTruthy();
    expect(page.querySelector('.admin-frame')).toBeTruthy();
  });

  it('should redirect unknown URLs to home', async () => {
    await router.navigateByUrl('/unknown/page');
    await fixture.whenStable();

    expect(router.url).toBe('/');
    expect(fixture.nativeElement.querySelector('app-home')).toBeTruthy();
  });
});
