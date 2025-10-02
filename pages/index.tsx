import React, { useState } from 'react';

export default function Home() {
  const [testResult, setTestResult] = useState<string>("");

  const testWebhook = async () => {
    try {
      const response = await fetch("/api/shopify/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-shopify-topic": "orders/paid",
          "x-shopify-shop-domain": "test-shop.myshopify.com"
        },
        body: JSON.stringify({
          id: 12345,
          order_number: "1001",
          total_price: "29.99",
          customer: {
            email: "test@example.com"
          },
          line_items: [
            {
              title: "Produit Test",
              quantity: 1,
              price: "29.99"
            }
          ]
        })
      });

      const result = await response.json();
      setTestResult(`✅ Test réussi: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Erreur: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 Webhook Shopify - Tableau de bord</h1>
      <p>Votre webhook est configuré pour recevoir les commandes Shopify.</p>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📋 Configuration Shopify :</h3>
        <ol>
          <li>Allez dans <strong>Paramètres → Notifications</strong></li>
          <li>Créez un nouveau webhook avec :</li>
          <ul>
            <li><strong>URL</strong> : <code>https://votre-domaine.vercel.app/api/shopify/webhook</code></li>
            <li><strong>Événement</strong> : <code>orders/paid</code></li>
            <li><strong>Format</strong> : <code>JSON</code></li>
          </ul>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e8f4fd', borderRadius: '8px' }}>
        <h3>🧪 Test du webhook :</h3>
        <button 
          onClick={testWebhook}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          Tester le webhook
        </button>
        {testResult && (
          <pre style={{ 
            backgroundColor: "#f9f9f9", 
            padding: "10px", 
            borderRadius: "5px",
            overflow: "auto",
            fontSize: "12px"
          }}>
            {testResult}
          </pre>
        )}
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h3>✅ Statut :</h3>
        <p>Webhook opérationnel avec logs détaillés pour le debugging !</p>
        <p><strong>Vérifiez les logs dans Vercel Dashboard → Fonctions → Logs</strong></p>
      </div>
    </div>
  );
}