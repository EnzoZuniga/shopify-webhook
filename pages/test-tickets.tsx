import React, { useState } from 'react';

export default function TestTickets() {
  const [orderNumber, setOrderNumber] = useState('1380');
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
            id: 7031251599699,
            order_number: parseInt(orderNumber),
            total_price: '78.00',
            currency: 'EUR',
            customer: {
              email: 'enzo.zuniga.pro@gmail.com',
              first_name: 'Enzo',
              last_name: 'Zuniga'
            },
            line_items: [
              {
                title: "🎫 MR NJP Event's VIP PASS",
                quantity: 2,
                price: '35.00'
              },
              {
                title: "🎫 MR NJP Event's STANDARD PASS",
                quantity: 1,
                price: '25.00'
              },
              {
                title: 'Service charges',
                quantity: 1,
                price: '8.00'
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
            created_at: '2025-10-03T14:30:13+02:00'
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

  const validateTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/ticket/validate/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validatedBy: 'Test Admin',
          notes: 'Test de validation ticket'
        }),
      });

      const data = await response.json();
      alert(data.success ? `Ticket ${ticketId} validé !` : `Erreur: ${data.error}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation');
    }
  };

  const markAsUsed = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/ticket/validate/${ticketId}`, {
        method: 'PUT',
      });

      const data = await response.json();
      alert(data.success ? `Ticket ${ticketId} marqué comme utilisé !` : `Erreur: ${data.error}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du marquage');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🎫 Test de génération de Tickets individuels</h1>
      
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
                  display: 'flex', 
                  gap: '8px', 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => validateTicket(ticket.ticketId)}
                    style={{
                      padding: '6px 12px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => markAsUsed(ticket.ticketId)}
                    style={{
                      padding: '6px 12px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Marquer utilisé
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #ffeaa7'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>📋 Instructions de test :</h4>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Modifiez le numéro de commande si nécessaire</li>
          <li>Cliquez sur "Générer Tickets" pour créer des tickets individuels</li>
          <li>Chaque ticket aura son propre QR code unique</li>
          <li>Testez la validation et l'utilisation de chaque ticket</li>
          <li>Consultez l'API <code>/api/ticket/stats</code> pour voir tous les tickets</li>
        </ol>
      </div>
    </div>
  );
}
