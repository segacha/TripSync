import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  PlaceSearchService,
  PlaceSuggestion,
} from '../core/services/place-search.service';

@Component({
  selector: 'app-place-search-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <input
        type="text"
        [value]="value()"
        [placeholder]="placeholder()"
        (input)="onInput($any($event.target).value)"
        (focus)="setOpen(true)"
        (blur)="onBlur()"
        class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      @if (open() && (suggestions().length > 0 || loading() || errorMessage())) {
        <ul
          class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg"
          (mousedown)="$event.preventDefault()"
        >
          @if (loading()) {
            <li class="px-3 py-2 text-xs text-slate-400">Buscando...</li>
          }
          @if (errorMessage()) {
            <li class="px-3 py-2 text-xs text-red-600">{{ errorMessage() }}</li>
          }
          @for (s of suggestions(); track s.displayName) {
            <li>
              <button
                type="button"
                (click)="pick(s)"
                class="block w-full truncate px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {{ s.displayName }}
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class PlaceSearchInputComponent {
  readonly initialValue = input<string>('');
  readonly placeholder = input<string>('Buscar lugar');

  readonly valueChange = output<string>();
  readonly placeSelected = output<PlaceSuggestion>();

  private readonly placeSearch = inject(PlaceSearchService);

  protected readonly value = signal<string>('');
  protected readonly suggestions = signal<PlaceSuggestion[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly open = signal(false);

  private pendingTimeout: ReturnType<typeof setTimeout> | null = null;
  private requestSeq = 0;
  private lastInitialValue: string | null = null;

  constructor() {
    queueMicrotask(() => {
      this.value.set(this.initialValue());
      this.lastInitialValue = this.initialValue();
    });
  }

  ngOnChanges() {
    const initial = this.initialValue();
    if (initial !== this.lastInitialValue) {
      this.value.set(initial);
      this.lastInitialValue = initial;
    }
  }

  protected onInput(value: string) {
    this.value.set(value);
    this.valueChange.emit(value);
    this.errorMessage.set(null);
    this.scheduleSearch(value);
  }

  protected setOpen(open: boolean) {
    this.open.set(open);
  }

  protected onBlur() {
    setTimeout(() => this.open.set(false), 120);
  }

  protected pick(suggestion: PlaceSuggestion) {
    this.value.set(suggestion.displayName);
    this.suggestions.set([]);
    this.open.set(false);
    this.valueChange.emit(suggestion.displayName);
    this.placeSelected.emit(suggestion);
  }

  reset(value = '') {
    this.value.set(value);
    this.suggestions.set([]);
    this.errorMessage.set(null);
    this.open.set(false);
  }

  private scheduleSearch(query: string) {
    if (this.pendingTimeout) clearTimeout(this.pendingTimeout);
    if (query.trim().length < 3) {
      this.suggestions.set([]);
      return;
    }
    this.pendingTimeout = setTimeout(() => this.runSearch(query), 350);
  }

  private async runSearch(query: string) {
    const seq = ++this.requestSeq;
    this.loading.set(true);
    try {
      const results = await this.placeSearch.search(query);
      if (seq !== this.requestSeq) return;
      this.suggestions.set(results);
      this.open.set(true);
    } catch (err) {
      if (seq !== this.requestSeq) return;
      this.errorMessage.set(err instanceof Error ? err.message : 'Error de búsqueda');
    } finally {
      if (seq === this.requestSeq) this.loading.set(false);
    }
  }
}
