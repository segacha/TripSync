import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display:flex; min-height:100vh; font-family:'Outfit',sans-serif;">

      <!-- Panel izquierdo (brand) -->
      <div style="flex:1; background:linear-gradient(135deg,#f97316 0%,#ea580c 100%); display:flex; align-items:center; justify-content:center; padding:48px; min-height:100vh;">
        <div style="max-width:380px; width:100%;">
          <!-- Logo -->
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:36px;">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.2)"/>
              <path d="M18 8 L26 14 L26 22 C26 25 23 28 18 30 C13 28 10 25 10 22 L10 14 Z" fill="white" opacity="0.9"/>
              <circle cx="18" cy="19" r="4" fill="#f97316"/>
            </svg>
            <span style="font-size:24px; font-weight:700; color:white; letter-spacing:-0.3px;">TripSync</span>
          </div>
          <!-- Slogan -->
          <h1 style="font-size:32px; font-weight:700; color:white; line-height:1.2; margin-bottom:36px; letter-spacing:-0.5px;">
            Planifica viajes, a tu manera.
          </h1>
          <!-- Features -->
          <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:16px;">
            <li style="display:flex; align-items:center; gap:12px; color:rgba(255,255,255,0.92); font-size:16px;">
              <span style="font-size:20px; width:36px; height:36px; background:rgba(255,255,255,0.2); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">🗓️</span>
              Itinerarios día por día
            </li>
            <li style="display:flex; align-items:center; gap:12px; color:rgba(255,255,255,0.92); font-size:16px;">
              <span style="font-size:20px; width:36px; height:36px; background:rgba(255,255,255,0.2); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">🗺️</span>
              Mapa interactivo en tiempo real
            </li>
            <li style="display:flex; align-items:center; gap:12px; color:rgba(255,255,255,0.92); font-size:16px;">
              <span style="font-size:20px; width:36px; height:36px; background:rgba(255,255,255,0.2); border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">👥</span>
              Colaboración con amigos
            </li>
          </ul>
        </div>
      </div>

      <!-- Panel derecho (form) -->
      <div style="flex:1; background:#f8fafc; display:flex; align-items:center; justify-content:center; padding:48px; min-height:100vh;">
        <div style="background:white; border-radius:20px; padding:48px; width:100%; max-width:400px; box-shadow:0 4px 24px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
          <h2 style="font-size:28px; font-weight:700; color:#0f172a; margin-bottom:6px; letter-spacing:-0.4px;">Bienvenido</h2>
          <p style="color:#64748b; font-size:15px; margin-bottom:32px;">Ingresá a tu cuenta para continuar</p>

          <form [formGroup]="form" (ngSubmit)="submit()" style="display:flex; flex-direction:column; gap:20px;">
            <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:14px; font-weight:500; color:#374151;">Email</label>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="tu@email.com"
                class="auth-input"
                style="padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:15px; outline:none; background:white; color:#0f172a; font-family:'Outfit',sans-serif; transition:border-color 0.2s, box-shadow 0.2s;"
              />
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="font-size:14px; font-weight:500; color:#374151;">Contraseña</label>
              <input
                type="password"
                formControlName="password"
                autocomplete="current-password"
                placeholder="••••••••"
                class="auth-input"
                style="padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:15px; outline:none; background:white; color:#0f172a; font-family:'Outfit',sans-serif; transition:border-color 0.2s, box-shadow 0.2s;"
              />
            </div>

            @if (errorMessage()) {
              <div style="color:#ef4444; font-size:13px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 12px;">
                {{ errorMessage() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              style="padding:13px; background:#f97316; color:white; border:none; border-radius:50px; font-size:15px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; display:flex; align-items:center; justify-content:center; margin-top:4px; transition:background 0.2s;"
              [style.background]="form.invalid || loading() ? '#fdba74' : '#f97316'"
              [style.cursor]="form.invalid || loading() ? 'not-allowed' : 'pointer'"
            >
              {{ loading() ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <p style="text-align:center; margin-top:24px; font-size:14px; color:#64748b;">
            ¿No tenés cuenta?
            <a routerLink="/register" style="color:#f97316; font-weight:600; text-decoration:none;">Registrate</a>
          </p>
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
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected async submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.signIn(email, password);
      await this.router.navigateByUrl('/trips');
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      this.loading.set(false);
    }
  }
}
