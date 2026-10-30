import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      login: vi.fn().mockReturnValue(of({ succeeded: true })),
      redirectToGoogle: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create LoginComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct tabindex attributes for seamless keyboard navigation', () => {
    const el: HTMLElement = fixture.nativeElement;
    const emailInput = el.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = el.querySelector('input[name="password"]') as HTMLInputElement;
    const rememberCheckbox = el.querySelector('input[name="rememberMe"]') as HTMLInputElement;
    const forgotPasswordLink = el.querySelector('a[routerLink="/auth/forgot-password"]') as HTMLElement;
    const eyeButton = el.querySelector('button[title="Toggle password visibility"]') as HTMLButtonElement;
    const submitBtn = el.querySelector('app-glass-button[type="submit"]') as HTMLElement;

    expect(emailInput?.getAttribute('tabindex')).toBe('1');
    expect(passwordInput?.getAttribute('tabindex')).toBe('2');
    expect(eyeButton?.getAttribute('tabindex')).toBe('-1');
    expect(rememberCheckbox?.getAttribute('tabindex')).toBe('3');
    expect(forgotPasswordLink?.getAttribute('tabindex')).toBe('4');
    expect(submitBtn?.getAttribute('tabindex')).toBe('5');
  });

  it('should invoke redirectToGoogle and not open any modal when Continue with Google is clicked', () => {
    const el: HTMLElement = fixture.nativeElement;
    const buttons = Array.from(el.querySelectorAll('button'));
    const googleBtn = buttons.find((b) => b.textContent?.includes('Continue with Google')) as HTMLButtonElement;
    expect(googleBtn).toBeTruthy();
    googleBtn.click();

    expect(authServiceSpy.redirectToGoogle).toHaveBeenCalledWith('signin', '/trading');

    // Confirm that there is no in-app Google prompt modal
    const modal = el.querySelector('.fixed.inset-0');
    expect(modal).toBeNull();
  });
});
