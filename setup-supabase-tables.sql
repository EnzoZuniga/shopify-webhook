-- Script de création des tables pour Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer les tables existantes si elles existent (ATTENTION: cela supprime toutes les données)
DROP TABLE IF EXISTS ticket_validations CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;

-- Créer la table tickets
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id VARCHAR(255) UNIQUE NOT NULL,
  order_id BIGINT NOT NULL,
  order_number VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  ticket_title VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'EUR',
  qr_code_data TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  validated_by VARCHAR(255)
);

-- Créer la table ticket_validations
CREATE TABLE ticket_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id VARCHAR(255) NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_by VARCHAR(255),
  notes TEXT
);

-- Créer les index pour les performances
CREATE INDEX idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX idx_tickets_order_number ON tickets(order_number);
CREATE INDEX idx_tickets_customer_email ON tickets(customer_email);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

CREATE INDEX idx_ticket_validations_ticket_id ON ticket_validations(ticket_id);
CREATE INDEX idx_ticket_validations_validated_at ON ticket_validations(validated_at);

-- Activer Row Level Security (RLS) pour la sécurité
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_validations ENABLE ROW LEVEL SECURITY;

-- Créer des politiques de sécurité (optionnel - pour permettre l'accès public)
-- ATTENTION: Ces politiques permettent l'accès public aux tables
-- Vous pouvez les modifier selon vos besoins de sécurité

-- Politique pour la table tickets (lecture et écriture publiques)
CREATE POLICY "Allow public access to tickets" ON tickets
  FOR ALL USING (true) WITH CHECK (true);

-- Politique pour la table ticket_validations (lecture et écriture publiques)
CREATE POLICY "Allow public access to ticket_validations" ON ticket_validations
  FOR ALL USING (true) WITH CHECK (true);

-- Afficher un message de confirmation
SELECT 'Tables créées avec succès!' as message;
