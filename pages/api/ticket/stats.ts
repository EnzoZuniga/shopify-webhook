import { NextApiRequest, NextApiResponse } from 'next';

// Utiliser le service approprié selon l'environnement
let ticketService: any;
if (process.env.VERCEL) {
  const { ticketServiceVercel } = require('../../../lib/ticket-service-vercel');
  ticketService = ticketServiceVercel;
} else {
  const { ticketService: localTicketService } = require('../../../lib/ticket-service');
  ticketService = localTicketService;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const stats = ticketService.getStats();
    const allTickets = ticketService.getAllTickets();

    return res.status(200).json({
      success: true,
      stats,
      tickets: allTickets.map((ticket: any) => ({
        id: ticket.id,
        ticketId: ticket.ticketId,
        orderNumber: ticket.orderNumber,
        customerEmail: ticket.customerEmail,
        ticketTitle: ticket.ticketTitle,
        status: ticket.status,
        createdAt: ticket.createdAt,
        validatedAt: ticket.validatedAt,
        usedAt: ticket.usedAt,
        validatedBy: ticket.validatedBy
      }))
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
