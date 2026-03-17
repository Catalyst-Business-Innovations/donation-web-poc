import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './staff-login.component.html',
  styleUrl: './staff-login.component.scss'
})
export class StaffLoginComponent implements OnInit {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Clear any previous session when landing on login page
    sessionStorage.removeItem('staff_authenticated');
    sessionStorage.removeItem('staff_username');
  }

  login(): void {
    this.error.set('');
    if (!this.username || !this.password) {
      this.error.set('Please enter your username and password.');
      return;
    }
    this.loading.set(true);
    // Simulate auth — replace with real token exchange when company SSO is available
    setTimeout(() => {
      this.loading.set(false);
      if (this.password === 'wrong') {
        this.error.set('Invalid credentials. Please try again.');
      } else {
        sessionStorage.setItem('staff_authenticated', 'true');
        sessionStorage.setItem('staff_username', this.username);
        const returnUrl = sessionStorage.getItem('staff_return_url') || '/staff/new-donation';
        sessionStorage.removeItem('staff_return_url');
        this.router.navigateByUrl(returnUrl);
      }
    }, 600);
  }
}
