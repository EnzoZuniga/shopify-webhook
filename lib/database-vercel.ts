// Base de données compatible Vercel
// Utilise le système de fichiers éphémère de Vercel

import fs from 'fs';
import path from 'path';

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

class VercelDatabase {
  private dataDir: string;
  private ticketsFile: string;
  private validationsFile: string;

  constructor() {
    // Utiliser /tmp sur Vercel (système de fichiers éphémère)
    this.dataDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
    this.ticketsFile = path.join(this.dataDir, 'tickets.json');
    this.validationsFile = path.join(this.dataDir, 'validations.json');
    
    this.initializeDatabase();
  }

  private initializeDatabase() {
    try {
      // Créer le dossier si nécessaire
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      // Initialiser les fichiers JSON
      if (!fs.existsSync(this.ticketsFile)) {
        fs.writeFileSync(this.ticketsFile, JSON.stringify([], null, 2));
      }
      if (!fs.existsSync(this.validationsFile)) {
        fs.writeFileSync(this.validationsFile, JSON.stringify([], null, 2));
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
  }

  private readTickets(): TicketData[] {
    try {
      const data = fs.readFileSync(this.ticketsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors de la lecture des tickets:', error);
      return [];
    }
  }

  private writeTickets(tickets: TicketData[]) {
    try {
      fs.writeFileSync(this.ticketsFile, JSON.stringify(tickets, null, 2));
    } catch (error) {
      console.error('Erreur lors de l\'écriture des tickets:', error);
    }
  }

  private readValidations(): TicketValidation[] {
    try {
      const data = fs.readFileSync(this.validationsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors de la lecture des validations:', error);
      return [];
    }
  }

  private writeValidations(validations: TicketValidation[]) {
    try {
      fs.writeFileSync(this.validationsFile, JSON.stringify(validations, null, 2));
    } catch (error) {
      console.error('Erreur lors de l\'écriture des validations:', error);
    }
  }

  // Méthodes pour les tickets
  createTicket(ticket: TicketData): boolean {
    try {
      const tickets = this.readTickets();
      tickets.push(ticket);
      this.writeTickets(tickets);
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      return false;
    }
  }

  getTicketByTicketId(ticketId: string): TicketData | null {
    try {
      const tickets = this.readTickets();
      return tickets.find(t => t.ticketId === ticketId) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du ticket:', error);
      return null;
    }
  }

  updateTicketStatus(ticketId: string, status: string, validatedBy?: string, notes?: string): boolean {
    try {
      const tickets = this.readTickets();
      const ticketIndex = tickets.findIndex(t => t.ticketId === ticketId);
      
      if (ticketIndex === -1) return false;

      const now = new Date().toISOString();
      
      if (status === 'validated') {
        tickets[ticketIndex].status = 'validated';
        tickets[ticketIndex].validatedAt = now;
        tickets[ticketIndex].validatedBy = validatedBy;
      } else if (status === 'used') {
        tickets[ticketIndex].status = 'used';
        tickets[ticketIndex].usedAt = now;
      }

      this.writeTickets(tickets);

      // Enregistrer la validation
      if (status === 'validated' && validatedBy) {
        const validations = this.readValidations();
        validations.push({
          id: this.generateId(),
          ticketId,
          validatedBy,
          validatedAt: now,
          notes
        });
        this.writeValidations(validations);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du ticket:', error);
      return false;
    }
  }

  getAllTickets(): TicketData[] {
    return this.readTickets();
  }

  getStats() {
    const tickets = this.readTickets();
    const validations = this.readValidations();

    return {
      total: tickets.length,
      pending: tickets.filter(t => t.status === 'pending').length,
      validated: tickets.filter(t => t.status === 'validated').length,
      used: tickets.filter(t => t.status === 'used').length,
      expired: tickets.filter(t => t.status === 'expired').length,
      totalValidations: validations.length
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const vercelDatabase = new VercelDatabase();
export type { TicketData, TicketValidation };
