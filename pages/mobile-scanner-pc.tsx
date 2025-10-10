import React, { useState, useEffect, useRef } from 'react';

export default function MobileScannerPC() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<any>(null);

  useEffect(() => {
    // Vérifier les permissions au chargement
    if (typeof window !== 'undefined') {
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'camera' as PermissionName })
          .then(permission => {
            setCameraPermission(permission.state);
          })
          .catch(() => {
            setCameraPermission('unknown');
          });
      }
    }
  }, []);

  const startScanner = async () => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    setError(null);

    try {
      console.log('🎥 Démarrage caméra PC...');
      
      // Contraintes simples pour PC
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      console.log('Demande d\'accès caméra...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Stream obtenu:', stream);

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScannerActive(true);
        setCameraPermission('granted');
        console.log('✅ Caméra démarrée');
      }

      // Attendre que la vidéo soit prête
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Démarrer la détection QR code avec ZXing (version unifiée)
      console.log('Initialisation de ZXing...');
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      
      codeReaderRef.current = new BrowserMultiFormatReader();
      console.log('ZXing initialisé (version unifiée)');

      // Démarrer la détection
      console.log('Démarrage de la détection QR code...');
      
      const detectQR = async () => {
        if (codeReaderRef.current && videoRef.current) {
          try {
            const result = await codeReaderRef.current.decodeFromVideoElement(videoRef.current);
            if (result) {
              console.log('🎯 QR Code détecté:', result.text);
              handleQRCodeDetected(result.text);
              return;
            }
          } catch (err) {
            if (err instanceof Error && !err.name?.includes('NotFoundException')) {
              console.error('Erreur de scan:', err);
            }
          }
          
          // Continuer la détection si pas de résultat
          if (scannerActive) {
            setTimeout(detectQR, 100);
          }
        }
      };
      
      // Démarrer la détection
      detectQR();
      console.log('✅ Détection QR code démarrée - Pointez vers un QR code');

    } catch (err) {
      console.error('❌ Erreur caméra:', err);
      setError(err instanceof Error ? err.message : 'Erreur caméra');
      setCameraPermission('denied');
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = () => {
    console.log('Arrêt du scanner...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScannerActive(false);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    console.log('QR Code détecté:', qrData);
    
    setLoading(true);
    setError(null);

    try {
      // Extraire l'ID du ticket du QR code
      const ticketId = qrData;
      console.log('Validation du ticket:', ticketId);

      const response = await fetch(`/api/ticket/validate/${ticketId}`);
      const result = await response.json();

      if (result.success) {
        setTicketInfo(result.ticket);
        console.log('✅ Ticket validé:', result.ticket);
      } else {
        setError(result.error || 'Ticket invalide');
        console.error('❌ Erreur validation:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setError('Erreur lors de la validation du ticket');
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
          📱 Scanner QR Code - PC
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

        {ticketInfo && (
          <div style={{ 
            background: '#f0f8ff', 
            border: '1px solid #4a90e2', 
            borderRadius: '12px', 
            padding: '20px', 
            marginTop: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#4a90e2', margin: '0 0 15px 0' }}>
              ✅ Ticket Validé !
            </h3>
            <div style={{ fontSize: '14px', color: '#333' }}>
              <p><strong>ID:</strong> {ticketInfo.ticketId}</p>
              <p><strong>Événement:</strong> {ticketInfo.eventName}</p>
              <p><strong>Client:</strong> {ticketInfo.customerName}</p>
              <p><strong>Email:</strong> {ticketInfo.customerEmail}</p>
              <p><strong>Statut:</strong> {ticketInfo.isUsed ? '❌ Déjà utilisé' : '✅ Valide'}</p>
            </div>
            <button 
              onClick={() => setTicketInfo(null)}
              style={{
                background: '#4a90e2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Scanner un autre ticket
            </button>
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
          <br />
          <strong>Platform:</strong> PC/Desktop
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
