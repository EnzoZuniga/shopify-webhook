import React from 'react';

export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 Générateur de QR Codes Shopify</h1>
      <p>Votre webhook est configuré pour générer automatiquement des QR codes quand une commande est payée.</p>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📋 Instructions :</h3>
        <ol>
          <li>Configurez votre webhook Shopify pour pointer vers : <code>/api/shopify/webhook</code></li>
          <li>Assurez-vous que votre variable d'environnement <code>SHOPIFY_SECRET</code> est configurée</li>
          <li>Testez avec une commande payée - un QR code sera automatiquement généré</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h3>✅ Statut :</h3>
        <p>Webhook opérationnel et prêt à recevoir les commandes Shopify !</p>
      </div>
    </div>
  );
}