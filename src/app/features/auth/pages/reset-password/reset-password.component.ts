import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { ToastService } from '../../../../core/notifications/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GlassButtonComponent],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  public userId = '';
  public code = '';
  public password = '';
  public confirmPassword = '';
  public readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParams['userId'] || '';
    this.code = this.route.snapshot.queryParams['code'] || '';
  }

  public onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      this.toast.error('Mismatch', 'Passwords do not match.');
      return;
    }

    this.isLoading.set(true);
    this.auth.resetPassword({ userId: this.userId, code: this.code, password: this.password, confirmPassword: this.confirmPassword }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Success', 'Password updated. You may now sign in.');
        this.router.navigate(['/auth/login']);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
