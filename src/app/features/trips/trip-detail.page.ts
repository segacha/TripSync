import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Trip } from '../../core/models/trip.model';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { DAY_COLORS } from './trip-map.component';
import { DayCardComponent } from './day-card.component';
import { ItineraryStore } from './itinerary.store';
import { MembersPanelComponent } from './members-panel.component';
import { TripMapComponent } from './trip-map.component';
import { CostSummaryComponent } from './cost-summary.component';

@Component({
  selector: 'app-trip-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    CdkDropListGroup,
    DayCardComponent,
    MembersPanelComponent,
    TripMapComponent,
    CostSummaryComponent,
  ],
  providers: [ItineraryStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="min-height:100vh; background:#f8fafc; padding-top:60px; font-family:'Outfit',sans-serif;">

      @if (store.loading() && !store.trip()) {
        <!-- Loading skeleton -->
        <div style="max-width:1200px; margin:0 auto; padding:32px 24px;">
          <div style="height:160px; background:white; border-radius:18px; margin-bottom:24px; animation:pulse 1.5s infinite;"></div>
          <div style="display:grid; grid-template-columns:1fr 380px; gap:24px;">
            <div style="height:300px; background:white; border-radius:18px; animation:pulse 1.5s infinite;"></div>
            <div style="height:200px; background:white; border-radius:18px; animation:pulse 1.5s infinite;"></div>
          </div>
        </div>

      } @else if (store.trip(); as t) {

        <!-- Hero -->
        <div [style.background]="heroBackground(t)"
          style="padding:36px 0 40px; position:relative; background-size:cover; background-position:center;">
          <div style="max-width:1200px; margin:0 auto; padding:0 24px;">

            <!-- Top row: back button + owner actions -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
              <button
                routerLink="/trips"
                style="display:inline-flex; align-items:center; gap:6px; padding:7px 14px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); border-radius:50px; color:white; font-size:13px; cursor:pointer; font-weight:500; transition:background 0.15s;"
                onmouseenter="this.style.background='rgba(255,255,255,0.25)'"
                onmouseleave="this.style.background='rgba(255,255,255,0.15)'"
              >
                ← Mis viajes
              </button>

              @if (isOwner()) {
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <!-- Cover upload -->
                  <input #coverInput type="file" accept="image/*" style="display:none" (change)="onCoverChange($event)">
                  <button
                    type="button"
                    (click)="coverInput.click()"
                    [disabled]="savingMeta()"
                    style="display:inline-flex; align-items:center; gap:6px; padding:7px 14px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); border-radius:50px; color:white; font-size:13px; cursor:pointer; font-weight:500; transition:background 0.15s;"
                    onmouseenter="this.style.background='rgba(255,255,255,0.25)'"
                    onmouseleave="this.style.background='rgba(255,255,255,0.15)'"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    {{ savingMeta() ? 'Subiendo...' : (t.cover_url ? 'Cambiar portada' : 'Añadir portada') }}
                  </button>

                  <!-- Edit dates toggle -->
                  <button
                    type="button"
                    (click)="editingDates.set(!editingDates())"
                    style="display:inline-flex; align-items:center; gap:6px; padding:7px 14px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); border-radius:50px; color:white; font-size:13px; cursor:pointer; font-weight:500; transition:background 0.15s;"
                    onmouseenter="this.style.background='rgba(255,255,255,0.25)'"
                    onmouseleave="this.style.background='rgba(255,255,255,0.15)'"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {{ editingDates() ? 'Cancelar' : 'Editar fechas' }}
                  </button>
                </div>
              }
            </div>

            <h1 style="font-size:36px; font-weight:800; color:white; margin:0 0 8px; letter-spacing:-0.7px;">{{ t.title }}</h1>

            @if (t.description) {
              <p style="font-size:16px; color:rgba(255,255,255,0.85); margin:0 0 16px; max-width:600px; line-height:1.5;">{{ t.description }}</p>
            }

            <!-- Date edit form (owner only) -->
            @if (editingDates()) {
              <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.2); border-radius:14px; padding:16px 20px; margin-bottom:16px; display:flex; flex-direction:column; gap:10px; max-width:480px; backdrop-filter:blur(8px);">
                <p style="margin:0; font-size:13px; font-weight:600; color:white;">Fechas del viaje</p>
                <div [formGroup]="dateForm" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                  <input type="date" formControlName="start_date"
                    style="padding:7px 10px; border:1.5px solid rgba(255,255,255,0.3); border-radius:8px; font-size:13px; color:white; background:rgba(255,255,255,0.15); outline:none; font-family:'Outfit',sans-serif; cursor:pointer;"
                    placeholder="Inicio" />
                  <span style="color:rgba(255,255,255,0.6); font-size:13px;">→</span>
                  <input type="date" formControlName="end_date"
                    style="padding:7px 10px; border:1.5px solid rgba(255,255,255,0.3); border-radius:8px; font-size:13px; color:white; background:rgba(255,255,255,0.15); outline:none; font-family:'Outfit',sans-serif; cursor:pointer;"
                    placeholder="Fin" />
                  <button
                    type="button"
                    (click)="saveDates()"
                    [disabled]="savingMeta()"
                    style="padding:7px 16px; background:white; color:#f97316; border:none; border-radius:50px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:opacity 0.15s;"
                  >
                    {{ savingMeta() ? '...' : 'Guardar' }}
                  </button>
                </div>
                @if (metaError()) {
                  <p style="margin:0; font-size:12px; color:#fca5a5;">{{ metaError() }}</p>
                }
              </div>
            }

            <!-- Meta badges -->
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:4px;">
              @if (t.start_date || t.end_date) {
                <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); border-radius:50px; padding:5px 12px; color:white; font-size:13px; font-weight:500;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  @if (t.start_date) { {{ t.start_date | date:'mediumDate' }} }
                  @if (t.start_date && t.end_date) { → }
                  @if (t.end_date) { {{ t.end_date | date:'mediumDate' }} }
                </span>
              }
              <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); border-radius:50px; padding:5px 12px; color:white; font-size:13px; font-weight:500;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
                {{ store.days().length }} día{{ store.days().length !== 1 ? 's' : '' }}
              </span>
              <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); border-radius:50px; padding:5px 12px; color:white; font-size:13px; font-weight:500;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ totalActivities() }} actividad{{ totalActivities() !== 1 ? 'es' : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Two-column layout -->
        <div style="max-width:1200px; margin:0 auto; padding:32px 24px; display:grid; grid-template-columns:1fr 380px; gap:24px; align-items:start;">

          <!-- Left: Itinerary -->
          <div style="display:flex; flex-direction:column; gap:20px;">

            <!-- Section header -->
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:16px;">
              <div>
                <h2 style="font-size:22px; font-weight:700; color:#0f172a; margin:0 0 4px; letter-spacing:-0.3px;">Itinerario</h2>
                <p style="font-size:14px; color:#94a3b8; margin:0;">Organizá tus actividades día a día</p>
              </div>
              <button
                type="button"
                (click)="toggleAddDay()"
                style="padding:9px 18px; background:#f97316; color:white; border:none; border-radius:50px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; white-space:nowrap; flex-shrink:0; transition:background 0.15s;"
                onmouseenter="this.style.background='#ea580c'" onmouseleave="this.style.background='#f97316'"
              >
                @if (showAddDay()) { Cancelar } @else { + Añadir día }
              </button>
            </div>

            <!-- Add day form -->
            @if (showAddDay()) {
              <form
                [formGroup]="dayForm"
                (ngSubmit)="addDay()"
                style="background:white; border:1.5px solid #e2e8f0; border-radius:14px; padding:18px 20px; display:flex; flex-direction:column; gap:10px;"
              >
                <label style="font-size:13px; font-weight:500; color:#374151;">Fecha del día</label>
                <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                  <input
                    type="date"
                    formControlName="day_date"
                    class="trip-input"
                    style="padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white; cursor:pointer;"
                  />
                  <button
                    type="submit"
                    [disabled]="dayForm.invalid || addingDay()"
                    style="padding:9px 18px; color:white; border:none; border-radius:50px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s;"
                    [style.background]="dayForm.invalid || addingDay() ? '#fdba74' : '#f97316'"
                    onmouseenter="if(!this.disabled) this.style.background='#ea580c'" onmouseleave="if(!this.disabled) this.style.background='#f97316'"
                  >
                    {{ addingDay() ? 'Guardando...' : 'Añadir' }}
                  </button>
                  <button
                    type="button"
                    (click)="toggleAddDay()"
                    style="padding:9px 16px; background:transparent; border:1px solid #e2e8f0; border-radius:50px; color:#64748b; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;"
                  >
                    Cancelar
                  </button>
                </div>
                @if (dayErrorMessage()) {
                  <p style="font-size:12px; color:#ef4444; margin:0;">{{ dayErrorMessage() }}</p>
                }
              </form>
            }

            <!-- Days list -->
            @if (store.loading()) {
              <p style="font-size:14px; color:#94a3b8;">Cargando itinerario...</p>
            } @else if (store.days().length === 0) {
              <div style="background:white; border:1.5px solid #e2e8f0; border-radius:18px; padding:48px 24px; text-align:center;">
                <div class="float-soft" style="font-size:36px; margin-bottom:12px;">📅</div>
                <p style="color:#94a3b8; font-size:14px; margin:0; font-family:'Outfit',sans-serif;">
                  No hay días en el itinerario aún.<br/>Añadí el primer día para empezar.
                </p>
              </div>
            } @else {
              <div cdkDropListGroup style="display:flex; flex-direction:column; gap:16px;">
                @for (day of store.days(); track day.id; let i = $index) {
                  <app-day-card [day]="day" [dayNumber]="i + 1" [dayColor]="getDayColor(i)" />
                }
              </div>
            }

            @if (store.error(); as err) {
              <p style="font-size:13px; color:#ef4444;">{{ err }}</p>
            }
          </div>

          <!-- Right: Map + Members + Costs (sticky) -->
          <div style="display:flex; flex-direction:column; gap:20px; position:sticky; top:76px; align-self:start;">
            <app-trip-map />
            <app-members-panel [trip]="t" />
            <app-cost-summary
              [activities]="getAllActivities()"
              [tripMembers]="getTripmembers()"
              [currentUserId]="currentUserId()"
            />
          </div>
        </div>

      } @else {
        <div style="max-width:1200px; margin:0 auto; padding:32px 24px;">
          <p style="font-size:14px; color:#94a3b8;">Viaje no encontrado.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .trip-input:focus {
      border-color: #f97316 !important;
      box-shadow: 0 0 0 3px rgba(249,115,22,0.1) !important;
    }
    @media (max-width: 768px) {
      div[style*="grid-template-columns:1fr 380px"] {
        grid-template-columns: 1fr !important;
      }
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
      filter: invert(1);
      opacity: 0.7;
    }
  `],
})
export class TripDetailPage {
  readonly id = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  protected readonly store = inject(ItineraryStore);

  protected readonly dayColors = DAY_COLORS;
  protected readonly showAddDay = signal(false);
  protected readonly addingDay = signal(false);
  protected readonly dayErrorMessage = signal<string | null>(null);
  protected readonly editingDates = signal(false);
  protected readonly savingMeta = signal(false);
  protected readonly metaError = signal<string | null>(null);

  protected readonly isOwner = computed(
    () => !!this.auth.user() && this.store.trip()?.owner === this.auth.user()!.id,
  );

  protected readonly currentUserId = computed(() => this.auth.user()?.id ?? '');

  protected readonly totalActivities = computed(() => {
    const map = this.store.activitiesByDay();
    return [...map.values()].reduce((sum, acts) => sum + acts.length, 0);
  });

  protected readonly dayForm = this.fb.nonNullable.group({
    day_date: ['', [Validators.required]],
  });

  protected readonly dateForm = this.fb.nonNullable.group({
    start_date: [''],
    end_date: [''],
  });

  constructor() {
    queueMicrotask(() => this.store.load(this.id()));
  }

  protected heroBackground(t: Trip): string {
    if (t.cover_url) {
      return `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.65)), url('${t.cover_url}') center/cover no-repeat`;
    }
    return 'linear-gradient(135deg,#f97316 0%,#dc2626 100%)';
  }

  protected getDayColor(index: number): string {
    return this.dayColors[index % this.dayColors.length];
  }

  protected toggleAddDay() {
    this.showAddDay.update((v) => !v);
    this.dayErrorMessage.set(null);
    if (!this.showAddDay()) {
      this.dayForm.reset({ day_date: '' });
    }
  }

  protected async addDay() {
    if (this.dayForm.invalid || this.addingDay()) return;
    this.addingDay.set(true);
    this.dayErrorMessage.set(null);
    try {
      const { day_date } = this.dayForm.getRawValue();
      await this.store.addDay(day_date);
      this.dayForm.reset({ day_date: '' });
      this.showAddDay.set(false);
    } catch (err) {
      this.dayErrorMessage.set(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      this.addingDay.set(false);
    }
  }

  protected async saveDates() {
    if (this.savingMeta()) return;
    this.savingMeta.set(true);
    this.metaError.set(null);
    try {
      const { start_date, end_date } = this.dateForm.getRawValue();
      await this.store.updateTrip({
        start_date: start_date || null,
        end_date: end_date || null,
      });
      this.editingDates.set(false);
    } catch (err) {
      this.metaError.set(err instanceof Error ? err.message : 'Error guardando fechas');
    } finally {
      this.savingMeta.set(false);
    }
  }

  protected async onCoverChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.savingMeta.set(true);
    this.metaError.set(null);
    try {
      const url = await this.profileService.uploadTripCover(this.id(), file);
      await this.store.updateTrip({ cover_url: url });
    } catch (err) {
      this.metaError.set(err instanceof Error ? err.message : 'Error subiendo imagen');
    } finally {
      this.savingMeta.set(false);
      (event.target as HTMLInputElement).value = '';
    }
  }

  protected getAllActivities() {
    const map = this.store.activitiesByDay();
    return [...map.values()].flat();
  }

  protected getTripmembers() {
    return this.store.tripMembers?.() ?? [];
  }
}
