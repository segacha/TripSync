import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RtPayload<T> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: Partial<T>;
};
import {
  Trip,
  TripInvitation,
  TripMember,
  TripMemberRole,
  UserProfile,
} from '../../core/models/trip.model';
import { AuthService } from '../../core/services/auth.service';
import { MembersService } from '../../core/services/members.service';
import { ProfileService } from '../../core/services/profile.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-members-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="background:white; border:1.5px solid #e2e8f0; border-radius:18px; padding:20px; font-family:'Outfit',sans-serif;">

      <!-- Title -->
      <h3 style="font-size:16px; font-weight:700; color:#0f172a; margin:0 0 16px; display:flex; align-items:center; gap:8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        Miembros
      </h3>

      @if (loading()) {
        <p style="font-size:14px; color:#94a3b8;">Cargando...</p>
      } @else {

        <!-- Member list -->
        <div style="display:flex; flex-direction:column; gap:0; margin-bottom:4px;">
          @for (member of members(); track member.user_id) {
            <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #f1f5f9;">
              <!-- Avatar -->
              @if (profiles().get(member.user_id)?.avatar_url; as url) {
                <img [src]="url" alt="" style="width:34px; height:34px; border-radius:50%; object-fit:cover; flex-shrink:0; border:1.5px solid #e2e8f0;">
              } @else {
                <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#f97316,#ea580c); color:white; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:600; flex-shrink:0;">
                  {{ initialFor(member.email) }}
                </div>
              }
              <!-- Info -->
              <div style="flex:1; display:flex; align-items:center; gap:6px; min-width:0; overflow:hidden;">
                <span style="font-size:13px; color:#374151; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  {{ member.email }}
                </span>
                @if (member.user_id === currentUserId()) {
                  <span style="font-size:11px; color:#f97316; font-weight:600; background:#fff7ed; padding:1px 6px; border-radius:50px; flex-shrink:0;">(tú)</span>
                }
              </div>
              <!-- Role / controls -->
              @if (canManage() && member.user_id !== trip().owner) {
                <select
                  [value]="member.role"
                  (change)="changeRole(member, $any($event.target).value)"
                  style="font-size:12px; border:1px solid #e2e8f0; border-radius:6px; padding:3px 6px; color:#374151; background:white; cursor:pointer; font-family:'Outfit',sans-serif;"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  type="button"
                  (click)="removeMember(member)"
                  style="background:none; border:none; cursor:pointer; color:#cbd5e1; font-size:18px; line-height:1; padding:2px 4px; border-radius:4px; transition:color 0.15s;"
                  onmouseenter="this.style.color='#ef4444'" onmouseleave="this.style.color='#cbd5e1'"
                  aria-label="Quitar miembro"
                >×</button>
              } @else {
                <span [style.background]="roleBg(member.role)" [style.color]="roleColor(member.role)"
                  style="font-size:11px; font-weight:600; padding:3px 8px; border-radius:50px; flex-shrink:0;">
                  {{ roleLabel(member.role) }}
                </span>
              }
            </div>
          }
        </div>

        <!-- Pending invitations -->
        @if (canManage() && pending().length > 0) {
          <div style="margin-top:16px; padding-top:16px; border-top:1px solid #f1f5f9;">
            <p style="font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em; margin:0 0 10px;">
              Invitaciones pendientes
            </p>
            <div style="display:flex; flex-direction:column; gap:8px;">
              @for (inv of pending(); track inv.id) {
                <div style="display:flex; align-items:center; gap:10px; padding:6px 0;">
                  <div style="width:30px; height:30px; border-radius:50%; background:#e2e8f0; color:#94a3b8; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; flex-shrink:0;">
                    {{ initialFor(inv.email) }}
                  </div>
                  <div style="flex:1; display:flex; align-items:center; gap:6px; min-width:0; overflow:hidden;">
                    <span style="font-size:13px; color:#374151; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ inv.email }}</span>
                    <span style="font-size:11px; color:#d97706; font-weight:500; background:#fef9c3; padding:1px 6px; border-radius:50px; flex-shrink:0;">Pendiente</span>
                  </div>
                  <button
                    type="button"
                    (click)="cancelInvitation(inv)"
                    style="font-size:12px; color:#ef4444; background:none; border:1px solid #fecaca; border-radius:6px; padding:3px 8px; cursor:pointer; font-family:'Outfit',sans-serif; flex-shrink:0;"
                  >Cancelar</button>
                </div>
              }
            </div>
          </div>
        }

        <!-- Invite form -->
        @if (canManage()) {
          <div style="margin-top:16px; padding-top:16px; border-top:1px solid #f1f5f9;">
            <p style="font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em; margin:0 0 10px;">
              Invitar alguien
            </p>

            @if (notice()) {
              <div style="display:flex; align-items:center; gap:6px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:8px 12px; color:#16a34a; font-size:13px; margin-bottom:10px;">
                <span>✓</span> {{ notice() }}
              </div>
            }
            @if (errorMessage()) {
              <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:8px 12px; color:#ef4444; font-size:13px; margin-bottom:10px;">
                {{ errorMessage() }}
              </div>
            }

            <form [formGroup]="inviteForm" (ngSubmit)="submitInvite()" style="display:flex; flex-direction:column; gap:10px;">
              <input
                type="email"
                formControlName="email"
                placeholder="email@ejemplo.com"
                class="members-input"
                style="width:100%; padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; outline:none; font-family:'Outfit',sans-serif; color:#0f172a; background:white; box-sizing:border-box;"
              />
              <div style="display:flex; gap:8px;">
                <select
                  formControlName="role"
                  style="flex:1; font-size:13px; border:1.5px solid #e2e8f0; border-radius:10px; padding:8px 10px; color:#374151; background:white; cursor:pointer; font-family:'Outfit',sans-serif;"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  type="submit"
                  [disabled]="inviteForm.invalid || inviting()"
                  style="padding:9px 18px; color:white; border:none; border-radius:50px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; white-space:nowrap; transition:background 0.15s;"
                  [style.background]="inviteForm.invalid || inviting() ? '#fdba74' : '#f97316'"
                  onmouseenter="if(!this.disabled) this.style.background='#ea580c'" onmouseleave="if(!this.disabled) this.style.background='#f97316'"
                >
                  {{ inviting() ? 'Invitando...' : 'Invitar' }}
                </button>
              </div>
            </form>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .members-input:focus {
      border-color: #f97316 !important;
      box-shadow: 0 0 0 2px rgba(249,115,22,0.1) !important;
    }
  `],
})
export class MembersPanelComponent {
  readonly trip = input.required<Trip>();

  private readonly membersService = inject(MembersService);
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(FormBuilder);
  private readonly supabase = inject(SupabaseService).client;
  private readonly destroyRef = inject(DestroyRef);
  private channel: RealtimeChannel | null = null;

  protected readonly members = signal<TripMember[]>([]);
  protected readonly pending = signal<TripInvitation[]>([]);
  protected readonly profiles = signal<Map<string, UserProfile>>(new Map());
  protected readonly loading = signal(true);
  protected readonly inviting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  protected readonly canManage = computed(() => this.currentUserId() === this.trip().owner);

  protected initialFor(email: string): string {
    return email.trim().charAt(0).toUpperCase() || '?';
  }

  protected roleLabel(role: string): string {
    return role === 'owner' ? 'Dueño' : role === 'editor' ? 'Editor' : 'Viewer';
  }

  protected roleBg(role: string): string {
    return role === 'owner' ? '#fff7ed' : role === 'editor' ? '#eff6ff' : '#f8fafc';
  }

  protected roleColor(role: string): string {
    return role === 'owner' ? '#ea580c' : role === 'editor' ? '#2563eb' : '#64748b';
  }

  protected readonly inviteForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['viewer' as TripMemberRole, [Validators.required]],
  });

  constructor() {
    effect(() => {
      const tripId = this.trip().id;
      this.refresh();
      this.subscribe(tripId);
    });
    this.destroyRef.onDestroy(() => this.unsubscribe());
  }

  private subscribe(tripId: string) {
    this.unsubscribe();
    this.channel = this.supabase
      .channel(`trip:${tripId}:members`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trip_members', filter: `trip_id=eq.${tripId}` },
        (payload) => this.onMemberEvent(payload as unknown as RtPayload<TripMember>),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_invitations',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => this.onInvitationEvent(payload as unknown as RtPayload<TripInvitation>),
      )
      .subscribe();
  }

  private unsubscribe() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private onMemberEvent(payload: RtPayload<TripMember>) {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const incoming = payload.new as TripMember;
      this.members.update((list) => {
        const filtered = list.filter((m) => m.user_id !== incoming.user_id);
        return [...filtered, incoming].sort((a, b) =>
          a.created_at.localeCompare(b.created_at),
        );
      });
    } else if (payload.eventType === 'DELETE') {
      const old = payload.old as Partial<TripMember>;
      if (old.user_id) {
        this.members.update((list) => list.filter((m) => m.user_id !== old.user_id));
      }
    }
  }

  private onInvitationEvent(payload: RtPayload<TripInvitation>) {
    if (!this.canManage()) return;
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const inv = payload.new as TripInvitation;
      this.pending.update((list) => {
        const filtered = list.filter((i) => i.id !== inv.id);
        return [...filtered, inv].sort((a, b) => a.created_at.localeCompare(b.created_at));
      });
    } else if (payload.eventType === 'DELETE') {
      const old = payload.old as Partial<TripInvitation>;
      if (old.id) {
        this.pending.update((list) => list.filter((i) => i.id !== old.id));
      }
    }
  }

  protected async submitInvite() {
    if (this.inviteForm.invalid || this.inviting()) return;
    this.inviting.set(true);
    this.errorMessage.set(null);
    this.notice.set(null);
    try {
      const { email, role } = this.inviteForm.getRawValue();
      const result = await this.membersService.invite(this.trip().id, email, role);
      if (result.status === 'added') {
        this.notice.set(`${result.email} ya tenía cuenta — añadido como ${result.role}.`);
      } else {
        this.notice.set(`Invitación pendiente enviada a ${result.email}.`);
      }
      this.inviteForm.reset({ email: '', role: 'viewer' });
      await this.refresh();
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      this.inviting.set(false);
    }
  }

  protected async changeRole(member: TripMember, newRole: TripMemberRole) {
    if (member.role === newRole) return;
    this.errorMessage.set(null);
    try {
      const updated = await this.membersService.updateRole(
        member.trip_id,
        member.user_id,
        newRole,
      );
      this.members.update((list) =>
        list.map((m) => (m.user_id === member.user_id ? updated : m)),
      );
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  protected async removeMember(member: TripMember) {
    if (!confirm(`¿Quitar a ${member.email} del viaje?`)) return;
    this.errorMessage.set(null);
    try {
      await this.membersService.removeMember(member.trip_id, member.user_id);
      this.members.update((list) => list.filter((m) => m.user_id !== member.user_id));
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  protected async cancelInvitation(inv: TripInvitation) {
    if (!confirm(`¿Cancelar invitación a ${inv.email}?`)) return;
    this.errorMessage.set(null);
    try {
      await this.membersService.cancelInvitation(inv.id);
      this.pending.update((list) => list.filter((i) => i.id !== inv.id));
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  private async refresh() {
    this.loading.set(true);
    try {
      const tripId = this.trip().id;
      const [members, pending] = await Promise.all([
        this.membersService.listMembers(tripId),
        this.canManage()
          ? this.membersService.listPendingInvitations(tripId)
          : Promise.resolve([] as TripInvitation[]),
      ]);
      this.members.set(members);
      this.pending.set(pending);

      if (members.length > 0) {
        const profileList = await this.profileService.getProfiles(members.map((m) => m.user_id));
        const map = new Map<string, UserProfile>();
        for (const p of profileList) map.set(p.id, p);
        this.profiles.set(map);
      }
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      this.loading.set(false);
    }
  }
}
