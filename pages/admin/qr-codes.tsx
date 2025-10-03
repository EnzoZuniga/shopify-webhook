import React, { useState, useEffect } from 'react';

interface QRCodeData {
  id: string;
  orderNumber: number;
  customerEmail: string;
  status: 'pending' | 'validated' | 'used' | 'expired';
  createdAt: string;
  validatedAt?: string;
  usedAt?: string;
  validatedBy?: string;
}

interface Stats {
  total: number;
  pending: number;
  validated: number;
  used: number;
  expired: number;
  totalValidations: number;
}

export default function QRCodesAdmin() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeData | null>(null);
  const [validatedBy, setValidatedBy] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch('/api/qr/stats');
      const data = await response.json();
      
      if (data.success) {
        setQrCodes(data.qrCodes);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateQRCode = async (orderNumber: number) => {
    if (!validatedBy.trim()) {
      alert('Veuillez saisir votre nom');
      return;
    }

    try {
      const response = await fetch(`/api/qr/validate/${orderNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validatedBy: validatedBy.trim(),
          notes: notes.trim() || undefined
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`QR code validé avec succès pour la commande #${orderNumber}`);
        setValidatedBy('');
        setNotes('');
        setSelectedQRCode(null);
        fetchQRCodes();
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation du QR code');
    }
  };

  const markAsUsed = async (orderNumber: number) => {
    if (!confirm(`Marquer le QR code de la commande #${orderNumber} comme utilisé ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/qr/validate/${orderNumber}`, {
        method: 'PUT',
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`QR code marqué comme utilisé pour la commande #${orderNumber}`);
        fetchQRCodes();
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
      alert('Erreur lors du marquage du QR code');
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

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Chargement des QR codes...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔍 Gestion des QR Codes - MR NJP Event's</h1>
      
      {/* Statistiques */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>Total</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{stats.total}</div>
          </div>
          <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#92400e' }}>En attente</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706' }}>{stats.pending}</div>
          </div>
          <div style={{ background: '#d1fae5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#065f46' }}>Validés</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{stats.validated}</div>
          </div>
          <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>Utilisés</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>{stats.used}</div>
          </div>
        </div>
      )}

      {/* Liste des QR codes */}
      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ background: '#f8f9fa', padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, color: '#374151' }}>Liste des QR Codes</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Commande</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Client</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Statut</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Créé le</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Validé par</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qrCodes.map((qr) => (
                <tr key={qr.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>#{qr.orderNumber}</strong>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {qr.customerEmail}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getStatusColor(qr.status)
                    }}>
                      {getStatusText(qr.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {new Date(qr.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {qr.validatedBy || '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {qr.status === 'pending' && (
                        <button
                          onClick={() => setSelectedQRCode(qr)}
                          style={{
                            padding: '6px 12px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Valider
                        </button>
                      )}
                      {qr.status === 'validated' && (
                        <button
                          onClick={() => markAsUsed(qr.orderNumber)}
                          style={{
                            padding: '6px 12px',
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Marquer utilisé
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de validation */}
      {selectedQRCode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>
              Valider le QR Code - Commande #{selectedQRCode.orderNumber}
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Votre nom *
              </label>
              <input
                type="text"
                value={validatedBy}
                onChange={(e) => setValidatedBy(e.target.value)}
                placeholder="Nom du validateur"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes sur la validation..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedQRCode(null)}
                style={{
                  padding: '10px 20px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => validateQRCode(selectedQRCode.orderNumber)}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
