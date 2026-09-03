import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService, Lang } from '../core/i18n/i18n.service';

/**
 * Interruptor ES / EN. Dos variantes:
 *  - `light` (por defecto): para fondos claros (navbar, shell).
 *  - `dark`: para fondos oscuros o con degradado (paneles de marca, hero).
 */
@Component({
  selector: 'app-language-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="lang-switch"
      [class.on-dark]="variant() === 'dark'"
      role="group"
      [attr.aria-label]="t('lang.label')"
    >
      @for (option of options; track option.code) {
        <button
          type="button"
          class="lang-option"
          [class.active]="i18n.lang() === option.code"
          [attr.aria-pressed]="i18n.lang() === option.code"
          [attr.title]="t(option.titleKey)"
          (click)="i18n.setLang(option.code)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .lang-switch {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px;
        border: 1px solid #e2e8f0;
        border-radius: 50px;
        background: #f8fafc;
      }

      .lang-option {
        padding: 4px 10px;
        border: none;
        border-radius: 50px;
        background: transparent;
        color: #94a3b8;
        font-family: 'Outfit', sans-serif;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.3px;
        line-height: 1.4;
        cursor: pointer;
      }

      .lang-option:hover {
        color: #0f172a;
      }

      .lang-option.active {
        background: #fff;
        color: #ea580c;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
      }

      .lang-option.active:hover {
        color: #ea580c;
      }

      /* Variante para fondos oscuros */
      .on-dark {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.15);
      }

      .on-dark .lang-option {
        color: rgba(255, 255, 255, 0.75);
      }

      .on-dark .lang-option:hover {
        color: #fff;
      }

      .on-dark .lang-option.active {
        background: #fff;
        color: #ea580c;
      }
    `,
  ],
})
export class LanguageSwitchComponent {
  readonly variant = input<'light' | 'dark'>('light');

  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t;

  protected readonly options = [
    { code: 'es' as Lang, label: 'ES', titleKey: 'lang.switchTo.es' as const },
    { code: 'en' as Lang, label: 'EN', titleKey: 'lang.switchTo.en' as const },
  ];
}
