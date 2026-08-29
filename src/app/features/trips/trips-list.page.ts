import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Trip } from '../../core/models/trip.model';
import { TripsService } from '../../core/services/trips.service';

@Component({
  selector: 'app-trips-list-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="min-height:100vh; background:#f8fafc; padding-top:80px; padding-bottom:60px; font-family:'Outfit',sans-serif;">

      <!-- Page header -->
      <div style="max-width:1100px; margin:0 auto; padding:0 24px 24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
        <div>
          <h1 style="font-size:30px; font-weight:700; color:#0f172a; margin:0 0 4px; letter-spacing:-0.5px;">Mis viajes</h1>
          <p style="color:#64748b; font-size:15px; margin:0;">Organizá y planificá tus próximas aventuras</p>
        </div>
        <button
          type="button"
          (click)="toggleForm()"
          style="display:flex; align-items:center; gap:8px; padding:11px 22px; background:#f97316; color:white; border:none; border-radius:50px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s;"
          onmouseenter="this.style.background='#ea580c'" onmouseleave="this.style.background='#f97316'"
        >
          <span style="font-size:18px; line-height:1;">+</span>
          Nuevo viaje
        </button>
      </div>

      <!-- Success toast -->
      @if (successMessage()) {
        <div style="max-width:1100px; margin:0 auto 16px; padding:0 24px;">
          <div style="display:flex; align-items:center; gap:8px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px 20px; color:#166534; font-size:14px;">
            <span style="color:#16a34a;">✓</span> {{ successMessage() }}
          </div>
        </div>
      }

      <!-- Create form (expandable) -->
      <div style="max-width:1100px; margin:0 auto; padding:0 24px; overflow:hidden; transition:max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s, margin-bottom 0.35s;"
        [style.max-height]="showForm() ? '260px' : '0'"
        [style.opacity]="showForm() ? '1' : '0'"
        [style.margin-bottom]="showForm() ? '28px' : '0'">
        <form [formGroup]="form" (ngSubmit)="create()"
          style="background:white; border:1.5px solid #e2e8f0; border-radius:16px; padding:24px; display:flex; flex-direction:column; gap:16px;">
          <h3 style="font-size:16px; font-weight:600; color:#0f172a; margin:0;">Nuevo viaje</h3>
          <div style="display:flex; gap:14px; flex-wrap:wrap;">
            <div style="flex:1; min-width:180px; display:flex; flex-direction:column; gap:5px;">
              <label style="font-size:13px; font-weight:500; color:#374151;">Título del viaje *</label>
              <input
                type="text"
                formControlName="title"
                placeholder="Ej: Europa 2025"
                class="trip-input"
                style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
              />
            </div>
            <div style="flex:2; min-width:180px; display:flex; flex-direction:column; gap:5px;">
              <label style="font-size:13px; font-weight:500; color:#374151;">Descripción (opcional)</label>
              <input
                type="text"
                formControlName="description"
                placeholder="Añadí una breve descripción..."
                class="trip-input"
                style="padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
              />
            </div>
          </div>
          @if (errorMessage()) {
            <p style="color:#ef4444; font-size:13px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 12px; margin:0;">{{ errorMessage() }}</p>
          }
          <div style="display:flex; gap:10px;">
            <button
              type="submit"
              [disabled]="form.invalid || saving()"
              style="padding:10px 20px; color:white; border:none; border-radius:50px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s;"
              [style.background]="form.invalid || saving() ? '#fdba74' : '#f97316'"
              [style.cursor]="form.invalid || saving() ? 'not-allowed' : 'pointer'"
            >
              {{ saving() ? 'Creando...' : 'Crear viaje' }}
            </button>
            <button
              type="button"
              (click)="toggleForm()"
              style="padding:10px 20px; background:transparent; color:#64748b; border:1.5px solid #e2e8f0; border-radius:50px; font-size:14px; font-weight:500; cursor:pointer; font-family:'Outfit',sans-serif;"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Content area -->
      <div style="max-width:1100px; margin:0 auto; padding:0 24px;">

        @if (loading()) {
          <!-- Skeletons -->
          <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px;">
            @for (i of skeletons; track i) {
              <div style="background:white; border:1.5px solid #e2e8f0; border-radius:18px; padding:24px;">
                <div class="shimmer" style="width:60px; height:22px; border-radius:50px; margin-bottom:16px;"></div>
                <div class="shimmer" style="width:70%; height:24px; border-radius:6px; margin-bottom:10px;"></div>
                <div class="shimmer" style="width:90%; height:16px; border-radius:6px; margin-bottom:6px;"></div>
                <div class="shimmer" style="width:60%; height:16px; border-radius:6px; margin-bottom:20px;"></div>
                <div class="shimmer" style="width:40%; height:14px; border-radius:6px;"></div>
              </div>
            }
          </div>

        } @else if (trips().length === 0) {
          <!-- Empty state -->
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 24px; text-align:center;">
            <div class="float-soft" style="font-size:56px; margin-bottom:20px;">🗺️</div>
            <h3 style="font-size:22px; font-weight:700; color:#0f172a; margin:0 0 8px;">¡Aún no tenés viajes!</h3>
            <p style="font-size:15px; color:#64748b; margin:0 0 28px; max-width:360px; line-height:1.6;">
              Creá tu primer viaje y empezá a planificar tu aventura
            </p>
            <button
              type="button"
              (click)="toggleForm()"
              style="padding:10px 20px; background:#f97316; color:white; border:none; border-radius:50px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s;"
              onmouseenter="this.style.background='#ea580c'" onmouseleave="this.style.background='#f97316'"
            >
              + Crear mi primer viaje
            </button>
          </div>

        } @else {
          <!-- Trips grid -->
          <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px;">
            @for (trip of trips(); track trip.id) {
              <div
                class="trip-card"
                style="background:white; border:1.5px solid #e2e8f0; border-radius:18px; padding:24px; box-shadow:0 1px 4px rgba(0,0,0,0.04); cursor:default; transition:box-shadow 0.2s, transform 0.2s; display:flex; flex-direction:column; gap:8px;"
                onmouseenter="this.style.boxShadow='0 8px 28px rgba(0,0,0,0.1)'; this.style.transform='translateY(-2px)';"
                onmouseleave="this.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'; this.style.transform='translateY(0)';"
              >
                <!-- Badge -->
                <div style="display:inline-flex; align-items:center; gap:6px; background:#fff7ed; color:#ea580c; border:1px solid #fed7aa; border-radius:50px; padding:3px 10px; font-size:12px; font-weight:600; width:fit-content;">
                  <span class="pulse-soft" style="width:7px; height:7px; background:#f97316; border-radius:50%; display:inline-block; flex-shrink:0;"></span>
                  Viaje
                </div>

                <h3 style="font-size:20px; font-weight:700; color:#0f172a; margin:0; letter-spacing:-0.3px;">{{ trip.title }}</h3>

                @if (trip.description) {
                  <p style="font-size:14px; color:#64748b; line-height:1.5; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; margin:0;">
                    {{ trip.description }}
                  </p>
                }

                <p style="font-size:12px; color:#94a3b8; margin:0;">{{ trip.created_at | date: 'mediumDate' }}</p>

                <!-- Footer -->
                <div style="margin-top:8px; border-top:1px solid #f1f5f9; padding-top:12px;">
                  <a
                    [routerLink]="['/trips', trip.id]"
                    class="open-link"
                    style="font-size:14px; font-weight:600; color:#f97316; cursor:pointer; display:inline-flex; align-items:center; gap:5px; text-decoration:none; transition:color 0.15s;"
                    onmouseenter="this.style.color='#ea580c'; this.querySelector('.open-arrow').style.transform='translateX(4px)';"
                    onmouseleave="this.style.color='#f97316'; this.querySelector('.open-arrow').style.transform='translateX(0)';"
                  >
                    Abrir
                    <span class="open-arrow" style="display:inline-block; transition:transform 0.2s;">→</span>
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .trip-input:focus {
      border-color: #f97316 !important;
      box-shadow: 0 0 0 3px rgba(249,115,22,0.1) !important;
    }
  `],
})
export class TripsListPage {
  private readonly tripsService = inject(TripsService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly trips = signal<Trip[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly skeletons = [0, 1, 2];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
  });

  constructor() {
    this.refresh();
  }

  protected toggleForm() {
    this.showForm.update((v) => !v);
    this.errorMessage.set(null);
    if (!this.showForm()) {
      this.form.reset({ title: '', description: '' });
    }
  }

  protected async create() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    try {
      const { title, description } = this.form.getRawValue();
      const trip = await this.tripsService.create({
        title: title.trim(),
        description: description.trim() || null,
      });
      this.showForm.set(false);
      this.form.reset({ title: '', description: '' });
      this.successMessage.set('¡Viaje creado exitosamente!');
      setTimeout(() => this.successMessage.set(null), 3000);
      await this.router.navigate(['/trips', trip.id]);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      this.saving.set(false);
    }
  }

  private async refresh() {
    this.loading.set(true);
    try {
      this.trips.set(await this.tripsService.listMine());
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      this.loading.set(false);
    }
  }
}
