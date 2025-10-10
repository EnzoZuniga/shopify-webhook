// Service de tickets avec Supabase
// PostgreSQL serverless avec API REST automatique

import QRCode from 'qrcode';
import { supabaseDatabase, TicketData } from './database-supabase';
import { OrderData } from '../src/email-templates';

export interface TicketGenerationOptions {
  orderId: number;
  orderNumber: number;
  customerEmail: string;
  lineItems: any[];
  currency: string;
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export class TicketServiceSupabase {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  // Générer des tickets pour une commande
  async generateTicketsForOrder(options: TicketGenerationOptions): Promise<TicketData[]> {
    const { orderId, orderNumber, customerEmail, lineItems, currency, size = 200, margin = 2, color = {} } = options;
    
    const tickets: TicketData[] = [];

    for (const item of lineItems) {
      // Ignorer les frais de service
      if (item.title.toLowerCase().includes('service') || 
          item.title.toLowerCase().includes('frais') ||
          item.title.toLowerCase().includes('charge')) {
        continue;
      }

      // Créer un ticket pour chaque quantité
      for (let i = 0; i < item.quantity; i++) {
        const ticketId = this.generateTicketId(orderNumber, item.title, i + 1);
        const ticketTitle = this.cleanTicketTitle(item.title);
        
        // Générer l'URL de validation
        const validationUrl = `${this.baseUrl}/api/ticket/validate/${ticketId}`;
        
        // Générer le QR code
        const qrCodeDataURL = await QRCode.toDataURL(validationUrl, {
          width: size,
          margin: margin,
          color: {
            dark: color.dark || '#8B4513',
            light: color.light || '#FDF8ED'
          },
          errorCorrectionLevel: 'M'
        });

        const ticket: TicketData = {
          id: this.generateId(),
          orderId,
          orderNumber,
          ticketId,
          customerEmail,
          ticketTitle,
          quantity: 1,
          price: item.price,
          currency,
          qrCodeData: qrCodeDataURL,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // Sauvegarder en base Supabase
        const saved = await supabaseDatabase.createTicket(ticket);
        if (saved) {
          tickets.push(ticket);
          console.log(`🎫 Ticket généré: ${ticketId}`);
        }
      }
    }

    console.log(`✅ ${tickets.length} tickets générés pour la commande #${orderNumber}`);
    return tickets;
  }

  // Valider un ticket
  async validateTicket(ticketId: string, validatedBy: string, notes?: string): Promise<boolean> {
    const ticket = await supabaseDatabase.getTicketByTicketId(ticketId);
    
    if (!ticket) {
      console.error(`Ticket non trouvé: ${ticketId}`);
      return false;
    }

    if (ticket.status !== 'pending') {
      console.error(`Ticket déjà traité: ${ticketId}`);
      return false;
    }

    const success = await supabaseDatabase.updateTicketStatus(ticketId, 'validated', validatedBy, notes);
    
    if (success) {
      console.log(`✅ Ticket validé: ${ticketId} par ${validatedBy}`);
    }
    
    return success;
  }

  // Marquer un ticket comme utilisé
  async markTicketAsUsed(ticketId: string): Promise<boolean> {
    const ticket = await supabaseDatabase.getTicketByTicketId(ticketId);
    
    if (!ticket) {
      console.error(`Ticket non trouvé: ${ticketId}`);
      return false;
    }

    // Vérifier si le ticket est déjà utilisé
    if (ticket.status === 'used') {
      console.log(`Ticket déjà utilisé: ${ticketId}`);
      return true; // Considérer comme succès si déjà utilisé
    }

    const success = await supabaseDatabase.updateTicketStatus(ticketId, 'used');
    
    if (success) {
      console.log(`🎫 Ticket marqué comme utilisé: ${ticketId}`);
    }
    
    return success;
  }

  // Obtenir les informations d'un ticket
  async getTicketInfo(ticketId: string): Promise<TicketData | null> {
    return await supabaseDatabase.getTicketByTicketId(ticketId);
  }

  // Obtenir tous les tickets
  async getAllTickets(): Promise<TicketData[]> {
    return await supabaseDatabase.getAllTickets();
  }

  // Obtenir les statistiques
  async getStats() {
    return await supabaseDatabase.getStats();
  }

  // Recherche de tickets
  async searchTickets(filters: {
    status?: string;
    orderNumber?: number;
    customerEmail?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<TicketData[]> {
    return await supabaseDatabase.searchTickets(filters);
  }

  // Générer un ID de ticket unique
  private generateTicketId(orderNumber: number, title: string, index: number): string {
    const cleanTitle = this.cleanTicketTitle(title).toLowerCase().replace(/[^a-z0-9]/g, '');
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    
    return `${orderNumber}_${cleanTitle}_${index}_${timestamp}_${random}`;
  }

  // Nettoyer le titre du ticket
  private cleanTicketTitle(title: string): string {
    return title
      .replace(/🎫/g, '')
      .replace(/MR NJP Event's/g, 'MR NJP Events')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Générer un UUID v4
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const ticketServiceSupabase = new TicketServiceSupabase();
