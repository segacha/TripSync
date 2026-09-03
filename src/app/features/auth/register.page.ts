import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageSwitchComponent } from '../../shared/language-switch.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LanguageSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display:flex; min-height:100vh; font-family:'Outfit',sans-serif;">

      <!-- Selector de idioma -->
      <div style="position:fixed; top:20px; right:24px; z-index:10;">
        <app-language-switch variant="dark" />
      </div>

      <!-- Panel izquierdo (form) -->
      <div style="flex:1; background:#f8fafc; display:flex; align-items:center; justify-content:center; padding:48px; min-height:100vh;">
        <div style="background:white; border-radius:20px; padding:48px; width:100%; max-width:400px; box-shadow:0 4px 24px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
          <h2 style="font-size:28px; font-weight:700; color:#0f172a; margin-bottom:6px; letter-spacing:-0.4px;">{{ t('register.title') }}</h2>
          <p style="color:#64748b; font-size:15px; margin-bottom:32px;">{{ t('register.subtitle') }}</p>

          <form [formGroup]="form" (ngSubmit)="submit()" style="display:flex; flex-direction:column; gap:20px;">
            <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:14px; font-weight:500; color:#374151;">{{ t('auth.email') }}</label>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                [placeholder]="t('auth.emailPlaceholder')"
                class="auth-input"
                style="padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:15px; outline:none; background:white; color:#0f172a; font-family:'Outfit',sans-serif; transition:border-color 0.2s, box-shadow 0.2s;"
              />
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:14px; font-weight:500; color:#374151;">{{ t('auth.password') }}</label>
              <input
                type="password"
                formControlName="password"
                autocomplete="new-password"
                [placeholder]="t('register.passwordPlaceholder')"
                class="auth-input"
                style="padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:15px; outline:none; background:white; color:#0f172a; font-family:'Outfit',sans-serif; transition:border-color 0.2s, box-shadow 0.2s;"
              />
            </div>

            @if (errorMessage()) {
              <div style="color:#ef4444; font-size:13px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 12px;">
                {{ errorMessage() }}
              </div>
            }
            @if (alreadyRegistered()) {
              <div style="color:#92400e; font-size:13px; background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px 12px;">
                {{ t('register.alreadyRegistered') }}
                <a routerLink="/login" style="color:#b45309; font-weight:600; text-decoration:underline;">
                  {{ t('register.loginLink') }}
                </a>
              </div>
            }
            @if (successMessage()) {
              <div style="color:#16a34a; font-size:13px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 12px;">
                {{ successMessage() }}
                @if (canResend()) {
                  <div style="margin-top:6px; color:#166534;">
                    {{ t('register.noEmailHint') }}
                    <button
                      type="button"
                      (click)="resendConfirmation()"
                      [disabled]="resending()"
                      style="background:none; border:none; padding:0; color:#15803d; font-weight:600; font-size:13px; text-decoration:underline; cursor:pointer; font-family:'Outfit',sans-serif;"
                    >
                      {{ resending() ? t('register.resending') : t('register.resend') }}
                    </button>
                  </div>
                }
              </div>
            }

            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              style="padding:13px; color:white; border:none; border-radius:50px; font-size:15px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; display:flex; align-items:center; justify-content:center; margin-top:4px; transition:background 0.2s;"
              [style.background]="form.invalid || loading() ? '#fdba74' : '#f97316'"
              [style.cursor]="form.invalid || loading() ? 'not-allowed' : 'pointer'"
            >
              {{ loading() ? t('register.submitting') : t('register.submit') }}
            </button>
          </form>

          <p style="text-align:center; margin-top:24px; font-size:14px; color:#64748b;">
            {{ t('register.haveAccount') }}
            <a routerLink="/login" style="color:#f97316; font-weight:600; text-decoration:none;">{{ t('register.loginLink') }}</a>
          </p>
        </div>
      </div>

      <!-- Panel derecho (brand) -->
      <div style="flex:1; background:linear-gradient(135deg,#f97316 0%,#ea580c 100%); display:flex; align-items:center; justify-content:center; padding:48px; min-height:100vh;">
        <div style="max-width:380px; width:100%;">
          <!-- Logo -->
          <a routerLink="/" style="display:flex; align-items:center; gap:12px; margin-bottom:36px; text-decoration:none;">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.2)"/>
              <path d="M18 8 L26 14 L26 22 C26 25 23 28 18 30 C13 28 10 25 10 22 L10 14 Z" fill="white" opacity="0.9"/>
              <circle cx="18" cy="19" r="4" fill="#f97316"/>
            </svg>
            <span style="font-size:24px; font-weight:700; color:white; letter-spacing:-0.3px;">TripSync</span>
          </a>
          <!-- Slogan -->
          <h1 style="font-size:32px; font-weight:700; color:white; line-height:1.2; margin-bottom:36px; letter-spacing:-0.5px;">
            {{ t('register.brandTitle') }}
          </h1>
          <!-- Features -->
          <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:16px;">
            <li style="display:flex; align-items:center; gap:12px; color:rgba(255,255,255,0.92); font-size:16px;">
              <span style="font-size:20px; width:36px; height:36px; background:rgba(255,255,255,0.2); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">✈️</span>
              {{ t('register.brandPoint1') }}
            </li>
            <li style="display:flex; align-items:center; gap:12px; color:rgba(255,255,255,0.92); font-size:16px;">
              <span style="font-size:20px; width:36px; height:36px; background:rgba(255,255,255,0.2); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">📍</span>
              {{ t('register.brandPoint2') }}
            </li>
            <li style="display:flex; align-items:center; gap:12px; color:rgba(255,255,255,0.92); font-size:16px;">
              <span style="font-size:20px; width:36px; height:36px; background:rgba(255,255,255,0.2); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">🤝</span>
              {{ t('register.brandPoint3') }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-input:focus {
      border-color: #f97316 !important;
      box-shadow: 0 0 0 3px rgba(249,115,22,0.12) !important;
    }
  `],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly t = inject(I18nService).t;
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly alreadyRegistered = signal(false);
  protected readonly canResend = signal(false);
  protected readonly resending = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected async resendConfirmation() {
    if (this.resending()) return;
    this.resending.set(true);
    this.errorMessage.set(null);
    try {
      await this.auth.resendSignUpConfirmation(this.form.getRawValue().email);
      this.successMessage.set(this.t('register.resent'));
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : this.t('common.unknownError'));
    } finally {
      this.resending.set(false);
    }
  }

  protected async submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.alreadyRegistered.set(false);
    this.canResend.set(false);
    try {
      const { email, password } = this.form.getRawValue();
      const outcome = await this.auth.signUp(email, password);

      if (outcome.status === 'signed_in') {
        await this.router.navigateByUrl('/trips');
      } else if (outcome.status === 'already_registered') {
        this.alreadyRegistered.set(true);
      } else {
        this.successMessage.set(this.t('register.confirmEmail'));
        this.canResend.set(true);
      }
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : this.t('common.unknownError'));
    } finally {
      this.loading.set(false);
    }
  }
}
