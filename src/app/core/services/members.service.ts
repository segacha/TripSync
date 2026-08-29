import { inject, Injectable } from '@angular/core';
import {
  InviteResult,
  TripInvitation,
  TripMember,
  TripMemberRole,
} from '../models/trip.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly supabase = inject(SupabaseService).client;

  async listMembers(tripId: string): Promise<TripMember[]> {
    const { data, error } = await this.supabase
      .from('trip_members')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as TripMember[];
  }

  async listPendingInvitations(tripId: string): Promise<TripInvitation[]> {
    const { data, error } = await this.supabase
      .from('trip_invitations')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as TripInvitation[];
  }

  async invite(tripId: string, email: string, role: TripMemberRole): Promise<InviteResult> {
    const { data, error } = await this.supabase.rpc('invite_to_trip', {
      p_trip_id: tripId,
      p_email: email,
      p_role: role,
    });
    if (error) throw error;
    return data as InviteResult;
  }

  async updateRole(tripId: string, userId: string, role: TripMemberRole): Promise<TripMember> {
    const { data, error } = await this.supabase
      .from('trip_members')
      .update({ role })
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return data as TripMember;
  }

  async removeMember(tripId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('trip_members')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('trip_invitations')
      .delete()
      .eq('id', invitationId);
    if (error) throw error;
  }
}
