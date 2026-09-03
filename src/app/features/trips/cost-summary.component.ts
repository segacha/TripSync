import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { CostCalculatorService, MemberCost } from '../../core/services/cost-calculator.service';
import { Activity, TripMember } from '../../core/models/trip.model';

@Component({
  selector: 'app-cost-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article style="background:white; border:1.5px solid #e2e8f0; border-radius:18px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
      <!-- Header -->
      <header style="display:flex; align-items:center; gap:12px; padding:16px 20px; border-bottom:1px solid #f1f5f9;">
        <div style="width:38px; height:38px; border-radius:50%; background:#ec4899; color:white; font-size:16px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-family:'Outfit',sans-serif;">
          €
        </div>
        <div style="flex:1; display:flex; flex-direction:column; gap:2px;">
          <span style="font-size:15px; font-weight:600; color:#0f172a; text-transform:capitalize;">
            {{ t('cost.title') }}
          </span>
          <span style="font-size:13px; color:#94a3b8;">
            @if (memberCosts().length === 0) {
              {{ t('cost.none') }}
            } @else if (currentMemberCost() !== null) {
              {{ t('cost.yourTotal', { amount: currentMemberCost()!.toFixed(2) }) }}
            } @else {
              {{ t('cost.noneForYou') }}
            }
          </span>
        </div>
      </header>

      <!-- Content -->
      <div style="padding:16px 20px; display:flex; flex-direction:column; gap:12px;">
        @if (memberCosts().length === 0) {
          <div style="text-align:center; padding:20px; color:#cbd5e1; font-size:14px; font-family:'Outfit',sans-serif;">
            {{ t('cost.emptyState') }}
          </div>
        } @else {
          @for (member of memberCosts(); track member.userId) {
            <div style="padding:12px; background:#f8fafc; border-radius:12px; display:flex; flex-direction:column; gap:8px;">
              <!-- Member header -->
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <div style="width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg, #f97316, #ec4899); color:white; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; font-family:'Outfit',sans-serif;">
                    {{ member.email.charAt(0).toUpperCase() }}
                  </div>
                  <div style="display:flex; flex-direction:column; gap:1px;">
                    <span style="font-size:14px; font-weight:600; color:#0f172a; font-family:'Outfit',sans-serif;">
                      {{ member.email }}
                    </span>
                    <span style="font-size:12px; color:#94a3b8; font-family:'Outfit',sans-serif;">
                      {{ tp('common.activities', member.breakdown.length) }}
                    </span>
                  </div>
                </div>
                <div style="text-align:right; display:flex; flex-direction:column; gap:2px;">
                  <span style="font-size:16px; font-weight:700; color:#ec4899; font-family:'Outfit',sans-serif;">
                    €{{ member.totalCost.toFixed(2) }}
                  </span>
                </div>
              </div>

              <!-- Activity breakdown (collapsible) -->
              @if (member.breakdown.length > 0) {
                <details style="display:flex; flex-direction:column; gap:6px;">
                  <summary style="cursor:pointer; color:#64748b; font-size:12px; font-weight:500; font-family:'Outfit',sans-serif; list-style:none; padding:0; margin:0;">
                    <span style="display:inline-block;">▶ {{ t('cost.breakdown') }}</span>
                  </summary>
                  <div style="padding:8px; background:white; border-radius:8px; border:1px solid #e2e8f0; display:flex; flex-direction:column; gap:6px;">
                    @for (activity of member.breakdown; track activity.activityId) {
                      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; font-size:13px;">
                        <div style="flex:1; display:flex; flex-direction:column; gap:1px; min-width:0;">
                          <span style="color:#0f172a; font-weight:500; font-family:'Outfit',sans-serif; word-break:break-word;">
                            {{ activity.activityTitle }}
                          </span>
                          <span style="color:#94a3b8; font-size:12px; font-family:'Outfit',sans-serif;">
                            @if (activity.totalPrice === activity.costPerPerson) {
                              {{ t('cost.fullPrice') }}
                            } @else {
                              {{ t('cost.dividedBy', { amount: activity.totalPrice.toFixed(2) }) }}
                            }
                          </span>
                        </div>
                        <span style="color:#ec4899; font-weight:600; flex-shrink:0; font-family:'Outfit',sans-serif;">
                          €{{ activity.costPerPerson.toFixed(2) }}
                        </span>
                      </div>
                    }
                  </div>
                </details>
              }
            </div>
          }

          <!-- Summary stats -->
                <div style="border-top:1px solid #e2e8f0; padding-top:12px; display:grid; grid-template-columns:1fr; gap:12px;">
            <div style="background:linear-gradient(135deg, #f97316, #fb923c); border-radius:12px; padding:12px; color:white;">
              <div style="font-size:12px; opacity:0.9; font-weight:500; font-family:'Outfit',sans-serif;">{{ t('cost.totalForMe') }}</div>
              <div style="font-size:18px; font-weight:700; margin-top:4px; font-family:'Outfit',sans-serif;">
                @if (currentMemberCost() !== null) {
                  €{{ currentMemberCost()!.toFixed(2) }}
                } @else {
                  {{ t('cost.noCostAssigned') }}
                }
              </div>
            </div>
          </div>
        }
      </div>
    </article>
  `,
})
export class CostSummaryComponent {
  readonly activities = input<Activity[]>([]);
  readonly tripMembers = input<TripMember[]>([]);
  readonly currentUserId = input<string>('');

  private readonly costCalculator = inject(CostCalculatorService);
  private readonly i18n = inject(I18nService);

  protected readonly t = this.i18n.t;
  protected readonly tp = this.i18n.tp;

  protected readonly memberCosts = computed(() => {
    return this.costCalculator.calculateCostsByMember(
      this.activities(),
      this.tripMembers(),
      this.currentUserId(),
    );
  });

  protected readonly currentMemberCost = computed(() => {
    const member = this.memberCosts().find((m) => m.userId === this.currentUserId());
    return member ? member.totalCost : null;
  });
}
