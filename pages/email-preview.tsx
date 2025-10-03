import React from 'react';
import { customerEmailTemplate, adminEmailTemplate } from '../src/email-templates';

// Fonction pour remplacer l'URL du logo en local
const replaceLogoUrl = (html: string) => {
  return html.replace(
    'https://shopify-webhook-silk.vercel.app/assets/logo.png',
    '/assets/logo.png'
  );
};

export default function EmailPreview() {
  // Données d'exemple basées sur votre dernière commande
  const orderData = {
    id: 7031251599698,
    order_number: 1378,
    total_price: '39.00',
    currency: 'EUR',
    customer: {
      email: 'enzo.zuniga.pro@gmail.com',
      first_name: 'Enzo',
      last_name: 'Zuniga'
    },
    line_items: [
      {
        title: "🎫 MR NJP Event's LATE PASS 🚨",
        quantity: 1,
        price: '35.00'
      },
      {
        title: 'Service charges 3',
        quantity: 1,
        price: '4.00'
      }
    ],
    billing_address: {
      first_name: 'Enzo',
      last_name: 'Zuniga',
      address1: '170 avenue Georges Seurat',
      city: 'Cuers',
      zip: '83390',
      country: 'France'
    },
    financial_status: 'paid',
    created_at: '2025-10-03T11:25:13+02:00'
  };

  const customerEmailHtml = replaceLogoUrl(customerEmailTemplate(orderData));
  const adminEmailHtml = replaceLogoUrl(adminEmailTemplate(orderData));

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📧 Aperçu de l'email de confirmation</h1>
      <p>Voici à quoi ressemble l'email envoyé automatiquement à vos clients :</p>
      
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        overflow: 'hidden',
        margin: '20px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '10px 20px', 
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold'
        }}>
          📧 Email de confirmation client
        </div>
        <div 
          style={{ 
            maxHeight: '600px', 
            overflow: 'auto',
            background: '#fff'
          }}
          dangerouslySetInnerHTML={{ __html: customerEmailHtml }}
        />
      </div>

      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        overflow: 'hidden',
        margin: '20px 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          background: '#e8f4fd', 
          padding: '10px 20px', 
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold'
        }}>
          📧 Email de notification admin
        </div>
        <div 
          style={{ 
            maxHeight: '600px', 
            overflow: 'auto',
            background: '#fff'
          }}
          dangerouslySetInnerHTML={{ __html: adminEmailHtml }}
        />
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#e8f4fd', 
        borderRadius: '8px' 
      }}>
        <h3>📊 Informations de la commande :</h3>
        <ul>
          <li><strong>Numéro :</strong> #{orderData.order_number}</li>
          <li><strong>Montant :</strong> {orderData.total_price} {orderData.currency}</li>
          <li><strong>Client :</strong> {orderData.customer.first_name} {orderData.customer.last_name}</li>
          <li><strong>Email :</strong> {orderData.customer.email}</li>
          <li><strong>Articles :</strong> {orderData.line_items.length} article(s)</li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#e8f5e8', 
        borderRadius: '8px' 
      }}>
        <h3>✅ Fonctionnalités de l'email :</h3>
        <ul>
          <li>🎨 <strong>Design responsive</strong> et professionnel</li>
          <li>📋 <strong>Détails complets</strong> de la commande</li>
          <li>🛍️ <strong>Liste des articles</strong> avec quantités et prix</li>
          <li>📍 <strong>Adresse de facturation</strong></li>
          <li>💰 <strong>Total et devise</strong></li>
          <li>📱 <strong>Compatible mobile</strong></li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '8px' 
      }}>
        <h3>🔧 Configuration actuelle :</h3>
        <p><strong>Service d'email :</strong> Resend</p>
        <p><strong>Domaine d'envoi :</strong> noreply@lafabriqueducode.com</p>
        <p><strong>Envoi automatique :</strong> ✅ Activé</p>
        <p><strong>Validation HMAC :</strong> ✅ Sécurisé</p>
      </div>
    </div>
  );
}
