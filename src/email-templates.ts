export interface OrderData {
  id: number;
  order_number: number;
  total_price: string;
  currency: string;
  customer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  line_items: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
  billing_address: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    zip: string;
    country: string;
  };
  financial_status: string;
  created_at: string;
}

export const emailStyles = `
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #5D4037; 
      background: #FDF8ED;
      margin: 0;
      padding: 20px;
    }
    .container { 
      max-width: 500px; 
      margin: 0 auto; 
      background: #FDF8ED;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .pixel-art {
      text-align: center;
      padding: 20px 0 10px 0;
      font-size: 24px;
    }
    .event-title {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      color: #5D4037;
      margin: 10px 0 30px 0;
    }
    .content {
      padding: 0 30px 30px 30px;
      background: #FDF8ED;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      color: #5D4037;
    }
    .ticket-info {
      background: #FFF8E1;
      border: 2px solid #8B4513;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .ticket-title {
      font-size: 18px;
      font-weight: bold;
      color: #8B4513;
      margin-bottom: 15px;
    }
    .ticket-details {
      font-size: 16px;
      line-height: 1.8;
      color: #5D4037;
    }
    .date-info {
      background: #FFD700;
      color: #8B4513;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      display: inline-block;
      margin: 10px 0;
    }
    .important {
      background: #FFE0B2;
      border-left: 4px solid #8B4513;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .important-title {
      font-weight: bold;
      color: #8B4513;
      margin-bottom: 8px;
    }
    .closing {
      text-align: center;
      margin: 30px 0 20px 0;
      font-size: 16px;
      color: #5D4037;
    }
    .signature {
      text-align: center;
      font-weight: bold;
      color: #8B4513;
      margin-bottom: 20px;
    }
    .arrow {
      text-align: center;
      font-size: 20px;
      color: #8B4513;
      margin: 20px 0;
    }
    .ticket-item {
      background: #FFF8E1;
      border: 1px solid #8B4513;
      border-radius: 6px;
      padding: 12px;
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ticket-name {
      font-weight: 600;
      color: #5D4037;
      font-size: 14px;
    }
    .ticket-price {
      font-weight: bold;
      color: #8B4513;
      font-size: 16px;
    }
    .total-section {
      background: #8B4513;
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .total-label {
      font-size: 14px;
      opacity: 0.9;
    }
    .total-amount {
      font-size: 20px;
      font-weight: bold;
      margin-top: 5px;
    }
  </style>
`;

