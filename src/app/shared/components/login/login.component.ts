import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Login component that redirects to Company app for authentication
 * This app doesn't handle login directly - users login via Company app
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <div class="redirect-container">
      <div class="redirect-message">
        <h2>Redirecting to login...</h2>
        <p>You will be redirected to the Company portal to sign in.</p>
        <div class="spinner"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .redirect-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .redirect-message {
        background: white;
        border-radius: 12px;
        padding: 60px 40px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 400px;

        h2 {
          color: #333;
          margin-bottom: 15px;
        }

        p {
          color: #666;
          margin-bottom: 30px;
        }
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `
  ]
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
