import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DevAuthService } from '@core/services/dev-auth.service';
import { STORAGE_KEYS } from '@core/constants/storage-keys';

@Component({
  selector: 'app-donor-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './donor-login.component.html',
  styleUrl: './donor-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonorLoginComponent {
  private readonly router = inject(Router);
  private readonly devAuth = inject(DevAuthService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  login(): void {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }

    this.loading.set(true);

    // Simulate network delay
    setTimeout(() => {
      this.loading.set(false);

      if (this.password === 'wrong') {
        this.error.set('Invalid email or password. Please try again.');
        return;
      }

      // Create simulated JWT session — matches donor by email
      this.devAuth.loginAsDonor(this.email);

      const returnUrl = sessionStorage.getItem(STORAGE_KEYS.DONOR_RETURN_URL) || '/donor/dashboard';
      sessionStorage.removeItem(STORAGE_KEYS.DONOR_RETURN_URL);
      this.router.navigateByUrl(returnUrl);
    }, 600);
  }
}
