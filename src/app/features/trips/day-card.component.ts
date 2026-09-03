import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18nService } from '../../core/i18n/i18n.service';
import { Activity, ItineraryDay, PriceDistributionType } from '../../core/models/trip.model';
import { PlaceSuggestion } from '../../core/services/place-search.service';
import { PlaceSearchInputComponent } from '../../shared/place-search-input.component';
import { ItineraryStore } from './itinerary.store';

interface ActivityEdit {
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  link: string;
  price: number | null;
  priceDistribution: PriceDistributionType | null;
  priceAssignedMembers: string[];
}
  
@Component({
  selector: 'app-day-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    PlaceSearchInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article style="background:white; border:1.5px solid #e2e8f0; border-radius:18px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.04);">

      <!-- Day header -->
      <header style="display:flex; align-items:center; gap:12px; padding:16px 20px; border-bottom:1px solid #f1f5f9;">
        <div [style.background]="dayColor()"
          style="width:38px; height:38px; border-radius:50%; color:white; font-size:16px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'Outfit',sans-serif;">
          {{ dayNumber() }}
        </div>
        <div style="flex:1; display:flex; flex-direction:column; gap:2px;">
          <span style="font-size:15px; font-weight:600; color:#0f172a; text-transform:capitalize;">
            {{ day().day_date | date: 'fullDate' : undefined : dateLocale() }}
          </span>
          <span style="font-size:13px; color:#94a3b8;">
            @if (activities().length === 0) {
              {{ t('day.noActivities') }}
            } @else {
              {{ tp('common.activities', activities().length) }}
            }
          </span>
        </div>
        <button
          type="button"
          (click)="confirmDeleteDay()"
          [attr.aria-label]="t('day.deleteDay')"
          style="padding:6px; border:1px solid transparent; border-radius:8px; background:transparent; color:#cbd5e1; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s;"
          onmouseenter="this.style.background='#fef2f2'; this.style.color='#ef4444'; this.style.borderColor='#fecaca';"
          onmouseleave="this.style.background='transparent'; this.style.color='#cbd5e1'; this.style.borderColor='transparent';"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </header>

      <!-- Activities list -->
      <div
        cdkDropList
        [id]="day().id"
        [cdkDropListData]="activities()"
        (cdkDropListDropped)="onDrop($event)"
        style="padding:8px 12px; display:flex; flex-direction:column; gap:2px; min-height:8px;"
      >
        @if (activities().length === 0) {
          <div style="text-align:center; padding:16px; color:#cbd5e1; font-size:14px; font-family:'Outfit',sans-serif;">
            {{ t('day.noActivitiesYet') }}
          </div>
        } @else {
          @for (activity of activities(); track activity.id) {
            <div cdkDrag
              style="display:flex; align-items:flex-start; gap:4px; border-radius:10px; transition:background 0.15s;"
            >
              @if (editingId() === activity.id) {
                <!-- Edit mode -->
                <div style="flex:1; background:#f8fafc; border:1.5px solid #f97316; border-radius:12px; padding:14px; margin:4px 0; display:flex; flex-direction:column; gap:10px;">
                  <input
                    type="text"
                    [value]="editDraft().title"
                    (input)="updateDraft('title', $any($event.target).value)"
                    [placeholder]="t('day.activityTitle')"
                    class="trip-input"
                    style="padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:15px; font-weight:600; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
                    autofocus
                  />
                  <app-place-search-input
                    [initialValue]="editDraft().location"
                    [placeholder]="t('day.location')"
                    (valueChange)="onEditLocationText($event)"
                    (placeSelected)="onEditPlaceSelected($event)"
                  />
                  <textarea
                    rows="2"
                    [value]="editDraft().description"
                    (input)="updateDraft('description', $any($event.target).value)"
                    [placeholder]="t('day.descriptionShort')"
                    class="trip-input"
                    style="padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white; width:100%; box-sizing:border-box; resize:none;"
                  ></textarea>
                  <input
                    type="url"
                    [value]="editDraft().link"
                    (input)="updateDraft('link', $any($event.target).value)"
                    [placeholder]="t('day.link')"
                    class="trip-input"
                    style="padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
                  />
                  <!-- Price section -->
                  <div style="border-top:1px solid #e2e8f0; padding-top:10px; display:flex; flex-direction:column; gap:8px;">
                    <input
                      type="number"
                      [value]="editDraft().price ?? ''"
                      (input)="updateDraftPrice($any($event.target).value)"
                      [placeholder]="t('day.price')"
                      class="trip-input"
                      step="0.01"
                      min="0"
                      style="padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
                    />
                    @let editPrice = editDraft().price;
                    @if (editPrice !== null && editPrice > 0) {
                      <select
                        [value]="editDraft().priceDistribution ?? ''"
                        (change)="updateDraftDistribution($any($event.target).value)"
                        style="padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
                      >
                        <option value="">{{ t('day.distribution.placeholder') }}</option>
                        <option value="equal">{{ t('day.distribution.equal') }}</option>
                        <option value="assigned">{{ t('day.distribution.assigned') }}</option>
                        <option value="per_person">{{ t('day.distribution.perPerson') }}</option>
                      </select>
                    }
                  </div>
                  <div style="display:flex; gap:8px;">
                    <button
                      type="button"
                      (click)="saveEdit(activity)"
                      [disabled]="!editDraft().title.trim() || saving()"
                      style="padding:8px 16px; background:#f97316; color:white; border:none; border-radius:50px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:background 0.15s;"
                      onmouseenter="this.style.background='#ea580c'" onmouseleave="this.style.background='#f97316'"
                    >{{ t('common.save') }}</button>
                    <button
                      type="button"
                      (click)="cancelEdit()"
                      style="padding:8px 16px; background:transparent; color:#64748b; border:1px solid #e2e8f0; border-radius:50px; font-size:14px; cursor:pointer; font-family:'Outfit',sans-serif;"
                    >{{ t('common.cancel') }}</button>
                  </div>
                </div>
              } @else {
                <!-- Drag handle -->
                <span cdkDragHandle
                  style="color:#cbd5e1; font-size:15px; padding:12px 2px 12px 4px; cursor:grab; user-select:none; flex-shrink:0; font-family:monospace; letter-spacing:-2px;">
                  ⠿
                </span>
                <!-- Activity row -->
                <div class="activity-row"
                  style="flex:1; display:flex; align-items:flex-start; gap:10px; padding:10px 8px 10px 0; border-radius:10px; transition:background 0.15s; min-width:0;"
                  onmouseenter="this.style.background='#f8fafc'; this.querySelector('.activity-actions').style.display='flex';"
                  onmouseleave="this.style.background=''; this.querySelector('.activity-actions').style.display='none';"
                >
                  <!-- Completion toggle -->
                  <button
                    type="button"
                    (click)="toggleCompleted(activity); $event.stopPropagation()"
                    [style.border-color]="activity.completed ? '#22c55e' : dayColor()"
                    [style.background]="activity.completed ? '#22c55e' : 'white'"
                    style="width:20px; height:20px; border-radius:50%; border-width:2px; border-style:solid; flex-shrink:0; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; margin-top:2px; padding:0;"
                  >
                    @if (activity.completed) {
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    }
                  </button>
                  <!-- Content -->
                  <div style="flex:1; display:flex; flex-direction:column; gap:3px; min-width:0;" [style.opacity]="activity.completed ? '0.55' : '1'">
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                      <span style="font-size:15px; font-weight:600; color:#0f172a; font-family:'Outfit',sans-serif;"
                        [style.text-decoration]="activity.completed ? 'line-through' : 'none'">
                        {{ activity.title }}
                      </span>
                      @if (activity.price && activity.price > 0) {
                        <span style="font-size:12px; padding:2px 8px; background:#fef3c7; color:#92400e; border-radius:4px; font-weight:500; font-family:'Outfit',sans-serif;">
                          €{{ activity.price.toFixed(2) }}
                        </span>
                      }
                      @if (activity.link) {
                        <a [href]="activity.link" target="_blank" rel="noopener noreferrer"
                          (click)="$event.stopPropagation()"
                          [title]="t('day.openLink')"
                          style="color:#3b82f6; display:flex; align-items:center; flex-shrink:0; text-decoration:none;">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </a>
                      }
                    </div>
                    @if (activity.location) {
                      <div style="display:flex; align-items:center; gap:4px; font-size:13px; color:#94a3b8; font-family:'Outfit',sans-serif;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{{ activity.location }}</span>
                        @if (mapsLink(activity)) {
                          <a [href]="mapsLink(activity)" target="_blank" rel="noopener noreferrer"
                            (click)="$event.stopPropagation()"
                            [title]="t('day.viewOnMaps')"
                            style="color:#3b82f6; display:flex; align-items:center; margin-left:2px; text-decoration:none;">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                          </a>
                        }
                      </div>
                    }
                    @if (activity.description) {
                      <span style="font-size:13px; color:#64748b; font-family:'Outfit',sans-serif;">
                        {{ activity.description }}
                      </span>
                    }
                  </div>
                  <!-- Action buttons (shown on hover) -->
                  <div class="activity-actions" style="display:none; gap:4px; flex-shrink:0;">
                    <button
                      type="button"
                      (click)="startEdit(activity)"
                      style="padding:6px; background:#eff6ff; border:none; border-radius:6px; color:#3b82f6; cursor:pointer; display:flex; align-items:center; justify-content:center;"
                      [title]="t('common.edit')"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="deleteActivity(activity)"
                      style="padding:6px; background:#fef2f2; border:none; border-radius:6px; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center;"
                      [title]="t('common.delete')"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>

      <!-- New activity form -->
      <form [formGroup]="addForm" (ngSubmit)="addActivity()"
        style="padding:12px 16px 16px; border-top:1px solid #f1f5f9; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; gap:8px;">
          <input
            type="text"
            formControlName="title"
            [placeholder]="t('day.newActivity')"
            class="trip-input"
            style="flex:1; padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
          />
          <button
            type="submit"
            [disabled]="addForm.invalid || saving()"
            style="padding:9px 18px; color:white; border:none; border-radius:50px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; white-space:nowrap; transition:background 0.15s;"
            [style.background]="addForm.invalid || saving() ? 'rgba(249,115,22,0.4)' : '#f97316'"
            [style.cursor]="addForm.invalid || saving() ? 'not-allowed' : 'pointer'"
            onmouseenter="if(!this.disabled) this.style.background='#ea580c'" onmouseleave="if(!this.disabled) this.style.background='#f97316'"
          >
            {{ saving() ? '...' : t('common.add') }}
          </button>
        </div>

        @if (!showExtraFields()) {
          <button
            type="button"
            (click)="toggleExtraFields()"
            style="background:none; border:none; color:#f97316; font-size:13px; cursor:pointer; font-weight:500; padding:0; font-family:'Outfit',sans-serif; text-align:left;"
          >
            {{ t('day.moreDetails') }}
          </button>
        }

        @if (showExtraFields()) {
          <app-place-search-input
            [initialValue]="addLocation()"
            [placeholder]="t('day.location')"
            (valueChange)="onAddLocationText($event)"
            (placeSelected)="onAddPlaceSelected($event)"
          />
          <textarea
            formControlName="description"
            rows="2"
            [placeholder]="t('day.description')"
            class="trip-input"
            style="padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white; resize:none;"
          ></textarea>
          <input
            type="url"
            [value]="addLink()"
            (input)="addLink.set($any($event.target).value)"
            [placeholder]="t('day.link')"
            class="trip-input"
            style="padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
          />
          <!-- Price section -->
          <div style="border-top:1px solid #e2e8f0; padding-top:8px; display:flex; flex-direction:column; gap:8px;">
            <input
              type="number"
              [value]="addPrice() ?? ''"
              (input)="addPrice.set(parsePrice($any($event.target).value))"
              [placeholder]="t('day.price')"
              class="trip-input"
              step="0.01"
              min="0"
              style="padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
            />
            @if (addPrice() && addPrice()! > 0) {
              <select
                [value]="addPriceDistribution() ?? ''"
                (change)="updateDraftDistribution($any($event.target).value)"
                style="padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white;"
              >
                <option value="">{{ t('day.distribution.placeholder') }}</option>
                <option value="equal">{{ t('day.distribution.equal') }}</option>
                <option value="assigned">{{ t('day.distribution.assigned') }}</option>
                <option value="per_person">{{ t('day.distribution.perPerson') }}</option>
              </select>
            }
          </div>
          <button
            type="button"
            (click)="toggleExtraFields()"
            style="background:none; border:none; color:#f97316; font-size:13px; cursor:pointer; font-weight:500; padding:0; font-family:'Outfit',sans-serif; text-align:left;"
          >
            {{ t('day.lessDetails') }}
          </button>
        }
      </form>

      @if (errorMessage()) {
        <p style="border-top:1px solid #f1f5f9; background:#fef2f2; padding:8px 16px; font-size:13px; color:#ef4444; margin:0;">
          {{ errorMessage() }}
        </p>
      }
    </article>
  `,
  styles: [`
    .trip-input:focus {
      border-color: #f97316 !important;
      box-shadow: 0 0 0 2px rgba(249,115,22,0.1) !important;
    }
  `],
})
export class DayCardComponent {
  readonly day = input.required<ItineraryDay>();
  readonly dayNumber = input<number>(1);
  readonly dayColor = input<string>('#f97316');
  readonly dayDeleted = output<string>();

  private readonly store = inject(ItineraryStore);
  private readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);

  protected readonly t = this.i18n.t;
  protected readonly tp = this.i18n.tp;
  protected readonly dateLocale = this.i18n.dateLocale;

  protected readonly activities = computed(
    () => this.store.activitiesByDay().get(this.day().id) ?? [],
  );

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly editDraft = signal<ActivityEdit>({
    title: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    link: '',
    price: null,
    priceDistribution: null,
    priceAssignedMembers: [],
  });
  protected readonly showExtraFields = signal(false);

  protected readonly addLocation = signal('');
  protected readonly addLatitude = signal<number | null>(null);
  protected readonly addLongitude = signal<number | null>(null);
  protected readonly addLink = signal('');
  protected readonly addPrice = signal<number | null>(null);
  protected readonly addPriceDistribution = signal<PriceDistributionType | null>(null);
  protected readonly addPriceAssignedMembers = signal<string[]>([]);

  protected readonly tripMembers = computed(() => {
    const trip = this.store.trip();
    // This will be populated by the store
    return trip ? [] : [];
  });

  protected readonly addForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
  });

  protected toggleExtraFields() {
    this.showExtraFields.update((v) => !v);
  }

  protected mapsLink(activity: Activity): string {
    if (activity.latitude !== null && activity.longitude !== null) {
      return `https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`;
    }
    if (activity.location) {
      return `https://www.google.com/maps/search/${encodeURIComponent(activity.location)}`;
    }
    return '';
  }

  protected async onDrop(event: CdkDragDrop<Activity[]>) {
    const fromDayId = event.previousContainer.id;
    const toDayId = event.container.id;
    if (fromDayId === toDayId && event.previousIndex === event.currentIndex) return;

    this.errorMessage.set(null);
    try {
      await this.store.transferBetweenDays(
        fromDayId,
        toDayId,
        event.previousIndex,
        event.currentIndex,
      );
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : this.t('common.unknownError'));
    }
  }

  protected onAddLocationText(value: string) {
    this.addLocation.set(value);
    if (this.addLatitude() !== null) {
      this.addLatitude.set(null);
      this.addLongitude.set(null);
    }
  }

  protected onAddPlaceSelected(suggestion: PlaceSuggestion) {
    this.addLocation.set(suggestion.displayName);
    this.addLatitude.set(suggestion.latitude);
    this.addLongitude.set(suggestion.longitude);
  }

  protected onEditLocationText(value: string) {
    this.editDraft.update((d) => ({ ...d, location: value, latitude: null, longitude: null }));
  }

  protected onEditPlaceSelected(suggestion: PlaceSuggestion) {
    this.editDraft.update((d) => ({
      ...d,
      location: suggestion.displayName,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    }));
  }

  protected async addActivity() {
    if (this.addForm.invalid || this.saving()) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    try {
      const { title, description } = this.addForm.getRawValue();
      const locationText = this.addLocation().trim();
      await this.store.addActivity(this.day().id, {
        title: title.trim(),
        description: description.trim() || null,
        location: locationText || null,
        latitude: locationText ? this.addLatitude() : null,
        longitude: locationText ? this.addLongitude() : null,
        link: this.addLink().trim() || null,
        price: this.addPrice(),
        priceDistribution: this.addPriceDistribution(),
        priceAssignedMembers: this.addPriceAssignedMembers(),
      });
      this.addForm.reset({ title: '', description: '' });
      this.addLocation.set('');
      this.addLatitude.set(null);
      this.addLongitude.set(null);
      this.addLink.set('');
      this.addPrice.set(null);
      this.addPriceDistribution.set(null);
      this.addPriceAssignedMembers.set([]);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : this.t('common.unknownError'));
    } finally {
      this.saving.set(false);
    }
  }

  protected startEdit(activity: Activity) {
    this.editingId.set(activity.id);
    this.editDraft.set({
      title: activity.title,
      description: activity.description ?? '',
      location: activity.location ?? '',
      latitude: activity.latitude,
      longitude: activity.longitude,
      link: activity.link ?? '',
      price: activity.price,
      priceDistribution: activity.priceDistribution,
      priceAssignedMembers: activity.priceAssignedMembers ?? [],
    });
  }

  protected cancelEdit() {
    this.editingId.set(null);
  }

  protected updateDraft(field: 'title' | 'description' | 'link', value: string) {
    this.editDraft.update((d) => ({ ...d, [field]: value }));
  }

  protected updateDraftPrice(value: string) {
    const price = value ? parseFloat(value) : null;
    this.editDraft.update((d) => ({ ...d, price: price && price > 0 ? price : null }));
  }

  protected updateDraftDistribution(value: string) {
    this.editDraft.update((d) => ({ ...d, priceDistribution: value as PriceDistributionType }));
  }

  protected parsePrice(value: string): number | null {
    if (!value) return null;
    const parsed = parseFloat(value);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }

  protected async saveEdit(activity: Activity) {
    if (this.saving()) return;
    const draft = this.editDraft();
    if (!draft.title.trim()) return;
    this.saving.set(true);
    this.errorMessage.set(null);
    try {
      const locationText = draft.location.trim();
      await this.store.updateActivity(activity.id, this.day().id, {
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        location: locationText || null,
        latitude: locationText ? draft.latitude : null,
        longitude: locationText ? draft.longitude : null,
        link: draft.link.trim() || null,
        price: draft.price,
        priceDistribution: draft.priceDistribution,
        priceAssignedMembers: draft.priceAssignedMembers,
      });
      this.editingId.set(null);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : this.t('common.unknownError'));
    } finally {
      this.saving.set(false);
    }
  }

  protected async toggleCompleted(activity: Activity) {
    this.errorMessage.set(null);
    try {
      await this.store.toggleCompleted(activity);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : this.t('common.unknownError'));
    }
  }

  protected async deleteActivity(activity: Activity) {
    if (!confirm(this.t('day.deleteActivityConfirm', { title: activity.title }))) return;
    this.errorMessage.set(null);
    try {
      await this.store.removeActivity(activity.id, this.day().id);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : this.t('common.unknownError'));
    }
  }

  protected async confirmDeleteDay() {
    if (!confirm(this.t('day.deleteDayConfirm'))) return;
    try {
      await this.store.removeDay(this.day().id);
      this.dayDeleted.emit(this.day().id);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : this.t('common.unknownError'));
    }
  }
}
