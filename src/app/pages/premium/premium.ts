import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SubscriptionPlanId } from '../../models/subscription';
import { MusicService } from '../../services/music-service';

interface PremiumPlan {
  id: SubscriptionPlanId;
  name: string;
  price: string;
  description: string;
  features: string[];
  badge?: string;
}

@Component({
  selector: 'app-premium',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './premium.html',
  styleUrl: './premium.css',
})
export class Premium {
  private readonly music = inject(MusicService);

  readonly plans: PremiumPlan[] = [
    {
      id: 'individual',
      name: 'Premium Cá nhân',
      price: '49.000₫',
      description: 'Một tài khoản, không gian âm nhạc riêng.',
      features: ['Nghe nhạc không quảng cáo', 'Bỏ qua bài hát không giới hạn', 'Chất lượng âm thanh cao'],
      badge: 'Phổ biến nhất',
    },
    {
      id: 'student',
      name: 'Premium Sinh viên',
      price: '25.000₫',
      description: 'Ưu đãi dành cho những ngày học dài.',
      features: ['Đầy đủ quyền lợi Premium', 'Giá ưu đãi mỗi tháng', 'Cần xác minh tình trạng sinh viên'],
    },
    {
      id: 'family',
      name: 'Premium Gia đình',
      price: '99.000₫',
      description: 'Chia sẻ niềm vui nghe nhạc cùng nhà.',
      features: ['Tối đa 6 tài khoản riêng', 'Mỗi người có thư viện riêng', 'Quản lý thành viên trong một gói'],
    },
  ];

  readonly selectedPlanId = signal<SubscriptionPlanId>('individual');
  readonly selectedPlan = computed(() => this.plans.find((plan) => plan.id === this.selectedPlanId())!);
  readonly pending = signal(false);
  readonly error = signal('');
  readonly registered = signal<{ email: string; planName: string } | null>(null);
  email = '';

  choosePlan(planId: SubscriptionPlanId): void {
    this.selectedPlanId.set(planId);
    this.error.set('');
    this.registered.set(null);
    if (typeof document !== 'undefined') {
      document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  submit(form: NgForm): void {
    if (this.pending()) return;
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const email = this.email.trim().toLowerCase();
    const plan = this.selectedPlan();
    this.pending.set(true);
    this.error.set('');
    this.registered.set(null);
    this.music.registerSubscription({ email, planId: plan.id }).subscribe({
      next: () => {
        this.registered.set({ email, planName: plan.name });
        this.pending.set(false);
        form.resetForm({ email: '' });
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.error?.message || 'Chưa gửi được yêu cầu. Bạn hãy thử lại sau nhé.');
        this.pending.set(false);
      },
    });
  }
}
