import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../../services/library-service';
import { ThemeService } from '../../../services/theme-service';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  readonly library = inject(LibraryService);
  readonly themeService = inject(ThemeService);

  save(form: NgForm): void {
    if (form.invalid || !String(form.value.name).trim()) {
      form.control.markAllAsTouched();
      return;
    }
    this.library.saveName(form.value.name);
  }
}
