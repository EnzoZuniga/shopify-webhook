import Database from 'better-sqlite3';
import path from 'path';

export interface QRCodeData {
  id: string;
  orderId: number;
  orderNumber: number;
  customerEmail: string;
  qrCodeData: string;
  status: 'pending' | 'validated' | 'used' | 'expired';
  createdAt: string;
  validatedAt?: string;
  usedAt?: string;
  validatedBy?: string;
}

export interface QRCodeValidation {
  id: string;
  qrCodeId: string;
  validatedBy: string;
  validatedAt: string;
  notes?: string;
}

class SQLiteDatabase {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'qrcodes.db');
    
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(dbPath);
    if (!require('fs').existsSync(dataDir)) {
      require('fs').mkdirSync(dataDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // Table des QR codes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS qrcodes (
        id TEXT PRIMARY KEY,
        orderId INTEGER NOT NULL,
        orderNumber INTEGER UNIQUE NOT NULL,
        customerEmail TEXT NOT NULL,
        qrCodeData TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'used', 'expired')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        validatedAt DATETIME,
        usedAt DATETIME,
        validatedBy TEXT
      )
    `);

    // Table des validations
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS validations (
        id TEXT PRIMARY KEY,
        qrCodeId TEXT NOT NULL,
        validatedBy TEXT NOT NULL,
        validatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (qrCodeId) REFERENCES qrcodes (id)
      )
    `);

    // Index pour les performances
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_qrcodes_orderNumber ON qrcodes (orderNumber);
      CREATE INDEX IF NOT EXISTS idx_qrcodes_status ON qrcodes (status);
      CREATE INDEX IF NOT EXISTS idx_qrcodes_customerEmail ON qrcodes (customerEmail);
      CREATE INDEX IF NOT EXISTS idx_validations_qrCodeId ON validations (qrCodeId);
    `);

    console.log('✅ Base de données SQLite initialisée');
  }

  // Lire tous les QR codes
  getQRCodes(): QRCodeData[] {
    const stmt = this.db.prepare('SELECT * FROM qrcodes ORDER BY createdAt DESC');
    return stmt.all() as QRCodeData[];
  }

  // Lire un QR code par ID
  getQRCodeById(id: string): QRCodeData | null {
    const stmt = this.db.prepare('SELECT * FROM qrcodes WHERE id = ?');
    return stmt.get(id) as QRCodeData || null;
  }

  // Lire un QR code par numéro de commande
  getQRCodeByOrderNumber(orderNumber: number): QRCodeData | null {
    const stmt = this.db.prepare('SELECT * FROM qrcodes WHERE orderNumber = ?');
    return stmt.get(orderNumber) as QRCodeData || null;
  }

  // Créer un nouveau QR code
  createQRCode(qrCodeData: Omit<QRCodeData, 'id' | 'createdAt'>): QRCodeData {
    const id = this.generateId();
    const createdAt = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO qrcodes (id, orderId, orderNumber, customerEmail, qrCodeData, status, createdAt, validatedAt, usedAt, validatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      qrCodeData.orderId,
      qrCodeData.orderNumber,
      qrCodeData.customerEmail,
      qrCodeData.qrCodeData,
      qrCodeData.status,
      createdAt,
      qrCodeData.validatedAt || null,
      qrCodeData.usedAt || null,
      qrCodeData.validatedBy || null
    );

    return this.getQRCodeById(id)!;
  }

  // Mettre à jour un QR code
  updateQRCode(id: string, updates: Partial<QRCodeData>): QRCodeData | null {
    const current = this.getQRCodeById(id);
    if (!current) return null;

    const updated = { ...current, ...updates };
    
    const stmt = this.db.prepare(`
      UPDATE qrcodes 
      SET orderId = ?, orderNumber = ?, customerEmail = ?, qrCodeData = ?, 
          status = ?, validatedAt = ?, usedAt = ?, validatedBy = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.orderId,
      updated.orderNumber,
      updated.customerEmail,
      updated.qrCodeData,
      updated.status,
      updated.validatedAt || null,
      updated.usedAt || null,
      updated.validatedBy || null,
      id
    );

    return this.getQRCodeById(id);
  }

  // Valider un QR code
  validateQRCode(id: string, validatedBy: string, notes?: string): boolean {
    const qrCode = this.getQRCodeById(id);
    if (!qrCode || qrCode.status !== 'pending') {
      return false;
    }

    const validatedAt = new Date().toISOString();
    
    // Mettre à jour le QR code
    const updated = this.updateQRCode(id, {
      status: 'validated',
      validatedAt,
      validatedBy
    });

    if (updated) {
      // Enregistrer la validation
      const validationId = this.generateId();
      const stmt = this.db.prepare(`
        INSERT INTO validations (id, qrCodeId, validatedBy, validatedAt, notes)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(validationId, id, validatedBy, validatedAt, notes || null);
      return true;
    }

    return false;
  }

  // Marquer un QR code comme utilisé
  markQRCodeAsUsed(id: string): boolean {
    const qrCode = this.getQRCodeById(id);
    if (!qrCode || qrCode.status !== 'validated') {
      return false;
    }

    const usedAt = new Date().toISOString();
    const updated = this.updateQRCode(id, {
      status: 'used',
      usedAt
    });

    return !!updated;
  }

  // Lire toutes les validations
  getValidations(): QRCodeValidation[] {
    const stmt = this.db.prepare('SELECT * FROM validations ORDER BY validatedAt DESC');
    return stmt.all() as QRCodeValidation[];
  }

  // Obtenir les statistiques
  getStats() {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM qrcodes');
    const pendingStmt = this.db.prepare("SELECT COUNT(*) as count FROM qrcodes WHERE status = 'pending'");
    const validatedStmt = this.db.prepare("SELECT COUNT(*) as count FROM qrcodes WHERE status = 'validated'");
    const usedStmt = this.db.prepare("SELECT COUNT(*) as count FROM qrcodes WHERE status = 'used'");
    const expiredStmt = this.db.prepare("SELECT COUNT(*) as count FROM qrcodes WHERE status = 'expired'");
    const validationsStmt = this.db.prepare('SELECT COUNT(*) as count FROM validations');

    return {
      total: (totalStmt.get() as { count: number }).count,
      pending: (pendingStmt.get() as { count: number }).count,
      validated: (validatedStmt.get() as { count: number }).count,
      used: (usedStmt.get() as { count: number }).count,
      expired: (expiredStmt.get() as { count: number }).count,
      totalValidations: (validationsStmt.get() as { count: number }).count
    };
  }

  // Recherche avancée
  searchQRCodes(filters: {
    status?: string;
    customerEmail?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    let query = 'SELECT * FROM qrcodes WHERE 1=1';
    const params: any[] = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.customerEmail) {
      query += ' AND customerEmail LIKE ?';
      params.push(`%${filters.customerEmail}%`);
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
    return stmt.all(...params) as QRCodeData[];
  }

  // Migration depuis JSON
  migrateFromJSON(jsonData: any[], validationsData: any[]) {
    console.log('🔄 Migration des données JSON vers SQLite...');
    
    const insertQRCode = this.db.prepare(`
      INSERT OR REPLACE INTO qrcodes (id, orderId, orderNumber, customerEmail, qrCodeData, status, createdAt, validatedAt, usedAt, validatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertValidation = this.db.prepare(`
      INSERT OR REPLACE INTO validations (id, qrCodeId, validatedBy, validatedAt, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Migration des QR codes
    for (const qr of jsonData) {
      insertQRCode.run(
        qr.id,
        qr.orderId,
        qr.orderNumber,
        qr.customerEmail,
        qr.qrCodeData,
        qr.status,
        qr.createdAt,
        qr.validatedAt || null,
        qr.usedAt || null,
        qr.validatedBy || null
      );
    }

    // Migration des validations
    for (const validation of validationsData) {
      insertValidation.run(
        validation.id,
        validation.qrCodeId,
        validation.validatedBy,
        validation.validatedAt,
        validation.notes || null
      );
    }

    console.log(`✅ Migration terminée : ${jsonData.length} QR codes, ${validationsData.length} validations`);
  }

  // Fermer la connexion
  close() {
    this.db.close();
  }

  // Générer un ID unique
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const sqliteDatabase = new SQLiteDatabase();
