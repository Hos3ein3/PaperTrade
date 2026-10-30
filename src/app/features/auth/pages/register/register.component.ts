import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ThemeService } from '../../../../core/theme/theme.service';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { ToastService } from '../../../../core/notifications/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GlassButtonComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  public readonly theme = inject(ThemeService);

  public name = '';
  public email = '';
  public password = '';
  public confirmPassword = '';
  public readonly isLoading = signal<boolean>(false);

  public onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      this.toast.error('Mismatch', 'Passwords do not match.');
      return;
    }

    this.isLoading.set(true);
    this.auth.register({ name: this.name, email: this.email, password: this.password, confirmPassword: this.confirmPassword }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toast.success('Registration Complete', res?.message || 'Check your email to confirm your account.');
        this.router.navigate(['/auth/login']);
      },
      error: () => this.isLoading.set(false),
    });
  }

  public registerWithGoogle(): void {
    this.auth.redirectToGoogle('register', '/trading');
  }
}
