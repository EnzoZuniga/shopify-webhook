import QRCode from 'qrcode';
import Database from 'better-sqlite3';
import path from 'path';

export interface TicketData {
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

export interface TicketGenerationOptions {
  orderId: number;
  orderNumber: number;
  customerEmail: string;
  lineItems: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  currency: string;
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export class TicketService {
  private baseUrl: string;
  private db: Database.Database;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Initialiser la base de données SQLite
    const dbPath = path.join(process.cwd(), 'data', 'qrcodes.db');
    this.db = new Database(dbPath);
  }

  // Générer des tickets pour une commande
  async generateTicketsForOrder(options: TicketGenerationOptions): Promise<TicketData[]> {
    const { orderId, orderNumber, customerEmail, lineItems, currency, size = 200, margin = 2, color = {} } = options;
    
    const tickets: TicketData[] = [];

    for (const lineItem of lineItems) {
      // Générer un ticket pour chaque quantité
      for (let i = 0; i < lineItem.quantity; i++) {
        const ticketId = this.generateTicketId(orderNumber, lineItem.title, i + 1);
        
        // Vérifier si le ticket existe déjà
        const existingTicket = this.getTicketById(ticketId);
        if (existingTicket) {
          console.log(`Ticket déjà existant: ${ticketId}`);
          tickets.push(existingTicket);
          continue;
        }

        // Générer l'URL de validation pour ce ticket spécifique
        const validationUrl = `${this.baseUrl}/api/ticket/validate/${ticketId}`;
        
        // Générer le QR code en base64
        const qrCodeDataURL = await QRCode.toDataURL(validationUrl, {
          width: size,
          margin: margin,
          color: {
            dark: color.dark || '#8B4513',
            light: color.light || '#FDF8ED'
          },
          errorCorrectionLevel: 'M'
        });

        // Créer le ticket en base de données
        const id = this.generateId();
        const createdAt = new Date().toISOString();
        
        const insertStmt = this.db.prepare(`
          INSERT INTO tickets (
            id, orderId, orderNumber, ticketId, customerEmail, 
            ticketTitle, quantity, price, currency, qrCodeData, 
            status, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        insertStmt.run(
          id,
          orderId,
          orderNumber,
          ticketId,
          customerEmail,
          lineItem.title,
          1, // Quantité individuelle pour ce ticket
          lineItem.price,
          currency,
          qrCodeDataURL,
          'pending',
          createdAt
        );

        const ticket: TicketData = {
          id,
          orderId,
          orderNumber,
          ticketId,
          customerEmail,
          ticketTitle: lineItem.title,
          quantity: 1,
          price: lineItem.price,
          currency,
          qrCodeData: qrCodeDataURL,
          status: 'pending',
          createdAt
        };

        tickets.push(ticket);
        console.log(`Ticket généré: ${ticketId} pour ${lineItem.title}`);
      }
    }

    return tickets;
  }

  // Obtenir un ticket par son ID unique
  getTicketById(ticketId: string): TicketData | null {
    const stmt = this.db.prepare('SELECT * FROM tickets WHERE ticketId = ?');
    return stmt.get(ticketId);
  }

  // Obtenir tous les tickets d'une commande
  getTicketsByOrderNumber(orderNumber: number): TicketData[] {
    const stmt = this.db.prepare('SELECT * FROM tickets WHERE orderNumber = ? ORDER BY createdAt ASC');
    return stmt.all(orderNumber);
  }

  // Valider un ticket
  validateTicket(ticketId: string, validatedBy: string, notes?: string): boolean {
    const ticket = this.getTicketById(ticketId);
    
    if (!ticket) {
      console.error(`Ticket non trouvé: ${ticketId}`);
      return false;
    }

    if (ticket.status !== 'pending') {
      console.error(`Ticket déjà traité: ${ticketId}`);
      return false;
    }

    const validatedAt = new Date().toISOString();
    
    // Mettre à jour le ticket
    const updateStmt = this.db.prepare(`
      UPDATE tickets 
      SET status = ?, validatedAt = ?, validatedBy = ?
      WHERE ticketId = ?
    `);
    
    updateStmt.run('validated', validatedAt, validatedBy, ticketId);
    
    // Enregistrer la validation
    const validationId = this.generateId();
    const insertValidationStmt = this.db.prepare(`
      INSERT INTO ticket_validations (id, ticketId, validatedBy, validatedAt, notes)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertValidationStmt.run(validationId, ticketId, validatedBy, validatedAt, notes || null);
    
    console.log(`Ticket validé: ${ticketId} par ${validatedBy}`);
    return true;
  }

  // Marquer un ticket comme utilisé
  markTicketAsUsed(ticketId: string): boolean {
    const ticket = this.getTicketById(ticketId);
    
    if (!ticket) {
      console.error(`Ticket non trouvé: ${ticketId}`);
      return false;
    }

    if (ticket.status !== 'validated') {
      console.error(`Ticket doit être validé avant d'être utilisé: ${ticketId}`);
      return false;
    }

    const usedAt = new Date().toISOString();
    const updateStmt = this.db.prepare(`
      UPDATE tickets 
      SET status = ?, usedAt = ?
      WHERE ticketId = ?
    `);
    
    updateStmt.run('used', usedAt, ticketId);
    
    console.log(`Ticket marqué comme utilisé: ${ticketId}`);
    return true;
  }

  // Obtenir tous les tickets
  getAllTickets(): TicketData[] {
    const stmt = this.db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC');
    return stmt.all();
  }

  // Obtenir les statistiques
  getStats() {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM tickets');
    const pendingStmt = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'pending'");
    const validatedStmt = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'validated'");
    const usedStmt = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'used'");
    const expiredStmt = this.db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'expired'");
    const validationsStmt = this.db.prepare('SELECT COUNT(*) as count FROM ticket_validations');

    return {
      total: totalStmt.get().count,
      pending: pendingStmt.get().count,
      validated: validatedStmt.get().count,
      used: usedStmt.get().count,
      expired: expiredStmt.get().count,
      totalValidations: validationsStmt.get().count
    };
  }

  // Recherche de tickets
  searchTickets(filters: {
    status?: string;
    customerEmail?: string;
    orderNumber?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params: any[] = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.customerEmail) {
      query += ' AND customerEmail LIKE ?';
      params.push(`%${filters.customerEmail}%`);
    }

    if (filters.orderNumber) {
      query += ' AND orderNumber = ?';
      params.push(filters.orderNumber);
    }

    if (filters.dateFrom) {
      query += ' AND createdAt >= ?';
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      query += ' AND createdAt <= ?';
      params.push(filters.dateTo);
    }

    query += ' ORDER BY createdAt DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  // Générer un ID de ticket unique
  private generateTicketId(orderNumber: number, title: string, index: number): string {
    const cleanTitle = title
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 10)
      .toLowerCase();
    
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    
    return `${orderNumber}_${cleanTitle}_${index}_${timestamp}_${random}`;
  }

  // Générer un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const ticketService = new TicketService();
