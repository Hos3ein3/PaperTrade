import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: any;
  let httpSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      login: vi.fn().mockReturnValue(of({ succeeded: true })),
      redirectToGoogle: vi.fn(),
      handleAuthSuccess: vi.fn(),
    };

    httpSpy = {
      post: vi.fn().mockReturnValue(of({ token: 'mock-google-jwt-123', refreshToken: 'mock-refresh-456' })),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: HttpClient, useValue: httpSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create LoginComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should render the #btn container for Google Identity Services', () => {
    expect(component.btn).toBeTruthy();
    expect(component.btn.nativeElement).toBeDefined();
  });

  it('should handle onGoogle callback and store access_token in localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const mockIdToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...';

    component.onGoogle(mockIdToken);

    expect(httpSpy.post).toHaveBeenCalled();
    const [calledUrl, body] = httpSpy.post.mock.calls[0];
    expect(calledUrl).toContain('/auth/google');
    expect(body).toEqual({ idToken: mockIdToken });
    expect(setItemSpy).toHaveBeenCalledWith('access_token', 'mock-google-jwt-123');
    expect(authServiceSpy.handleAuthSuccess).toHaveBeenCalledWith(
      'mock-google-jwt-123',
      'mock-refresh-456',
      expect.any(Object)
    );
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

  it('should invoke redirectToGoogle and not open any modal when Continue with Google fallback is clicked', () => {
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
