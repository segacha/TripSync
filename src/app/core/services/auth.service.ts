import { computed, inject, Injectable, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export type SignUpOutcome =
  | { status: 'signed_in' }
  | { status: 'confirmation_sent' }
  | { status: 'already_registered' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;

  private readonly _session = signal<Session | null>(null);
  private readonly _ready = signal(false);

  readonly session = this._session.asReadonly();
  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly ready = this._ready.asReadonly();

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      this._ready.set(true);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
    });
  }

  /**
   * Cuando el email ya tiene cuenta, Supabase NO devuelve error ni manda mail:
   * responde 200 con un usuario ofuscado (sin identities) para evitar que se
   * pueda enumerar usuarios. Hay que detectarlo o el alta parece exitosa.
   */
  async signUp(email: string, password: string): Promise<SignUpOutcome> {
    const { data, error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.session) return { status: 'signed_in' };
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      return { status: 'already_registered' };
    }
    return { status: 'confirmation_sent' };
  }

  /** Reenvía el mail de confirmación de un alta pendiente. */
  async resendSignUpConfirmation(email: string) {
    const { error } = await this.supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }
}
