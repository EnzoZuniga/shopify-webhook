import { useState, useEffect } from 'react';

export default function Home() {
  const [qrCodes, setQrCodes] = useState<string[]>([]);

  useEffect(() => {
    // Fonction pour lister les QR codes générés
    const fetchQrCodes = async () => {
      try {
        const response = await fetch('/api/qr-codes');
        if (response.ok) {
          const data = await response.json();
          setQrCodes(data.qrCodes || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des QR codes:', error);
      }
    };

    fetchQrCodes();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 Générateur de QR Codes Shopify</h1>
      <p>Votre webhook est configuré pour générer automatiquement des QR codes quand une commande est payée.</p>
      
      <h2>QR Codes générés :</h2>
      {qrCodes.length === 0 ? (
        <p>Aucun QR code généré pour le moment.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {qrCodes.map((qrCode, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
              <img 
                src={qrCode} 
                alt={`QR Code ${index + 1}`}
                style={{ width: '100%', height: 'auto' }}
              />
              <p style={{ fontSize: '12px', marginTop: '10px' }}>
                {qrCode.split('/').pop()}
              </p>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📋 Instructions :</h3>
        <ol>
          <li>Configurez votre webhook Shopify pour pointer vers : <code>/api/shopify/webhook</code></li>
          <li>Assurez-vous que votre variable d'environnement <code>SHOPIFY_SECRET</code> est configurée</li>
          <li>Testez avec une commande payée - un QR code sera automatiquement généré</li>
        </ol>
      </div>
    </div>
  );
} 