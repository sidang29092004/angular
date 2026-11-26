import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Newsletter } from './newsletter';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('Newsletter', () => {
  let fixture: ComponentFixture<Newsletter>;
  let page: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newsletter],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Newsletter);
    await fixture.whenStable();
    page = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  async function submit(value: string): Promise<void> {
    const input = page.querySelector<HTMLInputElement>('input')!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    page
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('should show a required error without registering an empty email', async () => {
    await submit('');

    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Bạn hãy nhập email');
    expect(page.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    expect(page.querySelector('[role="status"]')?.textContent?.trim()).toBe('');
  });

  it.each(['sai-email', 'ban@', 'ban@example', 'ban ten@example.com'])(
    'should reject malformed email %s',
    async (value) => {
      await submit(value);

      expect(page.querySelector('[role="alert"]')?.textContent).toContain('chưa đúng định dạng');
      expect(page.querySelector('[role="status"]')?.textContent?.trim()).toBe('');
    },
  );

  it('should wait for the API before acknowledging and resetting the form', async () => {
    await submit('ban@example.com');
    const request = http.expectOne('/api/subscribers');
    expect(request.request.body).toEqual({ email: 'ban@example.com' });
    expect(page.querySelector('[role="status"]')?.textContent?.trim()).toBe('');
    request.flush({ message: 'Đăng ký nhận tin thành công.' });
    await fixture.whenStable();

    expect(page.querySelector('[role="status"]')?.textContent).toContain('ban@example.com');
    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      'thành công',
    );
    expect(page.querySelector<HTMLInputElement>('input')?.value).toBe('');
    expect(page.querySelector('[role="alert"]')).toBeNull();
    expect(page.querySelector('input')?.hasAttribute('aria-invalid')).toBe(false);
  });

  it('should retain the input and allow retry after an API error', async () => {
    await submit('ban@example.com');
    http.expectOne('/api/subscribers').flush({ message: 'Máy chủ tạm thời chưa sẵn sàng.' }, { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('chưa sẵn sàng');
    expect(page.querySelector<HTMLInputElement>('input')?.value).toBe('ban@example.com');
    expect(page.querySelector<HTMLButtonElement>('button')?.disabled).toBe(false);
    expect(page.querySelector('[role="status"]')?.textContent?.trim()).toBe('');
  });
});
