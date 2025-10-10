import React, { useState, useRef, useEffect } from 'react';

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

export default function MobileScannerFinal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addDebugInfo = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'camera' as PermissionName })
          .then(permission => {
            setCameraPermission(permission.state);
            addDebugInfo(`Permission caméra: ${permission.state}`);
          })
          .catch(() => {
            setCameraPermission('unknown');
            addDebugInfo('Permission caméra: inconnue');
          });
      }
    }
  }, []);

  const startScanner = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo([]);
    addDebugInfo('Démarrage du scanner...');

    try {
      // Contraintes simples pour maximiser la compatibilité
      const constraints = {
        video: {
          facingMode: 'environment', // Caméra arrière
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      addDebugInfo('Demande d\'accès caméra...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      addDebugInfo('Stream obtenu avec succès');

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        videoRef.current.controls = false;
        
        // Attendre que la vidéo soit prête
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = () => {
            videoRef.current!.play().then(() => {
              addDebugInfo('Vidéo démarrée');
              setScannerActive(true);
              setCameraPermission('granted');
              resolve(true);
            });
          };
        });

        // Attendre que la vidéo soit stable
        await new Promise(resolve => setTimeout(resolve, 2000));
        addDebugInfo('Démarrage de la détection QR...');
        
        // Démarrer la détection
        startQRDetection();
      }

    } catch (err) {
      console.error('❌ Erreur caméra:', err);
      let errorMessage = 'Impossible de démarrer le scanner.';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = '❌ Permission caméra refusée. Autorisez l\'accès à la caméra.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = '❌ Aucune caméra trouvée.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = '❌ Votre navigateur ne supporte pas l\'accès à la caméra.';
        } else {
          errorMessage = `❌ Erreur: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      setCameraPermission('denied');
      addDebugInfo(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) {
      addDebugInfo('❌ Éléments vidéo/canvas non disponibles');
      return;
    }

    addDebugInfo('🎯 Détection QR démarrée');
    
    const detectQR = () => {
      if (!videoRef.current || !canvasRef.current || !scannerActive) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        return;
      }

      try {
        // Vérifier que la vidéo a des dimensions valides
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          if (scannerActive) {
            detectionIntervalRef.current = setTimeout(detectQR, 200);
          }
          return;
        }

        // Dessiner l'image de la vidéo sur le canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Obtenir les données d'image
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Détecter le QR code avec jsQR
        const jsQR = require('jsqr');
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          addDebugInfo(`🎯 QR Code détecté: ${code.data}`);
          handleQRCodeDetected(code.data);
          return;
        }
        
        // Continuer la détection
        if (scannerActive) {
          detectionIntervalRef.current = setTimeout(detectQR, 100);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la détection:', error);
        if (scannerActive) {
          detectionIntervalRef.current = setTimeout(detectQR, 200);
        }
      }
    };
    
    detectQR();
  };

  const stopScanner = () => {
    addDebugInfo('🛑 Arrêt du scanner');
    
    if (detectionIntervalRef.current) {
      clearTimeout(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScannerActive(false);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    addDebugInfo(`🎯 QR Code détecté: ${qrData}`);
    
    // Arrêter la détection
    if (detectionIntervalRef.current) {
      clearTimeout(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    stopScanner();
    
    setLoading(true);
    setError(null);

    try {
      // Extraire l'ID du ticket
      let ticketId = qrData;
      
      // Si c'est une URL complète, extraire l'ID
      const urlMatch = qrData.match(/\/api\/ticket\/validate\/(.+)$/);
      if (urlMatch) {
        ticketId = urlMatch[1];
        addDebugInfo(`📝 ID extrait de l'URL: ${ticketId}`);
      } else {
        addDebugInfo(`📝 ID direct: ${ticketId}`);
      }
      
      addDebugInfo(`🔍 Validation du ticket: ${ticketId}`);

      const response = await fetch(`/api/ticket/validate/${ticketId}`);
      const result = await response.json();

      if (result.success) {
        setTicketInfo(result.ticket);
        addDebugInfo('✅ Ticket validé avec succès');
      } else {
        setError(result.error || 'Ticket invalide');
        addDebugInfo(`❌ Erreur validation: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setError('Erreur lors de la validation du ticket');
      addDebugInfo(`❌ Erreur: ${error}`);
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
        setTicketInfo(result.ticket);
        addDebugInfo('✅ Ticket marqué comme utilisé');
      } else {
        setError(result.error || 'Erreur lors de la validation');
        addDebugInfo(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setError('Erreur lors de la validation du ticket');
      addDebugInfo(`❌ Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
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
        <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#333' }}>
          📱 Scanner QR Code - Version Finale
        </h2>
        
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
          <br />4. Le ticket sera validé automatiquement
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

        {cameraPermission === 'denied' && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '20px',
            color: '#dc2626',
            textAlign: 'center'
          }}>
            ❌ Permission caméra refusée. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.
          </div>
        )}

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
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              {loading ? '⏳ Démarrage...' : '🎥 Démarrer le Scanner'}
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

        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            borderRadius: '12px',
            background: '#000',
            display: scannerActive ? 'block' : 'none',
            margin: '0 auto'
          }}
        />

        {/* Canvas caché pour la détection QR */}
        <canvas 
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <div style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '8px',
            marginTop: '20px',
            fontSize: '12px'
          }}>
            <strong>🔧 Debug Info:</strong>
            {debugInfo.map((info, index) => (
              <div key={index} style={{ marginTop: '5px', color: '#666' }}>
                {info}
              </div>
            ))}
          </div>
        )}

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
              color: ticketInfo.isUsed ? '#dc2626' : '#4a90e2', 
              margin: '0 0 15px 0' 
            }}>
              {ticketInfo.isUsed ? '❌ Ticket Déjà Utilisé' : '✅ Ticket Validé !'}
            </h3>
            <div style={{ fontSize: '14px', color: '#333' }}>
              <p><strong>ID:</strong> {ticketInfo.ticketId}</p>
              <p><strong>Événement:</strong> {ticketInfo.eventName}</p>
              <p><strong>Client:</strong> {ticketInfo.customerName}</p>
              <p><strong>Email:</strong> {ticketInfo.customerEmail}</p>
              <p><strong>Statut:</strong> {ticketInfo.isUsed ? '❌ Déjà utilisé' : '✅ Valide'}</p>
              {ticketInfo.usedAt && (
                <p><strong>Utilisé le:</strong> {new Date(ticketInfo.usedAt).toLocaleString()}</p>
              )}
            </div>
            <div style={{ marginTop: '15px' }}>
              {!ticketInfo.isUsed && (
                <button 
                  onClick={markAsUsed}
                  disabled={loading}
                  style={{
                    background: '#e24a4a',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginRight: '10px'
                  }}
                >
                  {loading ? '⏳' : '✅'} Marquer comme utilisé
                </button>
              )}
              <button 
                onClick={() => {
                  setTicketInfo(null);
                  setError(null);
                  setDebugInfo([]);
                }}
                style={{
                  background: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
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
          fontSize: '12px'
        }}>
          <strong>Status:</strong> {scannerActive ? '✅ Scanner actif' : '⏸️ Scanner arrêté'}
          <br />
          <strong>Permission:</strong> {cameraPermission}
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
          fontWeight: 'bold'
        }}>
          ← Retour à la saisie manuelle
        </a>
      </div>
    </div>
  );
}
