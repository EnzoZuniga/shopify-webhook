import { NextApiRequest, NextApiResponse } from 'next';

// Service de tickets avec Supabase
import { ticketServiceSupabase } from '../../../../lib/ticket-service-supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ticketId } = req.query;

  if (!ticketId || typeof ticketId !== 'string') {
    return res.status(400).json({ error: 'ID de ticket manquant' });
  }

  try {
    if (req.method === 'GET') {
      // Afficher les informations du ticket
      const ticketInfo = await ticketServiceSupabase.getTicketInfo(ticketId);
      
      if (!ticketInfo) {
        return res.status(404).json({ error: 'Ticket non trouvé' });
      }

      return res.status(200).json({
        success: true,
        ticket: {
          id: ticketInfo.id,
          ticketId: ticketInfo.ticketId,
          orderNumber: ticketInfo.orderNumber,
          customerEmail: ticketInfo.customerEmail,
          ticketTitle: ticketInfo.ticketTitle,
          status: ticketInfo.status,
          createdAt: ticketInfo.createdAt,
          validatedAt: ticketInfo.validatedAt,
          usedAt: ticketInfo.usedAt,
          validatedBy: ticketInfo.validatedBy
        }
      });

    } else if (req.method === 'POST') {
      // Valider le ticket
      const { validatedBy, notes } = req.body;

      if (!validatedBy) {
        return res.status(400).json({ error: 'Validateur manquant' });
      }

      const success = await ticketServiceSupabase.validateTicket(ticketId, validatedBy, notes);

      if (success) {
        return res.status(200).json({
          success: true,
          message: `Ticket validé avec succès: ${ticketId}`
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Impossible de valider le ticket'
        });
      }

    } else if (req.method === 'PUT') {
      // Marquer comme utilisé
      const success = await ticketServiceSupabase.markTicketAsUsed(ticketId);

      if (success) {
        return res.status(200).json({
          success: true,
          message: `Ticket marqué comme utilisé: ${ticketId}`
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Impossible de marquer le ticket comme utilisé'
        });
      }

    } else {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la gestion du ticket:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
