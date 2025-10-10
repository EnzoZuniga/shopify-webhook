import { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';
import { supabaseDatabase } from '../../../lib/database-supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ticketId } = req.query;

  if (!ticketId || typeof ticketId !== 'string') {
    return res.status(400).json({ error: 'Ticket ID manquant' });
  }

  try {
    // Récupérer le ticket depuis la base de données
    const ticket = await supabaseDatabase.getTicketByTicketId(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket non trouvé' });
    }

    // Générer l'URL de validation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const validationUrl = `${baseUrl}/api/ticket/validate/${ticketId}`;

    // Générer le QR code en PNG
    const qrCodeBuffer = await QRCode.toBuffer(validationUrl, {
      width: 300,
      margin: 3,
      color: {
        dark: '#8B4513',
        light: '#FDF8ED'
      },
      errorCorrectionLevel: 'M'
    });

    // Définir les headers pour l'image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
    res.setHeader('Content-Length', qrCodeBuffer.length);

    // Envoyer l'image
    res.send(qrCodeBuffer);

  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du QR code' });
  }
}
