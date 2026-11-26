import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'admin/:section', renderMode: RenderMode.Client },
  { path: 'playlist/:id', renderMode: RenderMode.Client },
  { path: 'track/:id', renderMode: RenderMode.Client },
  { path: 'artist/:id', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
