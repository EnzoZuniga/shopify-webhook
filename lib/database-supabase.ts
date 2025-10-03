// Base de données Supabase pour Vercel
// PostgreSQL serverless avec API REST automatique

import { createClient } from '@supabase/supabase-js';

interface TicketData {
  id: string;
  orderId: number;
  orderNumber: number;
  ticketId: string;
  customerEmail: string;
  ticketTitle: string;
  quantity: number;
  price: string;
  currency: string;
  qrCodeData: string;
  status: 'pending' | 'validated' | 'used' | 'expired';
  createdAt: string;
  validatedAt?: string;
  usedAt?: string;
  validatedBy?: string;
}

interface TicketValidation {
  id: string;
  ticketId: string;
  validatedBy: string;
  validatedAt: string;
  notes?: string;
}

class SupabaseDatabase {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables d\'environnement Supabase manquantes');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Créer un ticket
  async createTicket(ticket: TicketData): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('tickets')
        .insert([ticket]);

      if (error) {
        console.error('Erreur Supabase:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      return false;
    }
  }

  // Obtenir un ticket par ID
  async getTicketByTicketId(ticketId: string): Promise<TicketData | null> {
    try {
      const { data, error } = await this.supabase
        .from('tickets')
        .select('*')
        .eq('ticketId', ticketId)
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du ticket:', error);
      return null;
    }
  }

  // Mettre à jour le statut d'un ticket
  async updateTicketStatus(ticketId: string, status: string, validatedBy?: string, notes?: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const updateData: any = { status };

      if (status === 'validated') {
        updateData.validatedAt = now;
        updateData.validatedBy = validatedBy;
      } else if (status === 'used') {
        updateData.usedAt = now;
      }

      const { error } = await this.supabase
        .from('tickets')
        .update(updateData)
        .eq('ticketId', ticketId);

      if (error) {
        console.error('Erreur Supabase:', error);
        return false;
      }

      // Enregistrer la validation si nécessaire
      if (status === 'validated' && validatedBy) {
        await this.createValidation({
          id: this.generateId(),
          ticketId,
          validatedBy,
          validatedAt: now,
          notes
        });
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du ticket:', error);
      return false;
    }
  }

  // Créer une validation
  async createValidation(validation: TicketValidation): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('ticket_validations')
        .insert([validation]);

      if (error) {
        console.error('Erreur Supabase:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la création de la validation:', error);
      return false;
    }
  }

  // Obtenir tous les tickets
  async getAllTickets(): Promise<TicketData[]> {
    try {
      const { data, error } = await this.supabase
        .from('tickets')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      return [];
    }
  }

  // Obtenir les statistiques
  async getStats() {
    try {
      const { data: tickets, error: ticketsError } = await this.supabase
        .from('tickets')
        .select('status');

      if (ticketsError) {
        console.error('Erreur Supabase tickets:', ticketsError);
        return { total: 0, pending: 0, validated: 0, used: 0, expired: 0, totalValidations: 0 };
      }

      const { data: validations, error: validationsError } = await this.supabase
        .from('ticket_validations')
        .select('id');

      if (validationsError) {
        console.error('Erreur Supabase validations:', validationsError);
      }

      const stats = {
        total: tickets?.length || 0,
        pending: tickets?.filter((t: any) => t.status === 'pending').length || 0,
        validated: tickets?.filter((t: any) => t.status === 'validated').length || 0,
        used: tickets?.filter((t: any) => t.status === 'used').length || 0,
        expired: tickets?.filter((t: any) => t.status === 'expired').length || 0,
        totalValidations: validations?.length || 0
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { total: 0, pending: 0, validated: 0, used: 0, expired: 0, totalValidations: 0 };
    }
  }

  // Recherche de tickets
  async searchTickets(filters: {
    status?: string;
    orderNumber?: number;
    customerEmail?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<TicketData[]> {
    try {
      let query = this.supabase
        .from('tickets')
        .select('*');

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.orderNumber) {
        query = query.eq('orderNumber', filters.orderNumber);
      }
      if (filters.customerEmail) {
        query = query.eq('customerEmail', filters.customerEmail);
      }
      if (filters.dateFrom) {
        query = query.gte('createdAt', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('createdAt', filters.dateTo);
      }

      const { data, error } = await query.order('createdAt', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche des tickets:', error);
      return [];
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const supabaseDatabase = new SupabaseDatabase();
export type { TicketData, TicketValidation };
