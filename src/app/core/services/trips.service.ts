import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';
import { NewTripInput, Trip, TripUpdate } from '../models/trip.model';

@Injectable({ providedIn: 'root' })
export class TripsService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);

  async listMine(): Promise<Trip[]> {
    const { data, error } = await this.supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Trip[];
  }

  async getById(id: string): Promise<Trip | null> {
    const { data, error } = await this.supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Trip | null;
  }

  async create(input: NewTripInput): Promise<Trip> {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('No autenticado');

    const { data, error } = await this.supabase
      .from('trips')
      .insert({
        title: input.title,
        description: input.description ?? null,
        start_date: input.start_date ?? null,
        end_date: input.end_date ?? null,
        owner: userId,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as Trip;
  }

  async update(id: string, patch: TripUpdate): Promise<Trip> {
    const { data, error } = await this.supabase
      .from('trips')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Trip;
  }
}
