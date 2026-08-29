import { Injectable } from '@angular/core';
import { Activity, TripMember } from '../models/trip.model';

export interface MemberCost {
  userId: string;
  email: string;
  totalCost: number;
  breakdown: ActivityCostBreakdown[];
}

export interface ActivityCostBreakdown {
  activityId: string;
  activityTitle: string;
  totalPrice: number;
  costPerPerson: number;
}

@Injectable({ providedIn: 'root' })
export class CostCalculatorService {
  /**
   * Calcula el costo que debe pagar cada miembro basado en las actividades
   */
  calculateCostsByMember(
    activities: Activity[],
    tripMembers: TripMember[],
    currentUserId: string
  ): MemberCost[] {
    const costMap = new Map<string, { email: string; costs: number[] }>();

    // Inicializar mapa de costos
    for (const member of tripMembers) {
      costMap.set(member.user_id, {
        email: member.email,
        costs: [],
      });
    }

    // Procesar cada actividad
    for (const activity of activities) {
      if (!activity.price || activity.price <= 0) continue;

      const distribution = activity.priceDistribution || 'equal';

      switch (distribution) {
        case 'equal':
          // Dividir entre todos los miembros
          this.distributeEqual(activity, costMap, tripMembers);
          break;

        case 'assigned':
          // Dividir entre los miembros asignados
          this.distributeAssigned(activity, costMap);
          break;

        case 'per_person':
          // Cada miembro paga el precio completo
          this.distributePerPerson(activity, costMap, tripMembers);
          break;
      }
    }

    // Convertir mapa a arreglo ordenado
    const memberCosts: MemberCost[] = [];
    for (const [userId, data] of costMap.entries()) {
      memberCosts.push({
        userId,
        email: data.email,
        totalCost: data.costs.reduce((a, b) => a + b, 0),
        breakdown: this.getActivityBreakdown(activities, userId, tripMembers),
      });
    }

    // Ordenar por total cost descendente
    return memberCosts.sort((a, b) => b.totalCost - a.totalCost);
  }

  /**
   * Obtiene los detalles de desglose de costos por actividad
   */
  private getActivityBreakdown(
    activities: Activity[],
    userId: string,
    tripMembers: TripMember[]
  ): ActivityCostBreakdown[] {
    const breakdown: ActivityCostBreakdown[] = [];

    for (const activity of activities) {
      if (!activity.price || activity.price <= 0) continue;

      const userCost = this.calculateUserActivityCost(activity, userId, tripMembers);
      if (userCost > 0) {
        breakdown.push({
          activityId: activity.id,
          activityTitle: activity.title,
          totalPrice: activity.price,
          costPerPerson: userCost,
        });
      }
    }

    return breakdown.sort((a, b) => b.costPerPerson - a.costPerPerson);
  }

  /**
   * Calcula cuánto debe pagar un usuario específico en una actividad
   */
  calculateUserActivityCost(
    activity: Activity,
    userId: string,
    tripMembers: TripMember[]
  ): number {
    if (!activity.price || activity.price <= 0) return 0;

    const distribution = activity.priceDistribution || 'equal';

    switch (distribution) {
      case 'equal':
        return activity.price / tripMembers.length;

      case 'assigned': {
        const assignedMembers = activity.priceAssignedMembers || [];
        if (!assignedMembers.includes(userId)) return 0;
        return activity.price / assignedMembers.length;
      }

      case 'per_person':
        return activity.price;

      default:
        return 0;
    }
  }

  /**
   * Distribuye el costo equitativamente entre todos
   */
  private distributeEqual(
    activity: Activity,
    costMap: Map<string, { email: string; costs: number[] }>,
    tripMembers: TripMember[]
  ): void {
    const costPerPerson = activity.price! / tripMembers.length;
    for (const member of tripMembers) {
      const data = costMap.get(member.user_id);
      if (data) {
        data.costs.push(costPerPerson);
      }
    }
  }

  /**
   * Distribuye el costo solo entre miembros asignados
   */
  private distributeAssigned(
    activity: Activity,
    costMap: Map<string, { email: string; costs: number[] }>
  ): void {
    const assignedMembers = activity.priceAssignedMembers || [];
    if (assignedMembers.length === 0) return;

    const costPerPerson = activity.price! / assignedMembers.length;
    for (const memberId of assignedMembers) {
      const data = costMap.get(memberId);
      if (data) {
        data.costs.push(costPerPerson);
      }
    }
  }

  /**
   * Cada miembro paga el precio completo
   */
  private distributePerPerson(
    activity: Activity,
    costMap: Map<string, { email: string; costs: number[] }>,
    tripMembers: TripMember[]
  ): void {
    for (const member of tripMembers) {
      const data = costMap.get(member.user_id);
      if (data) {
        data.costs.push(activity.price!);
      }
    }
  }
}
