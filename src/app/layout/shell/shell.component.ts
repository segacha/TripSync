import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[100dvh] flex flex-col">
      <header class="fixed top-0 left-0 right-0 z-30 h-[60px]"
        style="background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0;">
        <div class="h-full flex items-center justify-between px-6 mx-auto" style="max-width: 1200px;">

          <!-- Logo -->
          <a routerLink="/trips" class="flex items-center gap-2 no-underline"
            style="opacity: 1; transition: opacity 0.15s;"
            onmouseenter="this.style.opacity='0.8'" onmouseleave="this.style.opacity='1'">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#fff3e8"/>
              <path d="M18 8 L26 14 L26 22 C26 25 23 28 18 30 C13 28 10 25 10 22 L10 14 Z" fill="#f97316" opacity="0.9"/>
              <circle cx="18" cy="19" r="4" fill="white"/>
            </svg>
            <span style="font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">TripSync</span>
          </a>

          <!-- Nav -->
          <nav class="flex items-center gap-2">
            <a
              routerLink="/trips"
              routerLinkActive="active-nav"
              class="nav-link"
              style="font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; padding: 6px 14px; border-radius: 8px; text-decoration: none; transition: color 0.15s;"
            >
              Mis viajes
            </a>
          </nav>

          <!-- Right: avatar button + dropdown -->
          <div style="position:relative;">

            <!-- Avatar button -->
            <button
              type="button"
              (click)="showProfileMenu.set(!showProfileMenu())"
              style="display:flex; align-items:center; gap:10px; padding:4px 10px 4px 4px; border:1.5px solid #e2e8f0; border-radius:50px; background:white; cursor:pointer; transition:all 0.15s;"
              onmouseenter="this.style.borderColor='#f97316'; this.style.background='#fff7ed';"
              onmouseleave="if(!this.closest('[data-open]')) { this.style.borderColor='#e2e8f0'; this.style.background='white'; }"
              [attr.data-open]="showProfileMenu() ? '' : null"
            >
              @if (avatarUrl()) {
                <img [src]="avatarUrl()!" alt="Avatar"
                  style="width:30px; height:30px; border-radius:50%; object-fit:cover; flex-shrink:0;">
              } @else {
                <div style="width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#f97316,#ea580c); color:white; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0;">
                  {{ email().charAt(0).toUpperCase() || '?' }}
                </div>
              }
              <span style="font-size:13px; font-weight:500; color:#374151; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                {{ email() }}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                [style.transform]="showProfileMenu() ? 'rotate(180deg)' : 'none'" style="transition:transform 0.2s; flex-shrink:0;">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <!-- Dropdown menu -->
            @if (showProfileMenu()) {
              <!-- Backdrop -->
              <div style="position:fixed; inset:0; z-index:40;" (click)="showProfileMenu.set(false)"></div>

              <!-- Panel -->
              <div style="position:absolute; top:calc(100% + 8px); right:0; width:260px; background:white; border:1.5px solid #e2e8f0; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.12); z-index:50; overflow:hidden;">

                <!-- Profile info -->
                <div style="padding:16px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:12px;">
                  @if (avatarUrl()) {
                    <img [src]="avatarUrl()!" alt="Avatar"
                      style="width:44px; height:44px; border-radius:50%; object-fit:cover; flex-shrink:0; border:2px solid #e2e8f0;">
                  } @else {
                    <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg,#f97316,#ea580c); color:white; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; flex-shrink:0;">
                      {{ email().charAt(0).toUpperCase() || '?' }}
                    </div>
                  }
                  <div style="flex:1; min-width:0;">
                    <p style="margin:0; font-size:13px; font-weight:600; color:#0f172a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                      {{ email() }}
                    </p>
                    <p style="margin:2px 0 0; font-size:12px; color:#94a3b8;">Tu cuenta</p>
                  </div>
                </div>

                <!-- Actions -->
                <div style="padding:8px;">
                  <!-- Upload avatar -->
                  <input #avatarInput type="file" accept="image/*" style="display:none" (change)="onAvatarChange($event)">
                  <button
                    type="button"
                    (click)="avatarInput.click()"
                    [disabled]="uploadingAvatar()"
                    style="width:100%; display:flex; align-items:center; gap:10px; padding:10px 12px; background:transparent; border:none; border-radius:10px; cursor:pointer; text-align:left; transition:background 0.15s; font-family:'Outfit',sans-serif;"
                    onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background='transparent'"
                  >
                    <span style="width:32px; height:32px; border-radius:8px; background:#fff7ed; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <div>
                      <p style="margin:0; font-size:14px; font-weight:500; color:#0f172a;">
                        {{ uploadingAvatar() ? 'Subiendo...' : 'Cambiar foto de perfil' }}
                      </p>
                      <p style="margin:0; font-size:12px; color:#94a3b8;">JPG, PNG o GIF</p>
                    </div>
                  </button>

                  <div style="height:1px; background:#f1f5f9; margin:4px 0;"></div>

                  <!-- Logout -->
                  <button
                    type="button"
                    (click)="logout()"
                    style="width:100%; display:flex; align-items:center; gap:10px; padding:10px 12px; background:transparent; border:none; border-radius:10px; cursor:pointer; text-align:left; transition:background 0.15s; font-family:'Outfit',sans-serif;"
                    onmouseenter="this.style.background='#fef2f2'" onmouseleave="this.style.background='transparent'"
                  >
                    <span style="width:32px; height:32px; border-radius:8px; background:#fef2f2; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                    </span>
                    <p style="margin:0; font-size:14px; font-weight:500; color:#ef4444;">Cerrar sesión</p>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </header>

      <main class="flex-1">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .nav-link:hover { color: #f97316 !important; }
    :host ::ng-deep .active-nav { color: #f97316 !important; background: #fff7ed; font-weight: 600 !important; }
  `],
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  protected readonly email = computed(() => this.auth.user()?.email ?? '');
  protected readonly avatarUrl = signal<string | null>(null);
  protected readonly showProfileMenu = signal(false);
  protected readonly uploadingAvatar = signal(false);

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.profileService.getProfile(user.id).then((profile) => {
          this.avatarUrl.set(profile?.avatar_url ?? null);
        });
      } else {
        this.avatarUrl.set(null);
      }
    });
  }

  protected async onAvatarChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const user = this.auth.user();
    if (!user) return;
    this.uploadingAvatar.set(true);
    try {
      const url = await this.profileService.uploadAvatar(user.id, file);
      await this.profileService.upsertProfile(user.id, { avatar_url: url });
      this.avatarUrl.set(url);
    } catch (err) {
      console.error('Error subiendo foto de perfil:', err);
    } finally {
      this.uploadingAvatar.set(false);
      (event.target as HTMLInputElement).value = '';
      this.showProfileMenu.set(false);
    }
  }

  protected async logout() {
    this.showProfileMenu.set(false);
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
  }
}
