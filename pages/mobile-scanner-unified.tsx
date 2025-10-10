import React, { useState, useEffect, useRef } from 'react';

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

export default function MobileScannerUnified() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [cameraInfo, setCameraInfo] = useState<string>('');
  const [platform, setPlatform] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<any>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Vérifier les permissions au chargement
    if (typeof window !== 'undefined') {
      // Détecter la plateforme côté client
      const isMobile = navigator.userAgent.includes('Mobile');
      setPlatform(isMobile ? 'Mobile' : 'Desktop');
      
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

  // Fonction pour obtenir les contraintes de caméra optimisées
  const getCameraConstraints = async () => {
    try {
      console.log('🔍 Recherche de la caméra arrière...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('📷 Caméras disponibles:', videoDevices.map(d => d.label));
      
      // Chercher la caméra arrière par nom
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment') ||
        device.label.toLowerCase().includes('camera2')
      );
      
      if (backCamera) {
        console.log('✅ Caméra arrière trouvée:', backCamera.label);
        setCameraInfo(`Caméra arrière: ${backCamera.label}`);
        return { 
          video: { 
            deviceId: { exact: backCamera.deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false 
        };
      } else {
        console.log('⚠️ Aucune caméra arrière trouvée, utilisation de facingMode');
        setCameraInfo('Caméra par défaut (facingMode)');
        return { 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false 
        };
      }
    } catch (err) {
      console.log('❌ Erreur énumération devices:', err);
      setCameraInfo('Caméra par défaut (fallback)');
      return { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      };
    }
  };

  const startScanner = async () => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Démarrage du scanner unifié...');
      
      // Obtenir les contraintes de caméra optimisées
      const constraints = await getCameraConstraints();
      
      console.log('📹 Demande d\'accès caméra avec contraintes:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Stream obtenu:', stream);

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
              console.log('✅ Vidéo démarrée');
              resolve(true);
            });
          };
        });
        
        setScannerActive(true);
        setCameraPermission('granted');
        console.log('✅ Caméra démarrée avec succès');
      }

      // Attendre un peu que la vidéo soit stable
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Initialiser ZXing avec configuration optimisée
      console.log('🔧 Initialisation de ZXing...');
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      codeReaderRef.current = new BrowserMultiFormatReader();
      console.log('✅ ZXing initialisé');

      // Démarrer la détection QR avec retry
      startQRDetection();

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
    } finally {
      setLoading(false);
    }
  };

  const startQRDetection = () => {
    if (!codeReaderRef.current || !videoRef.current) return;

    console.log('🎯 Démarrage de la détection QR code...');
    
    const detectQR = () => {
      if (codeReaderRef.current && videoRef.current && scannerActive) {
        codeReaderRef.current.decodeFromVideoElement(videoRef.current, (result: any, err: any) => {
          if (result) {
            console.log('🎯 QR Code détecté:', result.text);
            handleQRCodeDetected(result.text);
            return; // Arrêter la détection après succès
          }
          if (err && !err.name?.includes('NotFoundException')) {
            console.error('Erreur de scan:', err);
          }
          
          // Continuer la détection si pas de résultat et scanner toujours actif
          if (scannerActive) {
            detectionIntervalRef.current = setTimeout(detectQR, 200);
          }
        });
      }
    };
    
    detectQR();
    console.log('✅ Détection QR code démarrée');
  };

  const stopScanner = () => {
    console.log('🛑 Arrêt du scanner...');
    
    if (detectionIntervalRef.current) {
      clearTimeout(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (codeReaderRef.current) {
      // @zxing/browser n'a pas de méthode reset, on peut juste nullifier
      codeReaderRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScannerActive(false);
  };

  const handleQRCodeDetected = async (qrData: string) => {
    console.log('🎯 QR Code détecté:', qrData);
    
    // Arrêter la détection immédiatement
    if (detectionIntervalRef.current) {
      clearTimeout(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    // Arrêter temporairement le scanner
    stopScanner();
    
    setLoading(true);
    setError(null);

    try {
      // Extraire l'ID du ticket du QR code
      const ticketId = qrData;
      console.log('🔍 Validation du ticket:', ticketId);

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
        console.log('✅ Ticket marqué comme utilisé');
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
          📱 Scanner QR Code Unifié
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
          <br />
          <br /><strong>🎥 Caméra :</strong> {cameraInfo}
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
          <br />
          <strong>Platform:</strong> {platform || 'Chargement...'}
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
