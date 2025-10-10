import React, { useState } from 'react';

interface TicketInfo {
  id: string;
  ticketId: string;
  orderNumber: number;
  customerEmail: string;
  ticketTitle: string;
  status: string;
  createdAt: string;
  validatedAt?: string;
  usedAt?: string;
  validatedBy?: string;
}

export default function MobileSimple() {
  const [ticketId, setTicketId] = useState('');
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validatedBy, setValidatedBy] = useState('');
  const [notes, setNotes] = useState('');

  const handleTicketIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) {
      setError('Veuillez saisir un ID de ticket');
      return;
    }

    setLoading(true);
    setError(null);
    setTicketInfo(null);
    
    try {
      const response = await fetch(`/api/ticket/validate/${ticketId.trim()}`);
      const result = await response.json();
      
      if (result.success) {
        setTicketInfo(result.ticket);
      } else {
        setError('Ticket non trouvé ou invalide');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du ticket:', error);
      setError('Erreur lors de la récupération des informations du ticket');
    } finally {
      setLoading(false);
    }
  };

  const validateTicket = async () => {
    if (!ticketInfo || !validatedBy.trim()) {
      setError('Veuillez saisir votre nom');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ticket/validate/${ticketInfo.ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validatedBy: validatedBy.trim(),
          notes: notes.trim() || undefined
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(`Ticket validé avec succès par ${validatedBy}`);
        setValidatedBy('');
        setNotes('');
        // Recharger les informations du ticket
        const refreshResponse = await fetch(`/api/ticket/validate/${ticketInfo.ticketId}`);
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setTicketInfo(refreshResult.ticket);
        }
      } else {
        setError(result.error || 'Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setError('Erreur lors de la validation du ticket');
    } finally {
      setLoading(false);
    }
  };

  const markAsUsed = async () => {
    if (!ticketInfo) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ticket/validate/${ticketInfo.ticketId}`, {
        method: 'PUT',
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Ticket marqué comme utilisé');
        // Recharger les informations du ticket
        const refreshResponse = await fetch(`/api/ticket/validate/${ticketInfo.ticketId}`);
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setTicketInfo(refreshResult.ticket);
        }
      } else {
        setError(result.error || 'Erreur lors du marquage');
      }
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
      setError('Erreur lors du marquage du ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'validated': return '#10b981';
      case 'used': return '#6b7280';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'used': return 'Utilisé';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>📱 Validation Tickets</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>MR NJP Event's - Scanner manuel</p>
          
          {/* Scanner Buttons */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/mobile-scanner"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              📷 Scanner QR Code
            </a>
            <a
              href="/mobile-scanner-v2"
              style={{
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              📷 Scanner ZXing V2
            </a>
            <a
              href="/mobile-scanner-iphone"
              style={{
                background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              📱 Scanner iPhone
            </a>
          </div>
        </div>

        {/* Input Section */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '20px', 
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔍 Rechercher un ticket</h3>
          
          <form onSubmit={handleTicketIdSubmit}>
            <input
              type="text"
              placeholder="ID du ticket (ex: 1380_mrnjpeventsvip_1_abc123_def4)"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                marginBottom: '15px',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '⏳ Recherche...' : '🔍 Rechercher le ticket'}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <div>Chargement...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '20px',
            color: '#dc2626'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>❌ Erreur</div>
            <div>{error}</div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '20px',
            color: '#166534'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>✅ Succès</div>
            <div>{success}</div>
          </div>
        )}

        {/* Ticket Info */}
        {ticketInfo && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '20px', 
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🎫 Informations du ticket</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', color: '#8B4513', marginBottom: '5px', fontSize: '18px' }}>
                {ticketInfo.ticketTitle}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                ID: {ticketInfo.ticketId}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gap: '10px', 
              marginBottom: '20px',
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '14px' }}>
                <strong>📋 Commande:</strong> #{ticketInfo.orderNumber}
              </div>
              <div style={{ fontSize: '14px' }}>
                <strong>👤 Client:</strong> {ticketInfo.customerEmail}
              </div>
              <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <strong>📊 Statut:</strong> 
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: getStatusColor(ticketInfo.status),
                  marginLeft: '8px'
                }}>
                  {getStatusText(ticketInfo.status)}
                </span>
              </div>
            </div>

            {/* Actions */}
            {ticketInfo.status === 'pending' && (
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Votre nom *"
                  value={validatedBy}
                  onChange={(e) => setValidatedBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
                <textarea
                  placeholder="Notes (optionnel)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '16px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  onClick={validateTicket}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  ✅ Valider le ticket
                </button>
              </div>
            )}

            {ticketInfo.status === 'validated' && (
              <button
                onClick={markAsUsed}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: '100%',
                  opacity: loading ? 0.6 : 1
                }}
              >
                🎫 Marquer comme utilisé
              </button>
            )}

            {ticketInfo.validatedBy && (
              <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '15px',
                padding: '10px',
                background: '#f0f9ff',
                borderRadius: '6px',
                border: '1px solid #e0f2fe'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>✅ Validation</div>
                <div>Validé par: {ticketInfo.validatedBy}</div>
                {ticketInfo.validatedAt && (
                  <div>Le: {new Date(ticketInfo.validatedAt).toLocaleString('fr-FR')}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          borderRadius: '12px', 
          padding: '15px',
          color: '#333'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📋 Instructions :</h4>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Saisissez l'ID du ticket (visible sur le QR code)</li>
            <li>Cliquez sur "Rechercher le ticket"</li>
            <li>Validez ou marquez comme utilisé</li>
            <li>L'ID est affiché sous chaque QR code dans les emails</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
