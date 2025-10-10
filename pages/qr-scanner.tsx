import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface TicketInfo {
  id: string;
  ticketId: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  isUsed: boolean;
  usedAt?: string;
  validatedBy?: string;
}

export default function QRScanner() {
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState<'fresh' | 'already-used' | 'just-used'>('fresh');
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Nettoyer le scanner au démontage
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    setError(null);
    setSuccess(null);
    setTicketInfo(null);
    setScannerActive(true);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedFormats: [Html5QrcodeSupportedFormats.QR_CODE],
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2,
      useBarCodeDetectorIfSupported: true,
    };

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    scannerRef.current.render(
      (decodedText, decodedResult) => {
        console.log('QR Code détecté:', decodedText);
        handleQRCodeDetected(decodedText);
      },
      (errorMessage) => {
        // Ignorer les erreurs de scan (trop fréquentes)
        if (!errorMessage.includes('No QR code found')) {
          console.log('Erreur de scan:', errorMessage);
        }
      }
    );
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    console.log('🎯 QR Code détecté:', qrData);
    
    // Arrêter le scanner
    stopScanner();
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Extraire l'ID du ticket
      let ticketId = qrData;
      
      // Si c'est une URL complète, extraire l'ID
      const urlMatch = qrData.match(/\/api\/ticket\/validate\/(.+)$/);
      if (urlMatch) {
        ticketId = urlMatch[1];
        console.log('📝 ID extrait de l\'URL:', ticketId);
      } else {
        console.log('📝 ID direct:', ticketId);
      }
      
      console.log('🔍 Validation du ticket:', ticketId);

      const response = await fetch(`/api/ticket/validate/${ticketId}`);
      const result = await response.json();

      if (result.success) {
        // Vérifier si le ticket a déjà été utilisé AVANT de le marquer comme utilisé
        if (result.ticket.isUsed) {
          setTicketInfo(result.ticket);
          setError('❌ Ce ticket a déjà été utilisé !');
          setSuccess(null);
          setTicketStatus('already-used');
          console.log('❌ Ticket déjà utilisé:', result.ticket);
          return;
        }
        
        // Afficher d'abord le ticket comme valide
        setTicketInfo(result.ticket);
        setSuccess('✅ Ticket validé avec succès !');
        setTicketStatus('fresh');
        console.log('✅ Ticket validé:', result.ticket);
        
        // Marquer automatiquement le ticket comme utilisé
        console.log('🔄 Marquage automatique du ticket comme utilisé...');
        await markTicketAsUsed(ticketId);
      } else {
        setError(result.error || 'Ticket invalide ou non trouvé');
        console.error('❌ Erreur validation:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setError('Erreur lors de la validation du ticket');
    } finally {
      setLoading(false);
    }
  };

  const markTicketAsUsed = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/ticket/validate/${ticketId}`, {
        method: 'PUT',
      });

      const result = await response.json();
      
      if (result.success) {
        // Mettre à jour les informations du ticket avec le statut "utilisé"
        setTicketInfo(result.ticket);
        setSuccess('✅ Ticket validé et marqué comme utilisé automatiquement !');
        setTicketStatus('just-used');
        console.log('✅ Ticket marqué comme utilisé:', result.ticket);
      } else {
        console.error('❌ Erreur lors du marquage automatique:', result.error);
        setError('Erreur lors du marquage automatique du ticket');
      }
    } catch (error) {
      console.error('Erreur lors du marquage automatique:', error);
      setError('Erreur lors du marquage automatique du ticket');
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
        setTicketInfo(result.ticket);
        setSuccess('✅ Ticket marqué comme utilisé');
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

  const resetScanner = () => {
    setTicketInfo(null);
    setError(null);
    setSuccess(null);
    setLoading(false);
    setTicketStatus('fresh');
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          margin: '0 0 20px 0', 
          color: '#333',
          fontSize: '28px'
        }}>
          📱 Scanner QR Code
        </h1>
        
        <div style={{ 
          background: '#f0f8ff', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #4a90e2',
          fontSize: '14px'
        }}>
          <strong>📋 Instructions :</strong>
          <br />1. Cliquez sur "Démarrer le Scanner"
          <br />2. Autorisez l'accès à la caméra
          <br />3. Pointez la caméra vers un QR code
          <br />4. Le ticket sera validé ET marqué comme utilisé automatiquement
          <br />
          <br /><strong>🎥 Fonctionnalités :</strong>
          <br />• Flash automatique si disponible
          <br />• Zoom pour améliorer la détection
          <br />• Support des QR codes de toutes tailles
          <br />• Marquage automatique comme utilisé
          <br />• Protection contre la réutilisation
        </div>

        {error && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '20px',
            color: '#dc2626',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ 
            background: '#f0f8ff', 
            border: '1px solid #4a90e2', 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '20px',
            color: '#4a90e2',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        {/* Scanner Section */}
        {!ticketInfo && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {!scannerActive ? (
                <button 
                  onClick={startScanner}
                  disabled={loading}
                  style={{
                    background: loading ? '#ccc' : '#4a90e2',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    marginRight: '10px'
                  }}
                >
                  {loading ? '⏳ Chargement...' : '🎥 Démarrer le Scanner'}
                </button>
              ) : (
                <button 
                  onClick={stopScanner}
                  style={{
                    background: '#e24a4a',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  🛑 Arrêter le Scanner
                </button>
              )}
            </div>

            {/* Zone du scanner */}
            <div 
              id="qr-reader"
              ref={scannerElementRef}
              style={{
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            />
          </div>
        )}

        {/* Ticket Info Section */}
        {ticketInfo && (
          <div style={{ 
            background: ticketInfo.isUsed ? '#fef2f2' : '#f0f8ff', 
            border: `1px solid ${ticketInfo.isUsed ? '#fecaca' : '#4a90e2'}`, 
            borderRadius: '12px', 
            padding: '20px', 
            marginTop: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: ticketStatus === 'already-used' ? '#dc2626' : '#4a90e2', 
              margin: '0 0 15px 0',
              fontSize: '24px'
            }}>
              {ticketStatus === 'already-used' ? '❌ Ticket Déjà Utilisé !' : 
               ticketStatus === 'just-used' ? '✅ Ticket Validé et Utilisé !' : 
               '✅ Ticket Validé et Utilisé !'}
            </h3>
            
            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '15px',
              fontSize: '14px',
              textAlign: 'left'
            }}>
              <p><strong>🎫 ID du Ticket:</strong> {ticketInfo.ticketId}</p>
              <p><strong>🎪 Événement:</strong> {ticketInfo.eventName}</p>
              <p><strong>👤 Client:</strong> {ticketInfo.customerName}</p>
              <p><strong>📧 Email:</strong> {ticketInfo.customerEmail}</p>
              <p><strong>📊 Statut:</strong> 
                <span style={{
                  color: ticketStatus === 'already-used' ? '#dc2626' : '#4a90e2',
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}>
                  {ticketStatus === 'already-used' ? '❌ Déjà utilisé' : 
                   ticketStatus === 'just-used' ? '✅ Validé et utilisé' : 
                   '✅ Validé et utilisé'}
                </span>
              </p>
              {ticketInfo.usedAt && (
                <p><strong>⏰ Utilisé le:</strong> {new Date(ticketInfo.usedAt).toLocaleString()}</p>
              )}
            </div>
            
            <div style={{ marginTop: '15px' }}>
              <button 
                onClick={resetScanner}
                style={{
                  background: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}
              >
                🔄 Scanner un autre ticket
              </button>
            </div>
          </div>
        )}

        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '20px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <strong>Status:</strong> {scannerActive ? '✅ Scanner actif' : '⏸️ Scanner arrêté'}
          <br />
          <strong>Bibliothèque:</strong> html5-qrcode (éprouvée et fiable)
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <a href="/mobile-simple" style={{ 
          color: '#4a90e2', 
          textDecoration: 'none',
          fontSize: '14px',
          padding: '8px 16px',
          border: '1px solid #4a90e2',
          borderRadius: '8px',
          display: 'inline-block',
          background: 'white',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          ← Retour à la saisie manuelle
        </a>
      </div>
    </div>
  );
}
