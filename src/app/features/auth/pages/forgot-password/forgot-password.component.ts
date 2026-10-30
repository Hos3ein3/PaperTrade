import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { ToastService } from '../../../../core/notifications/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GlassButtonComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  public email = '';
  public readonly isLoading = signal<boolean>(false);
  public readonly isSubmitted = signal<boolean>(false);

  public onSubmit(): void {
    if (!this.email) return;

    this.isLoading.set(true);
    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSubmitted.set(true);
        this.toast.success('Dispatched', 'Password reset instructions sent.');
      },
      error: () => this.isLoading.set(false),
    });
  }
}
