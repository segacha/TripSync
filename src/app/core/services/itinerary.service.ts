import { inject, Injectable } from '@angular/core';
import { Activity, ActivityUpdate, ItineraryDay, NewActivityInput } from '../models/trip.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ItineraryService {
  private readonly supabase = inject(SupabaseService).client;

  async listDays(tripId: string): Promise<ItineraryDay[]> {
    const { data, error } = await this.supabase
      .from('itinerary_days')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_date', { ascending: true });
    if (error) throw error;
    return (data ?? []) as ItineraryDay[];
  }

  async addDay(tripId: string, dayDate: string): Promise<ItineraryDay> {
    const { data, error } = await this.supabase
      .from('itinerary_days')
      .insert({ trip_id: tripId, day_date: dayDate })
      .select('*')
      .single();
    if (error) throw error;
    return data as ItineraryDay;
  }

  async deleteDay(dayId: string): Promise<void> {
    const { error } = await this.supabase.from('itinerary_days').delete().eq('id', dayId);
    if (error) throw error;
  }

  async listActivities(dayId: string): Promise<Activity[]> {
    const { data, error } = await this.supabase
      .from('activities')
      .select('*')
      .eq('day_id', dayId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Activity[];
  }

  async addActivity(dayId: string, input: NewActivityInput): Promise<Activity> {
    const { data: maxRow, error: maxErr } = await this.supabase
      .from('activities')
      .select('order_index')
      .eq('day_id', dayId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (maxErr) throw maxErr;

    const nextIndex = ((maxRow?.order_index as number | undefined) ?? -1) + 1;

    const { data, error } = await this.supabase
      .from('activities')
      .insert({
        day_id: dayId,
        title: input.title,
        description: input.description ?? null,
        location: input.location ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        link: input.link ?? null,
        completed: false,
        order_index: nextIndex,
        price: input.price ?? null,
        priceDistribution: input.priceDistribution ?? null,
        priceAssignedMembers: input.priceAssignedMembers ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return data as Activity;
  }

  async updateActivity(activityId: string, patch: ActivityUpdate): Promise<Activity> {
    const { data, error } = await this.supabase
      .from('activities')
      .update(patch)
      .eq('id', activityId)
      .select('*')
      .single();
    if (error) throw error;
    return data as Activity;
  }

  async deleteActivity(activityId: string): Promise<void> {
    const { error } = await this.supabase.from('activities').delete().eq('id', activityId);
    if (error) throw error;
  }

  async moveActivityToDay(activityId: string, newDayId: string): Promise<void> {
    const { error } = await this.supabase
      .from('activities')
      .update({ day_id: newDayId })
      .eq('id', activityId);
    if (error) throw error;
  }

  async reorderActivities(orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((id, index) =>
      this.supabase.from('activities').update({ order_index: index }).eq('id', id),
    );
    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) throw firstError;
  }
}
