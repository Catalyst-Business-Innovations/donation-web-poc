import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Redirect to Company app login
    setTimeout(() => {
      this.authService.redirectToLogin();
    }, 1500); // Brief delay to show the message
  }
}
