import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RtPayload<T> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: Partial<T>;
};
import {
  Activity,
  ActivityUpdate,
  ItineraryDay,
  NewActivityInput,
  Trip,
  TripMember,
  TripUpdate,
} from '../../core/models/trip.model';
import { ItineraryService } from '../../core/services/itinerary.service';
import { MembersService } from '../../core/services/members.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { TripsService } from '../../core/services/trips.service';

@Injectable()
export class ItineraryStore {
  private readonly itinerary = inject(ItineraryService);
  private readonly tripsService = inject(TripsService);
  private readonly membersService = inject(MembersService);
  private readonly supabase = inject(SupabaseService).client;

  private readonly _tripId = signal<string | null>(null);
  private readonly _trip = signal<Trip | null>(null);
  private readonly _days = signal<ItineraryDay[]>([]);
  private readonly _activities = signal<Map<string, Activity[]>>(new Map());
  private readonly _tripMembers = signal<TripMember[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly trip = this._trip.asReadonly();
  readonly days = this._days.asReadonly();
  readonly activitiesByDay = this._activities.asReadonly();
  readonly tripMembers = this._tripMembers.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private channel: RealtimeChannel | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.unsubscribe());
  }

  async load(tripId: string) {
    this._tripId.set(tripId);
    this._loading.set(true);
    this._error.set(null);
    try {
      const [trip, days, members] = await Promise.all([
        this.tripsService.getById(tripId),
        this.itinerary.listDays(tripId),
        this.membersService.listMembers(tripId),
      ]);
      this._trip.set(trip);
      this._days.set(days);
      this._tripMembers.set(members);
      const activitiesByDay = await Promise.all(
        days.map((d) => this.itinerary.listActivities(d.id).then((acts) => [d.id, acts] as const)),
      );
      const map = new Map<string, Activity[]>();
      for (const [id, acts] of activitiesByDay) map.set(id, acts);
      this._activities.set(map);
      this.subscribe(tripId);
    } catch (e) {
      this._error.set(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      this._loading.set(false);
    }
  }

  async updateTrip(patch: TripUpdate): Promise<Trip> {
    const tripId = this._tripId();
    if (!tripId) throw new Error('No hay viaje cargado');
    const updated = await this.tripsService.update(tripId, patch);
    this._trip.set(updated);
    return updated;
  }

  async addDay(dayDate: string) {
    const tripId = this._tripId();
    if (!tripId) throw new Error('No hay viaje cargado');
    const day = await this.itinerary.addDay(tripId, dayDate);
    this.applyDayInsert(day);
    return day;
  }

  async removeDay(dayId: string) {
    await this.itinerary.deleteDay(dayId);
    this.applyDayDelete(dayId);
  }

  async addActivity(dayId: string, input: NewActivityInput) {
    const activity = await this.itinerary.addActivity(dayId, input);
    this.applyActivityUpsert(activity);
    return activity;
  }

  async updateActivity(activityId: string, dayId: string, patch: ActivityUpdate) {
    const updated = await this.itinerary.updateActivity(activityId, patch);
    this.applyActivityUpsert(updated);
    return updated;
  }

  async toggleCompleted(activity: Activity) {
    const updated = await this.itinerary.updateActivity(activity.id, {
      completed: !activity.completed,
    });
    this.applyActivityUpsert(updated);
    return updated;
  }

  async removeActivity(activityId: string, dayId: string) {
    await this.itinerary.deleteActivity(activityId);
    this.applyActivityDelete(activityId, dayId);
  }

  async reorderInDay(dayId: string, fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return;
    const previous = this._activities().get(dayId) ?? [];
    const next = [...previous];
    moveItemInArray(next, fromIdx, toIdx);
    this.setDayList(dayId, next);
    try {
      await this.itinerary.reorderActivities(next.map((a) => a.id));
      this.setDayList(
        dayId,
        next.map((a, idx) => ({ ...a, order_index: idx })),
      );
    } catch (e) {
      this.setDayList(dayId, previous);
      throw e;
    }
  }

  async transferBetweenDays(
    fromDayId: string,
    toDayId: string,
    fromIdx: number,
    toIdx: number,
  ) {
    if (fromDayId === toDayId) {
      return this.reorderInDay(fromDayId, fromIdx, toIdx);
    }
    const map = this._activities();
    const prevFrom = map.get(fromDayId) ?? [];
    const prevTo = map.get(toDayId) ?? [];

    const fromList = [...prevFrom];
    const toList = [...prevTo];
    transferArrayItem(fromList, toList, fromIdx, toIdx);
    const moved = toList[toIdx];
    if (!moved) return;

    this._activities.update((m) => {
      const next = new Map(m);
      next.set(
        fromDayId,
        fromList.map((a, idx) => ({ ...a, order_index: idx })),
      );
      next.set(
        toDayId,
        toList.map((a, idx) =>
          a.id === moved.id
            ? { ...a, day_id: toDayId, order_index: idx }
            : { ...a, order_index: idx },
        ),
      );
      return next;
    });

    try {
      await Promise.all([
        this.itinerary.moveActivityToDay(moved.id, toDayId),
        fromList.length > 0
          ? this.itinerary.reorderActivities(fromList.map((a) => a.id))
          : Promise.resolve(),
        this.itinerary.reorderActivities(toList.map((a) => a.id)),
      ]);
    } catch (e) {
      this._activities.update((m) => {
        const next = new Map(m);
        next.set(fromDayId, prevFrom);
        next.set(toDayId, prevTo);
        return next;
      });
      throw e;
    }
  }

  // ---- Realtime subscription ----

  private subscribe(tripId: string) {
    this.unsubscribe();
    this.channel = this.supabase
      .channel(`trip:${tripId}:itinerary`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
        (payload) => this.onTripEvent(payload as unknown as RtPayload<Trip>),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itinerary_days',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => this.onDayEvent(payload as unknown as RtPayload<ItineraryDay>),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `trip_id=eq.${tripId}` },
        (payload) => this.onActivityEvent(payload as unknown as RtPayload<Activity>),
      )
      .subscribe();
  }

  private unsubscribe() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private onTripEvent(payload: RtPayload<Trip>) {
    if (payload.eventType === 'UPDATE') {
      this._trip.set(payload.new as Trip);
    } else if (payload.eventType === 'DELETE') {
      this._trip.set(null);
    }
  }

  private onDayEvent(payload: RtPayload<ItineraryDay>) {
    if (payload.eventType === 'INSERT') {
      this.applyDayInsert(payload.new as ItineraryDay);
    } else if (payload.eventType === 'DELETE') {
      const id = (payload.old as Partial<ItineraryDay>).id;
      if (id) this.applyDayDelete(id);
    } else if (payload.eventType === 'UPDATE') {
      const day = payload.new as ItineraryDay;
      this._days.update((list) =>
        list.map((d) => (d.id === day.id ? day : d)).sort((a, b) =>
          a.day_date.localeCompare(b.day_date),
        ),
      );
    }
  }

  private onActivityEvent(payload: RtPayload<Activity>) {
    if (payload.eventType === 'INSERT') {
      this.applyActivityUpsert(payload.new as Activity);
    } else if (payload.eventType === 'UPDATE') {
      const next = payload.new as Activity;
      const prev = payload.old as Partial<Activity>;
      if (prev.day_id && prev.day_id !== next.day_id) {
        this.applyActivityDelete(next.id, prev.day_id);
      }
      this.applyActivityUpsert(next);
    } else if (payload.eventType === 'DELETE') {
      const old = payload.old as Partial<Activity>;
      if (old.id && old.day_id) {
        this.applyActivityDelete(old.id, old.day_id);
      }
    }
  }

  // ---- Reducers (idempotent) ----

  private applyDayInsert(day: ItineraryDay) {
    this._days.update((list) =>
      list.some((d) => d.id === day.id)
        ? list
        : [...list, day].sort((a, b) => a.day_date.localeCompare(b.day_date)),
    );
    this._activities.update((map) => {
      if (map.has(day.id)) return map;
      const next = new Map(map);
      next.set(day.id, []);
      return next;
    });
  }

  private applyDayDelete(dayId: string) {
    this._days.update((list) => list.filter((d) => d.id !== dayId));
    this._activities.update((map) => {
      if (!map.has(dayId)) return map;
      const next = new Map(map);
      next.delete(dayId);
      return next;
    });
  }

  private applyActivityUpsert(activity: Activity) {
    this._activities.update((map) => {
      const next = new Map(map);
      const list = next.get(activity.day_id) ?? [];
      const filtered = list.filter((a) => a.id !== activity.id);
      const merged = [...filtered, activity].sort((a, b) => a.order_index - b.order_index);
      next.set(activity.day_id, merged);
      return next;
    });
  }

  private applyActivityDelete(activityId: string, dayId: string) {
    this._activities.update((map) => {
      const list = map.get(dayId);
      if (!list || !list.some((a) => a.id === activityId)) return map;
      const next = new Map(map);
      next.set(
        dayId,
        list.filter((a) => a.id !== activityId),
      );
      return next;
    });
  }

  private setDayList(dayId: string, list: Activity[]) {
    this._activities.update((m) => {
      const next = new Map(m);
      next.set(dayId, list);
      return next;
    });
  }
}
