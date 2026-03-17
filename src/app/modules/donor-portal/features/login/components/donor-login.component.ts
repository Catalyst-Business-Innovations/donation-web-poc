import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-donor-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './donor-login.component.html',
  styleUrl: './donor-login.component.scss'
})
export class DonorLoginComponent implements OnInit {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Clear any previous session when landing on login page
    sessionStorage.removeItem('donor_authenticated');
    sessionStorage.removeItem('donor_email');
  }

  login(): void {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    // Simulate auth — replace with real API call
    setTimeout(() => {
      this.loading.set(false);
      if (this.password === 'wrong') {
        this.error.set('Invalid email or password. Please try again.');
      } else {
        // Store a minimal session token in sessionStorage for the guard to read
        sessionStorage.setItem('donor_authenticated', 'true');
        sessionStorage.setItem('donor_email', this.email);
        const returnUrl = sessionStorage.getItem('donor_return_url') || '/donor/dashboard';
        sessionStorage.removeItem('donor_return_url');
        this.router.navigateByUrl(returnUrl);
      }
    }, 600);
  }
}
