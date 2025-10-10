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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #2D3748; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 15px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .event-title {
      font-size: 28px;
      font-weight: bold;
      margin: 0 0 10px 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .event-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 30px;
      color: #2D3748;
      font-weight: 500;
    }
    .tickets-section {
      background: linear-gradient(135deg, #FFF8E1 0%, #FDF8ED 100%);
      border: 2px solid #8B4513;
      border-radius: 16px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    }
    .tickets-title {
      font-size: 24px;
      font-weight: bold;
      color: #8B4513;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .ticket-card {
      background: white;
      border: 2px solid #8B4513;
      border-radius: 12px;
      padding: 25px;
      margin: 20px 0;
      box-shadow: 0 8px 16px rgba(139, 69, 19, 0.1);
      position: relative;
      overflow: hidden;
    }
    .ticket-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8B4513, #A0522D, #8B4513);
    }
    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .ticket-name {
      font-size: 18px;
      font-weight: bold;
      color: #8B4513;
      margin: 0;
    }
    .ticket-number {
      background: #8B4513;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .qr-container {
      text-align: center;
      margin: 20px 0;
    }
    .qr-code {
      width: 150px;
      height: 150px;
      border: 3px solid #8B4513;
      border-radius: 12px;
      background: white;
      padding: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      margin: 0 auto;
    }
    .ticket-id {
      font-size: 11px;
      color: #666;
      margin-top: 10px;
      font-family: monospace;
      background: #f7f7f7;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .ticket-instructions {
      background: #FFE0B2;
      border-left: 4px solid #8B4513;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
      font-size: 14px;
      color: #5D4037;
    }
    .order-summary {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 25px;
      margin: 30px 0;
    }
    .order-title {
      font-size: 20px;
      font-weight: bold;
      color: #2D3748;
      margin-bottom: 20px;
      text-align: center;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .order-item:last-child {
      border-bottom: none;
    }
    .item-name {
      font-weight: 500;
      color: #2D3748;
    }
    .item-price {
      font-weight: bold;
      color: #8B4513;
    }
    .order-total {
      background: #8B4513;
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin-top: 20px;
    }
    .total-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .total-amount {
      font-size: 24px;
      font-weight: bold;
    }
    .important-info {
      background: linear-gradient(135deg, #FFE0B2 0%, #FFF3E0 100%);
      border: 2px solid #FF9800;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
    }
    .important-title {
      font-weight: bold;
      color: #E65100;
      margin-bottom: 15px;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .important-list {
      margin: 0;
      padding-left: 20px;
      color: #5D4037;
    }
    .important-list li {
      margin-bottom: 8px;
    }
    .footer {
      background: #2D3748;
      color: white;
      padding: 30px;
      text-align: center;
    }
    .footer-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .footer-text {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 20px;
    }
    .footer-signature {
      font-size: 18px;
      font-weight: bold;
      color: #8B4513;
    }
    .attachments-note {
      background: #E3F2FD;
      border: 1px solid #2196F3;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
      font-size: 14px;
      color: #1565C0;
    }
  </style>
`;

export const customerEmailTemplate = (orderData: OrderData, tickets?: any[], baseUrl?: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>🎫 Vos E-Tickets MR NJP Event's</title>
    ${emailStyles}
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <div class="logo">🎫</div>
        <h1 class="event-title">MR NJP Event's</h1>
        <p class="event-subtitle">Vos E-Tickets d'Entrée</p>
      </div>
      
      <!-- Content -->
      <div class="content">
        <div class="greeting">
          Salut ${orderData.customer.first_name || ''} ! 👋<br>
          Félicitations pour votre commande ! Voici vos tickets d'entrée pour l'événement.
        </div>
        
        <!-- Tickets Section -->
        <div class="tickets-section">
          <div class="tickets-title">
            🎫 Vos Tickets d'Entrée (${tickets?.length || 0} ticket${(tickets?.length || 0) > 1 ? 's' : ''})
          </div>
          
          ${tickets && tickets.length > 0 ? tickets.map((ticket, index) => `
            <div class="ticket-card">
              <div class="ticket-header">
                <h3 class="ticket-name">${ticket.ticketTitle}</h3>
                <span class="ticket-number">Ticket ${index + 1}</span>
              </div>
              
              <div class="qr-container">
                <img src="${baseUrl || 'http://localhost:3000'}/api/qr/${ticket.ticketId}" 
                     onerror="this.src='${ticket.qrCodeData}'" 
                     alt="QR Code Ticket ${index + 1}" 
                     class="qr-code">
                <div class="ticket-id">ID: ${ticket.ticketId}</div>
              </div>
              
              <div class="ticket-instructions">
                <strong>📱 Instructions :</strong> Présentez ce QR code à l'entrée de l'événement. 
                Chaque ticket est unique et ne peut être utilisé qu'une seule fois.
              </div>
            </div>
          `).join('') : ''}
          
          <div class="ticket-instructions">
            <strong>📱 Important :</strong> 
            ${tickets && tickets.length > 1 
              ? `Vous avez ${tickets.length} tickets. Chaque personne doit présenter son propre QR code à l'entrée.`
              : 'Gardez ce ticket avec vous et présentez-le à l\'entrée de l\'événement.'
            }
          </div>
        </div>
        
        <!-- Order Summary -->
        <div class="order-summary">
          <h3 class="order-title">📋 Résumé de votre commande</h3>
          <div class="date-info" style="text-align: center; margin-bottom: 20px; background: #8B4513; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block;">
            Commande #${orderData.order_number} - ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}
          </div>
          
          ${orderData.line_items.map(item => `
            <div class="order-item">
              <span class="item-name">${item.title} (x${item.quantity})</span>
              <span class="item-price">${item.price} ${orderData.currency}</span>
            </div>
          `).join('')}
          
          <div class="order-total">
            <div class="total-label">Total de votre commande</div>
            <div class="total-amount">${orderData.total_price} ${orderData.currency}</div>
          </div>
        </div>
        
        <!-- Attachments Note -->
        <div class="attachments-note">
          📎 <strong>Pièces jointes :</strong> Les QR codes sont également disponibles en pièces jointes pour sauvegarder sur votre téléphone.
        </div>
        
        <!-- Important Information -->
        <div class="important-info">
          <div class="important-title">
            ⚠️ Informations importantes
          </div>
          <ul class="important-list">
            <li>Gardez ce ticket avec vous à tout moment</li>
            <li>Présentez une pièce d'identité valide avec votre ticket</li>
            <li>L'emplacement exact sera communiqué 24h avant l'événement</li>
            <li>Arrivez 30 minutes avant le début de l'événement</li>
            <li>En cas de problème, contactez-nous avec votre numéro de commande</li>
          </ul>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div class="footer-title">Préparez-vous pour une soirée incroyable ! 🎉</div>
        <div class="footer-text">
          Nous avons hâte de vous voir sur la piste de danse !
        </div>
        <div class="footer-signature">
          Cheers,<br>
          L'équipe MR NJP Event's
        </div>
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

export const customerEmailText = (orderData: OrderData, tickets?: any[]) => `
🎫 VOS E-TICKETS MR NJP EVENT'S

Salut ${orderData.customer.first_name || ''} ! 👋

Félicitations pour votre commande ! Voici vos tickets d'entrée pour l'événement.

📋 RÉSUMÉ DE VOTRE COMMANDE
Commande #${orderData.order_number} - ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}

Tickets commandés :
${orderData.line_items.map(item => `${item.title} (x${item.quantity}) - ${item.price} ${orderData.currency}`).join('\n')}

Total : ${orderData.total_price} ${orderData.currency}

🎫 VOS TICKETS D'ENTRÉE (${tickets?.length || 0} ticket${(tickets?.length || 0) > 1 ? 's' : ''})
${tickets && tickets.length > 0 ? tickets.map((ticket, index) => `
Ticket ${index + 1}: ${ticket.ticketTitle}
ID: ${ticket.ticketId}
QR Code: Présentez ce code à l'entrée de l'événement
`).join('') : ''}

📎 PIÈCES JOINTES
Les QR codes sont également disponibles en pièces jointes pour sauvegarder sur votre téléphone.

⚠️ INFORMATIONS IMPORTANTES
• Gardez ce ticket avec vous à tout moment
• Présentez une pièce d'identité valide avec votre ticket
• L'emplacement exact sera communiqué 24h avant l'événement
• Arrivez 30 minutes avant le début de l'événement
• En cas de problème, contactez-nous avec votre numéro de commande

Préparez-vous pour une soirée incroyable ! 🎉
Nous avons hâte de vous voir sur la piste de danse !

Cheers,
L'équipe MR NJP Event's
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

