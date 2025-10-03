import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderData {
  id: number;
  order_number: number;
  total_price: string;
  currency: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
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

export async function sendOrderConfirmationEmail(orderData: OrderData) {
  try {
    console.log("📧 Envoi d'email de confirmation pour la commande:", orderData.order_number);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de commande</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .order-details { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #2c3e50; }
          .footer { margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Commande confirmée !</h1>
            <p>Bonjour ${orderData.customer.first_name},</p>
            <p>Votre commande <strong>#${orderData.order_number}</strong> a été confirmée et payée avec succès.</p>
          </div>
          
          <div class="order-details">
            <h2>📋 Détails de la commande</h2>
            <p><strong>Numéro de commande:</strong> #${orderData.order_number}</p>
            <p><strong>Date:</strong> ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}</p>
            <p><strong>Statut:</strong> ${orderData.financial_status === 'paid' ? '✅ Payé' : orderData.financial_status}</p>
            
            <h3>🛍️ Articles commandés</h3>
            ${orderData.line_items.map(item => `
              <div class="item">
                <span>${item.title} (x${item.quantity})</span>
                <span>${item.price} ${orderData.currency}</span>
              </div>
            `).join('')}
            
            <div class="total">
              <div class="item">
                <span>Total</span>
                <span>${orderData.total_price} ${orderData.currency}</span>
              </div>
            </div>
          </div>
          
          <div class="order-details">
            <h3>📍 Adresse de facturation</h3>
            <p>
              ${orderData.billing_address.first_name} ${orderData.billing_address.last_name}<br>
              ${orderData.billing_address.address1}<br>
              ${orderData.billing_address.zip} ${orderData.billing_address.city}<br>
              ${orderData.billing_address.country}
            </p>
          </div>
          
          <div class="footer">
            <p>Merci pour votre commande !</p>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
      Commande confirmée #${orderData.order_number}
      
      Bonjour ${orderData.customer.first_name},
      
      Votre commande a été confirmée et payée avec succès.
      
      Détails de la commande:
      - Numéro: #${orderData.order_number}
      - Date: ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}
      - Statut: ${orderData.financial_status === 'paid' ? 'Payé' : orderData.financial_status}
      
      Articles:
      ${orderData.line_items.map(item => `- ${item.title} (x${item.quantity}): ${item.price} ${orderData.currency}`).join('\n')}
      
      Total: ${orderData.total_price} ${orderData.currency}
      
      Adresse de facturation:
      ${orderData.billing_address.first_name} ${orderData.billing_address.last_name}
      ${orderData.billing_address.address1}
      ${orderData.billing_address.zip} ${orderData.billing_address.city}
      ${orderData.billing_address.country}
      
      Merci pour votre commande !
    `;

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@lafabriqueducode.com',
      to: [orderData.customer.email],
      subject: `🎉 Commande confirmée #${orderData.order_number}`,
      html: emailHtml,
      text: emailText,
    });

    console.log("✅ Email envoyé avec succès:", result.data?.id);
    return { success: true, emailId: result.data?.id };

  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

export async function sendAdminNotificationEmail(orderData: OrderData) {
  try {
    console.log("📧 Envoi de notification admin pour la commande:", orderData.order_number);

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nouvelle commande reçue</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .order-details { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #2c3e50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Nouvelle commande reçue</h1>
            <p>Une nouvelle commande a été passée et payée.</p>
          </div>
          
          <div class="order-details">
            <h2>📋 Détails de la commande</h2>
            <p><strong>Numéro:</strong> #${orderData.order_number}</p>
            <p><strong>Client:</strong> ${orderData.customer.first_name} ${orderData.customer.last_name}</p>
            <p><strong>Email:</strong> ${orderData.customer.email}</p>
            <p><strong>Montant:</strong> ${orderData.total_price} ${orderData.currency}</p>
            <p><strong>Date:</strong> ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}</p>
            
            <h3>🛍️ Articles</h3>
            ${orderData.line_items.map(item => `
              <div class="item">
                <span>${item.title} (x${item.quantity})</span>
                <span>${item.price} ${orderData.currency}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@lafabriqueducode.com',
      to: [process.env.ADMIN_EMAIL || 'admin@lafabriqueducode.com'],
      subject: `🛒 Nouvelle commande #${orderData.order_number} - ${orderData.total_price} ${orderData.currency}`,
      html: adminEmailHtml,
    });

    console.log("✅ Notification admin envoyée:", result.data?.id);
    return { success: true, emailId: result.data?.id };

  } catch (error) {
    console.error("❌ Erreur notification admin:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}
