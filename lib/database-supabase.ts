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
      // Mapper les noms de colonnes camelCase vers snake_case
      const dbTicket = {
        id: ticket.id,
        ticket_id: ticket.ticketId,
        order_id: ticket.orderId,
        order_number: ticket.orderNumber,
        customer_email: ticket.customerEmail,
        ticket_title: ticket.ticketTitle,
        qr_code_data: ticket.qrCodeData,
        status: ticket.status,
        created_at: ticket.createdAt,
        validated_at: ticket.validatedAt,
        used_at: ticket.usedAt,
        validated_by: ticket.validatedBy
      };

      const { error } = await this.supabase
        .from('tickets')
        .insert([dbTicket]);

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
        .eq('ticket_id', ticketId)
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        return null;
      }

      if (!data) return null;

      // Mapper les noms de colonnes snake_case vers camelCase
      return {
        id: data.id,
        orderId: data.order_id,
        orderNumber: data.order_number,
        ticketId: data.ticket_id,
        customerEmail: data.customer_email,
        ticketTitle: data.ticket_title,
        quantity: data.quantity || 1,
        price: data.price || '0.00',
        currency: data.currency || 'EUR',
        qrCodeData: data.qr_code_data,
        status: data.status,
        createdAt: data.created_at,
        validatedAt: data.validated_at,
        usedAt: data.used_at,
        validatedBy: data.validated_by
      };
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
        updateData.validated_at = now;
        updateData.validated_by = validatedBy;
      } else if (status === 'used') {
        updateData.used_at = now;
      }

      const { error } = await this.supabase
        .from('tickets')
        .update(updateData)
        .eq('ticket_id', ticketId);

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
      // Mapper les noms de colonnes camelCase vers snake_case
      const dbValidation = {
        id: validation.id,
        ticket_id: validation.ticketId,
        validated_by: validation.validatedBy,
        validated_at: validation.validatedAt,
        notes: validation.notes
      };

      const { error } = await this.supabase
        .from('ticket_validations')
        .insert([dbValidation]);

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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        return [];
      }

      if (!data) return [];

      // Mapper les données de la base vers notre interface
      return data.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        orderNumber: item.order_number,
        ticketId: item.ticket_id,
        customerEmail: item.customer_email,
        ticketTitle: item.ticket_title,
        quantity: item.quantity || 1,
        price: item.price || '0.00',
        currency: item.currency || 'EUR',
        qrCodeData: item.qr_code_data,
        status: item.status,
        createdAt: item.created_at,
        validatedAt: item.validated_at,
        usedAt: item.used_at,
        validatedBy: item.validated_by
      }));
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
        query = query.eq('order_number', filters.orderNumber);
      }
      if (filters.customerEmail) {
        query = query.eq('customer_email', filters.customerEmail);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        return [];
      }

      if (!data) return [];

      // Mapper les données de la base vers notre interface
      return data.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        orderNumber: item.order_number,
        ticketId: item.ticket_id,
        customerEmail: item.customer_email,
        ticketTitle: item.ticket_title,
        quantity: item.quantity || 1,
        price: item.price || '0.00',
        currency: item.currency || 'EUR',
        qrCodeData: item.qr_code_data,
        status: item.status,
        createdAt: item.created_at,
        validatedAt: item.validated_at,
        usedAt: item.used_at,
        validatedBy: item.validated_by
      }));
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
