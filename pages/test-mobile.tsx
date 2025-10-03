import React, { useState } from 'react';

export default function TestMobile() {
  const [orderNumber, setOrderNumber] = useState('1381');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateTickets = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ticket/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData: {
            id: 7031251599700,
            order_number: parseInt(orderNumber),
            total_price: '95.00',
            currency: 'EUR',
            customer: {
              email: 'test@example.com',
              first_name: 'Test',
              last_name: 'User'
            },
            line_items: [
              {
                title: "🎫 MR NJP Event's VIP PASS",
                quantity: 3,
                price: '30.00'
              },
              {
                title: "🎫 MR NJP Event's STANDARD PASS",
                quantity: 2,
                price: '20.00'
              },
              {
                title: 'Service charges',
                quantity: 1,
                price: '5.00'
              }
            ],
            billing_address: {
              first_name: 'Test',
              last_name: 'User',
              address1: '123 Test Street',
              city: 'Test City',
              zip: '12345',
              country: 'France'
            },
            financial_status: 'paid',
            created_at: '2025-10-03T15:00:13+02:00'
          }
        }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setResult({ success: false, error: 'Erreur lors de la génération' });
    } finally {
      setLoading(false);
    }
  };

  const copyTicketId = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId).then(() => {
      alert('ID copié dans le presse-papiers !');
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📱 Test Mobile - Génération de Tickets</h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>Configuration du test</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Numéro de commande :
          </label>
          <input
            type="number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '200px'
            }}
          />
        </div>
        
        <button
          onClick={generateTickets}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Génération...' : 'Générer Tickets'}
        </button>
      </div>

      {result && (
        <div style={{ 
          background: result.success ? '#d4edda' : '#f8d7da', 
          padding: '15px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: result.success ? '#155724' : '#721c24' }}>
            {result.success ? '✅ Succès' : '❌ Erreur'}
          </h4>
          <pre style={{ margin: 0, fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {tickets.length > 0 && (
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3>🎫 Tickets générés ({tickets.length} ticket{tickets.length > 1 ? 's' : ''})</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Utilisez ces tickets pour tester l'interface mobile. Chaque ticket a un ID unique visible.
          </p>
          
          <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
            {tickets.map((ticket, index) => (
              <div key={ticket.id} style={{
                border: '2px solid #8B4513',
                borderRadius: '12px',
                padding: '20px',
                background: 'linear-gradient(135deg, #FFF8E1 0%, #FDF8ED 100%)',
                boxShadow: '0 4px 8px rgba(139, 69, 19, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ 
                    background: '#8B4513', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '30px', 
                    height: '30px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '10px',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#8B4513', fontSize: '16px' }}>
                      {ticket.ticketTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      ID: {ticket.ticketId}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <img 
                    src={ticket.qrCodeData} 
                    alt={`QR Code Ticket ${index + 1}`}
                    style={{ 
                      width: '120px', 
                      height: '120px',
                      border: '2px solid #8B4513',
                      borderRadius: '8px',
                      background: 'white',
                      padding: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div>
                
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  marginBottom: '15px',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>📋 ID du ticket :</div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    background: 'white', 
                    padding: '5px', 
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    wordBreak: 'break-all'
                  }}>
                    {ticket.ticketId}
                  </div>
                  <button
                    onClick={() => copyTicketId(ticket.ticketId)}
                    style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    📋 Copier l'ID
                  </button>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <a
                    href={`/mobile-simple`}
                    style={{
                      padding: '6px 12px',
                      background: '#6f42c1',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    📱 Tester sur mobile
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        background: '#e8f4fd', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>📱 Instructions pour le test mobile :</h3>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Générez des tickets avec le bouton ci-dessus</li>
          <li>Copiez l'ID d'un ticket (bouton "Copier l'ID")</li>
          <li>Ouvrez <code>/mobile-simple</code> sur votre téléphone</li>
          <li>Collez l'ID dans le champ de recherche</li>
          <li>Testez la validation et le marquage comme utilisé</li>
        </ol>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #ffeaa7'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>🔗 Liens utiles :</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><a href="/mobile-simple" style={{ color: '#6f42c1' }}>📱 Interface Mobile Simple</a></li>
          <li><a href="/mobile-scanner" style={{ color: '#6f42c1' }}>📷 Scanner avec Caméra</a></li>
          <li><a href="/admin/qr-codes" style={{ color: '#28a745' }}>👨‍💼 Interface Admin</a></li>
        </ul>
      </div>
    </div>
  );
}
