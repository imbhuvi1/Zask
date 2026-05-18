import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ProfilePreviewService {
  private authService = inject(AuthService);

  isOpen = signal(false);
  previewUser = signal<User | null>(null);
  position = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  isLoading = signal(false);

  open(userId: number, event: MouseEvent) {
    event.stopPropagation();

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.right + 8;
    const y = rect.top;

    // Clamp to viewport
    const clampedX = Math.min(x, window.innerWidth - 280);
    const clampedY = Math.min(y, window.innerHeight - 200);

    this.position.set({ x: clampedX, y: clampedY });
    this.isOpen.set(true);
    this.isLoading.set(true);
    this.previewUser.set(null);

    this.authService.getUserById(userId).subscribe({
      next: (user) => {
        this.previewUser.set(user);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  close() {
    this.isOpen.set(false);
    this.previewUser.set(null);
  }
}
