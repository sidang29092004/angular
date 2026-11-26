import { Component } from '@angular/core';
import { Hero } from '../../shared/components/hero/hero';
import { PlaylistSection } from '../../shared/components/playlist-section/playlist-section';
import { PromoBanner } from '../../shared/components/promo-banner/promo-banner';
import { TracksSection } from '../../shared/components/tracks-section/tracks-section';
import { ArtistsSection } from '../../shared/components/artists-section/artists-section';
import { FeedbackSection } from '../../shared/components/feedback-section/feedback-section';
import { Newsletter } from '../../shared/components/newsletter/newsletter';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Hero,
    PlaylistSection,
    PromoBanner,
    TracksSection,
    ArtistsSection,
    FeedbackSection,
    Newsletter,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
