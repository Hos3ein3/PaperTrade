import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ThemeService } from '../../../../core/theme/theme.service';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { ToastService } from '../../../../core/notifications/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GlassButtonComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  public readonly theme = inject(ThemeService);

  public email = 'trader@trackerpro.io';
  public password = 'Password123!';
  public rememberMe = true;
  public readonly showPassword = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);

  public onSubmit(): void {
    if (!this.email || !this.password) return;

    this.isLoading.set(true);
    this.auth.login({ email: this.email, password: this.password, rememberMe: this.rememberMe }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.succeeded) {
          this.toast.success('Welcome Back', 'Signed in to trading terminal.');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/trading';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.toast.error('Sign In Failed', res.message || 'Invalid credentials.');
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  public loginWithGoogle(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/trading';
    this.auth.redirectToGoogle('signin', returnUrl);
  }
}
