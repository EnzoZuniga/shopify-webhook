-- Script de configuration Supabase pour MR NJP Event's
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des tickets
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  orderId INTEGER NOT NULL,
  orderNumber INTEGER NOT NULL,
  ticketId TEXT UNIQUE NOT NULL,
  customerEmail TEXT NOT NULL,
  ticketTitle TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price TEXT NOT NULL,
  currency TEXT NOT NULL,
  qrCodeData TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'used', 'expired')),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validatedAt TIMESTAMP WITH TIME ZONE,
  usedAt TIMESTAMP WITH TIME ZONE,
  validatedBy TEXT
);

-- Table des validations
CREATE TABLE IF NOT EXISTS ticket_validations (
  id TEXT PRIMARY KEY,
  ticketId TEXT NOT NULL,
  validatedBy TEXT NOT NULL,
  validatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_tickets_ticketId ON tickets(ticketId);
CREATE INDEX IF NOT EXISTS idx_tickets_orderNumber ON tickets(orderNumber);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_customerEmail ON tickets(customerEmail);
CREATE INDEX IF NOT EXISTS idx_tickets_createdAt ON tickets(createdAt);
CREATE INDEX IF NOT EXISTS idx_validations_ticketId ON ticket_validations(ticketId);
CREATE INDEX IF NOT EXISTS idx_validations_validatedAt ON ticket_validations(validatedAt);

-- RLS (Row Level Security) - Sécurité au niveau des lignes
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_validations ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité pour permettre l'accès public aux API
CREATE POLICY IF NOT EXISTS "Allow public access to tickets" 
  ON tickets FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow public access to validations" 
  ON ticket_validations FOR ALL USING (true);

-- Vue pour les statistiques
CREATE OR REPLACE VIEW ticket_stats AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'validated') as validated,
  COUNT(*) FILTER (WHERE status = 'used') as used,
  COUNT(*) FILTER (WHERE status = 'expired') as expired,
  (SELECT COUNT(*) FROM ticket_validations) as totalValidations
FROM tickets;

-- Fonction pour nettoyer les anciens tickets (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_tickets()
RETURNS void AS $$
BEGIN
  -- Supprimer les tickets expirés de plus de 30 jours
  DELETE FROM tickets 
  WHERE status = 'expired' 
  AND createdAt < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour la documentation
COMMENT ON TABLE tickets IS 'Table principale des tickets avec QR codes';
COMMENT ON TABLE ticket_validations IS 'Historique des validations des tickets';
COMMENT ON COLUMN tickets.status IS 'Statut du ticket: pending, validated, used, expired';
COMMENT ON COLUMN tickets.qrCodeData IS 'QR code en base64 pour la validation';
COMMENT ON COLUMN ticket_validations.validatedBy IS 'Nom de la personne qui a validé le ticket';

-- Données de test (optionnel)
-- INSERT INTO tickets (id, orderId, orderNumber, ticketId, customerEmail, ticketTitle, quantity, price, currency, qrCodeData, status) VALUES
-- ('test-1', 123, 1380, '1380_test_1', 'test@example.com', 'Test Ticket', 1, '25.00', 'EUR', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'pending');

-- Vérification de la configuration
SELECT 
  'Configuration Supabase terminée' as status,
  COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tickets', 'ticket_validations');
