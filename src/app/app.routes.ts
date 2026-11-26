import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'spotife — Âm nhạc cho riêng bạn',
  },
  {
    path: 'profile',
    loadComponent: () => import('./shared/components/profile/profile').then((m) => m.Profile),
    title: 'Hồ sơ — spotife',
  },
  {
    path: 'playlist/:id',
    loadComponent: () => import('./pages/detail/detail').then((m) => m.Detail),
    data: { kind: 'playlist' },
    title: 'Playlist — spotife',
  },
  {
    path: 'track/:id',
    loadComponent: () => import('./pages/detail/detail').then((m) => m.Detail),
    data: { kind: 'track' },
    title: 'Bài hát — spotife',
  },
  {
    path: 'artist/:id',
    loadComponent: () => import('./pages/detail/detail').then((m) => m.Detail),
    data: { kind: 'artist' },
    title: 'Nghệ sĩ — spotife',
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search').then((m) => m.Search),
    title: 'Khám phá — spotife',
  },
  {
    path: 'library',
    loadComponent: () => import('./pages/library/library').then((m) => m.Library),
    title: 'Thư viện — spotife',
  },
  {
    path: 'artists',
    loadComponent: () => import('./pages/artists/artists').then((m) => m.Artists),
    title: 'Nghệ sĩ — spotife',
  },
  {
    path: 'feedback',
    loadComponent: () => import('./pages/feedback/feedback').then((m) => m.FeedbackPage),
    title: 'Gửi cảm nhận — spotife',
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    title: 'Quản trị — spotife',
  },
  {
    path: 'admin/:section',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    title: 'Quản trị — spotife',
  },
  { path: '**', redirectTo: '' },
];
