import { inject, Injectable } from '@angular/core';
import { UserProfile } from '../models/trip.model';
import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as UserProfile | null;
  }

  async getProfiles(userIds: string[]): Promise<UserProfile[]> {
    if (userIds.length === 0) return [];
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    if (error) throw error;
    return (data ?? []) as UserProfile[];
  }

  async upsertProfile(userId: string, patch: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .upsert({ id: userId, ...patch, updated_at: new Date().toISOString() })
      .select('*')
      .single();
    if (error) throw error;
    return data as UserProfile;
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/avatar.${ext}`;

    const { error } = await this.supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;

    const { data } = this.supabase.storage.from('avatars').getPublicUrl(path);
    // Bust cache with timestamp
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  async uploadTripCover(tripId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${tripId}/cover.${ext}`;

    const { error } = await this.supabase.storage
      .from('trip-covers')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;

    const { data } = this.supabase.storage.from('trip-covers').getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  }
}
