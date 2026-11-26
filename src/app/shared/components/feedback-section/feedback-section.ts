import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MusicService } from '../../../services/music-service';
import { Feedback } from '../../../models/music';

@Component({
  selector: 'app-feedback-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feedback-section.html',
  styleUrl: './feedback-section.css',
})
export class FeedbackSection {
  private readonly music = inject(MusicService);
  readonly musicStatus = this.music.status;
  readonly feedbacks = computed(() => this.getLatestTopRatedFeedbacks(this.music.catalog().feedbacks));
  readonly stars = [1, 2, 3, 4, 5];

  getLatestTopRatedFeedbacks(items: readonly Feedback[]): Feedback[] {
    if (items.length === 0) return [];

    const highestRating = Math.max(...items.map((feedback) => feedback.rating));

    return items
      .filter((feedback) => feedback.rating === highestRating)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
  }
}
