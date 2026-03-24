import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DevAuthService } from '@core/services/dev-auth.service';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './staff-login.component.html',
  styleUrl: './staff-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffLoginComponent {
  private readonly router = inject(Router);
  private readonly devAuth = inject(DevAuthService);

  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  login(): void {
    this.error.set('');
    if (!this.username || !this.password) {
      this.error.set('Please enter your username and password.');
      return;
    }

    this.loading.set(true);

    // Simulate network delay
    setTimeout(() => {
      this.loading.set(false);

      if (this.password === 'wrong') {
        this.error.set('Invalid credentials. Please try again.');
        return;
      }

      // Create simulated JWT session
      this.devAuth.loginAsStaff(this.username);

      const returnUrl = sessionStorage.getItem(STORAGE_KEYS.STAFF_RETURN_URL) || '/staff/new-donation';
      sessionStorage.removeItem(STORAGE_KEYS.STAFF_RETURN_URL);
      this.router.navigateByUrl(returnUrl);
    }, 600);
  }
}
