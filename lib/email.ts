import { Resend } from 'resend';
import { 
  OrderData, 
  customerEmailTemplate, 
  customerEmailText, 
  adminEmailTemplate, 
  adminEmailText 
} from '../src/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(orderData: OrderData) {
  try {
    console.log("📧 Envoi d'email de confirmation pour la commande:", orderData.order_number);

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@lafabriqueducode.com',
      to: [orderData.customer.email],
      subject: `🎫 E-Ticket MR NJP Event's #${orderData.order_number}`,
      html: customerEmailTemplate(orderData),
      text: customerEmailText(orderData),
    });

    console.log("✅ Email envoyé avec succès:", result.data?.id);
    return { success: true, emailId: result.data?.id };

  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de confirmation:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendAdminNotificationEmail(orderData: OrderData) {
  try {
    console.log("📧 Envoi de notification admin pour la commande:", orderData.order_number);

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@lafabriqueducode.com',
      to: [process.env.ADMIN_EMAIL || 'admin@lafabriqueducode.com'],
      subject: `🛒 Nouvelle commande #${orderData.order_number} - ${orderData.total_price} ${orderData.currency}`,
      html: adminEmailTemplate(orderData),
      text: adminEmailText(orderData),
    });

    console.log("✅ Notification admin envoyée:", result.data?.id);
    return { success: true, emailId: result.data?.id };

  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de la notification admin:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}