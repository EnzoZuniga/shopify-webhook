import { NextApiRequest, NextApiResponse } from 'next';
import { ticketService } from '../../../lib/ticket-service';
import { OrderData } from '../../src/email-templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { orderData }: { orderData: OrderData } = req.body;

    if (!orderData || !orderData.order_number) {
      return res.status(400).json({ error: 'Données de commande manquantes' });
    }

    // Générer les tickets pour cette commande
    const tickets = await ticketService.generateTicketsForOrder({
      orderId: orderData.id,
      orderNumber: orderData.order_number,
      customerEmail: orderData.customer.email,
      lineItems: orderData.line_items,
      currency: orderData.currency,
      size: 200,
      margin: 2,
      color: {
        dark: '#8B4513',
        light: '#FDF8ED'
      }
    });

    console.log(`✅ ${tickets.length} tickets générés pour la commande #${orderData.order_number}`);

    return res.status(200).json({
      success: true,
      ticketsCount: tickets.length,
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        ticketId: ticket.ticketId,
        ticketTitle: ticket.ticketTitle,
        qrCodeData: ticket.qrCodeData,
        status: ticket.status,
        validationUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ticket/validate/${ticket.ticketId}`
      }))
    });

  } catch (error) {
    console.error('❌ Erreur lors de la génération des tickets:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la génération des tickets',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
