import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

/** Default delay in milliseconds before redirecting to the login page */
const DEFAULT_REDIRECT_DELAY_MS = 1500;

/**
 * Login component that redirects to Company app for authentication
 * This app doesn't handle login directly - users login via Company app
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  /** Delay in milliseconds before redirecting to the Company app login page */
  readonly redirectDelayMs = input<number>(DEFAULT_REDIRECT_DELAY_MS);

  private authService = inject(AuthService);

  ngOnInit(): void {
    // Redirect to Company app login
    setTimeout(() => {
      this.authService.redirectToLogin();
    }, this.redirectDelayMs());
  }
}