export const customerEmailTemplate = (orderData: OrderData, tickets?: any[]) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>🎫 E-Ticket - MR NJP Event's</title>
    ${emailStyles}
  </head>
  <body>
    <div class="container">
      <div class="pixel-art">
        <img src="https://shopify-webhook-silk.vercel.app/assets/logo.png" alt="MR NJP Event's Logo" style="width: 60px; height: 60px; object-fit: contain;">
      </div>
      <div class="event-title">MR NJP Event's</div>
      
      <div class="content">
        <div class="greeting">Hi,</div>
        
        <div class="ticket-info">
          <div class="ticket-title">🎟️ Vos E-Tickets</div>
          <div class="ticket-details">
            Voici vos <strong>e-tickets</strong> pour l'événement <strong>MR NJP Event's</strong>.
          </div>
          <div class="date-info">
            Commande #${orderData.order_number} - ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}
          </div>
          ${tickets && tickets.length > 0 ? `
            <div style="margin: 20px 0;">
              <div style="font-weight: bold; margin-bottom: 15px; color: #8B4513; text-align: center;">
                🎫 Vos Tickets d'Entrée (${tickets.length} ticket${tickets.length > 1 ? 's' : ''})
              </div>
              ${tickets.map((ticket, index) => `
                <div style="
                  border: 2px solid #8B4513; 
                  border-radius: 12px; 
                  padding: 20px; 
                  margin: 15px 0; 
                  background: linear-gradient(135deg, #FFF8E1 0%, #FDF8ED 100%);
                  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.1);
                ">
                  <div style="text-align: center;">
                    <div style="font-weight: bold; color: #8B4513; margin-bottom: 10px; font-size: 16px;">
                      🎫 Ticket ${index + 1}: ${ticket.ticketTitle}
                    </div>
                    <div style="margin: 15px 0;">
                      <img src="${ticket.qrCodeData}" alt="QR Code Ticket ${index + 1}" style="
                        width: 120px; 
                        height: 120px; 
                        border: 2px solid #8B4513; 
                        border-radius: 8px; 
                        background: white; 
                        padding: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                      ">
                    </div>
                    <div style="font-size: 11px; color: #666; margin-top: 8px;">
                      ID: ${ticket.ticketId}
                    </div>
                    <div style="font-size: 12px; color: #8B4513; margin-top: 5px; font-weight: bold;">
                      Présentez ce QR code à l'entrée
                    </div>
                  </div>
                </div>
              `).join('')}
              <div style="
                background: #FFE0B2; 
                border-left: 4px solid #8B4513; 
                padding: 12px; 
                margin: 20px 0; 
                border-radius: 0 8px 8px 0;
                font-size: 13px;
                color: #5D4037;
              ">
                <strong>📱 Important :</strong> Chaque ticket a un QR code unique. 
                ${tickets.length > 1 ? 'Présentez le bon QR code pour chaque personne.' : 'Gardez ce ticket avec vous.'}
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="ticket-details">
          <strong>🎫 Tickets commandés :</strong><br><br>
          ${orderData.line_items.map(item => `
            <div class="ticket-item">
              <div class="ticket-name">${item.title} (x${item.quantity})</div>
              <div class="ticket-price">${item.price} ${orderData.currency}</div>
            </div>
          `).join('')}
          
          <div class="total-section">
            <div class="total-label">Total de votre commande</div>
            <div class="total-amount">${orderData.total_price} ${orderData.currency}</div>
          </div>
        </div>
        
        <div class="important">
          <div class="important-title">Important :</div>
          • Gardez ce ticket avec vous<br>
          • Présentez une pièce d'identité valide<br>
          • L'emplacement exact sera communiqué le jour de l'événement
        </div>
        
        <div class="closing">
          <strong>Préparez-vous pour un événement incroyable !</strong><br>
          À bientôt sur la piste de danse !
        </div>
        
        <div class="signature">
          Cheers,<br>
          MR NJP Event's
        </div>
        
        <div class="arrow">↓</div>
      </div>
    </div>
  </body>
  </html>
`;

export const adminEmailTemplate = (orderData: OrderData) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>🛒 Nouvelle commande - MR NJP Event's</title>
    ${emailStyles}
  </head>
  <body>
    <div class="container">
      <div class="pixel-art">
        <img src="https://shopify-webhook-silk.vercel.app/assets/logo.png" alt="MR NJP Event's Logo" style="width: 60px; height: 60px; object-fit: contain;">
      </div>
      <div class="event-title">🛒 Nouvelle commande</div>
      
      <div class="content">
        <div class="greeting">Bonjour,</div>
        
        <div class="ticket-info">
          <div class="ticket-title">📧 Notification Admin</div>
          <div class="ticket-details">
            Une nouvelle commande a été passée sur votre boutique MR NJP Event's.
          </div>
          <div class="date-info">
            Commande #${orderData.order_number} - ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}
          </div>
        </div>
        
        <div class="ticket-details">
          <strong>👤 Client :</strong><br>
          ${orderData.customer.first_name} ${orderData.customer.last_name}<br>
          ${orderData.customer.email}<br><br>
          
          <strong>🎫 Tickets commandés :</strong><br><br>
          ${orderData.line_items.map(item => `
            <div class="ticket-item">
              <div class="ticket-name">${item.title} (x${item.quantity})</div>
              <div class="ticket-price">${item.price} ${orderData.currency}</div>
            </div>
          `).join('')}
          
          <div class="total-section">
            <div class="total-label">Total de la commande</div>
            <div class="total-amount">${orderData.total_price} ${orderData.currency}</div>
          </div>
        </div>
        
        <div class="important">
          <div class="important-title">📍 Adresse de facturation :</div>
          ${orderData.billing_address.first_name} ${orderData.billing_address.last_name}<br>
          ${orderData.billing_address.address1}<br>
          ${orderData.billing_address.zip} ${orderData.billing_address.city}<br>
          ${orderData.billing_address.country}
        </div>
        
        <div class="closing">
          <strong>Vérifiez les détails dans votre admin Shopify.</strong>
        </div>
        
        <div class="signature">
          MR NJP Event's Admin
        </div>
      </div>
    </div>
  </body>
  </html>
`;

export const customerEmailText = (orderData: OrderData) => `
  E-Ticket MR NJP Event's

  Hi,

  Voici votre e-ticket pour l'événement MR NJP Event's.

  Commande #${orderData.order_number} - ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}

  Tickets commandés :
  ${orderData.line_items.map(item => `${item.title} (x${item.quantity}) - ${item.price} ${orderData.currency}`).join('\n')}

  Total : ${orderData.total_price} ${orderData.currency}

  Important :
  • Gardez ce ticket avec vous
  • Présentez une pièce d'identité valide
  • L'emplacement exact sera communiqué le jour de l'événement

  Préparez-vous pour un événement incroyable !
  À bientôt sur la piste de danse !

  Cheers,
  MR NJP Event's
`;

export const adminEmailText = (orderData: OrderData) => `
  Nouvelle commande MR NJP Event's

  Bonjour,

  Une nouvelle commande a été passée sur votre boutique MR NJP Event's.

  Commande #${orderData.order_number} - ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}

  Client :
  ${orderData.customer.first_name} ${orderData.customer.last_name}
  ${orderData.customer.email}

  Tickets commandés :
  ${orderData.line_items.map(item => `${item.title} (x${item.quantity}) - ${item.price} ${orderData.currency}`).join('\n')}

  Total : ${orderData.total_price} ${orderData.currency}

  Adresse de facturation :
  ${orderData.billing_address.first_name} ${orderData.billing_address.last_name}
  ${orderData.billing_address.address1}
  ${orderData.billing_address.zip} ${orderData.billing_address.city}
  ${orderData.billing_address.country}

  Vérifiez les détails dans votre admin Shopify.

  MR NJP Event's Admin
`;
