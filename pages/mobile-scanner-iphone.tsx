import React, { useState, useEffect, useRef } from 'react';

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

export default function MobileScanneriPhone() {
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validatedBy, setValidatedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isIOS, setIsIOS] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<any>(null);

  // Détecter iOS au chargement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
      setIsIOS(isIOSDevice);
      
      console.log('User Agent:', userAgent);
      console.log('Is iOS:', isIOSDevice);
      
      // Vérifier si l'appareil a une caméra
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Votre navigateur ne supporte pas l\'accès à la caméra');
        setCameraPermission('denied');
        return;
      }
    }
  }, []);

  const startScanner = async () => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    setError(null);

    try {
      console.log('Démarrage du scanner pour iPhone...');
      
      // Configuration spécifique pour iOS
      const constraints = {
        video: {
          facingMode: 'environment', // Caméra arrière
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      };

      console.log('Demande d\'accès à la caméra avec contraintes:', constraints);

      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream obtenu:', stream);

      streamRef.current = stream;
      
      if (!videoRef.current) {
        throw new Error('Élément vidéo non trouvé');
      }

      // Configuration spécifique pour iOS Safari
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('webkit-playsinline', 'true');
      videoRef.current.muted = true;
      videoRef.current.controls = false;

      // Attendre que la vidéo soit prête
      await new Promise((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('Élément vidéo non trouvé'));
          return;
        }

        videoRef.current.onloadedmetadata = () => {
          console.log('Métadonnées vidéo chargées');
          resolve(true);
        };

        videoRef.current.onerror = (e) => {
          console.error('Erreur vidéo:', e);
          reject(e);
        };

        // Démarrer la lecture
        videoRef.current.play().then(() => {
          console.log('Vidéo démarrée');
          resolve(true);
        }).catch((err) => {
          console.error('Erreur lecture vidéo:', err);
          reject(err);
        });
      });

      setScannerActive(true);
      setCameraPermission('granted');
      setError(null);
      console.log('Scanner démarré avec succès sur iPhone');

      // Démarrer la détection QR code avec ZXing
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      codeReaderRef.current = new BrowserMultiFormatReader();

      // Configuration pour iOS
      codeReaderRef.current.decodeFromVideoElement(videoRef.current, (result: any, err: any) => {
        if (result) {
          console.log('QR Code détecté:', result.text);
          handleQRCodeDetected(result.text);
        }
        if (err && !err.name?.includes('NotFoundException')) {
          console.error('Erreur de scan:', err);
        }
      });

    } catch (err) {
      console.error('Erreur lors du démarrage du scanner:', err);
      
      let errorMessage = 'Impossible de démarrer le scanner.';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Permission caméra refusée. Veuillez autoriser l\'accès à la caméra dans les paramètres Safari.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Aucune caméra trouvée sur cet appareil.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Votre navigateur ne supporte pas l\'accès à la caméra.';
        } else {
          errorMessage = `Erreur: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      setCameraPermission('denied');
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = () => {
    console.log('Arrêt du scanner...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Arrêt de la piste:', track.kind);
        track.stop();
      });
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
    console.log('Scanner arrêté');
  };

  const handleQRCodeDetected = async (qrData: string) => {
    console.log('QR Code détecté:', qrData);
    stopScanner();
    
    // Extraire l'ID du ticket depuis l'URL
    const ticketIdMatch = qrData.match(/\/api\/ticket\/validate\/(.+)$/);
    if (!ticketIdMatch) {
      setError('QR code invalide. Format non reconnu.');
      return;
    }

    const ticketId = ticketIdMatch[1];
    await fetchTicketInfo(ticketId);
  };

  const fetchTicketInfo = async (ticketId: string) => {
    setLoading(true);
    setError(null);
    setTicketInfo(null);
    
    try {
      const response = await fetch(`/api/ticket/validate/${ticketId}`);
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

  // Nettoyer les ressources au démontage
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>📱 Scanner iPhone</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>MR NJP Event's - Optimisé pour iOS</p>
          
          {isIOS && (
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '8px', 
              padding: '10px', 
              marginTop: '10px',
              fontSize: '14px'
            }}>
              🍎 Détecté: iPhone/iPad
            </div>
          )}
          
          {/* Back Button */}
          <div style={{ marginTop: '20px' }}>
            <a
              href="/mobile-simple"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'inline-block',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              ← Saisie manuelle
            </a>
          </div>
        </div>

        {/* Scanner Section */}
        {!ticketInfo && (
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '20px', 
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', textAlign: 'center' }}>
              📷 Scanner optimisé iPhone
            </h3>
            
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
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>❌ Permission caméra refusée</div>
                <div style={{ fontSize: '14px', marginBottom: '10px' }}>
                  {isIOS 
                    ? 'Allez dans Réglages > Safari > Caméra et autorisez l\'accès.'
                    : 'Veuillez activer l\'accès à la caméra dans les paramètres de votre navigateur.'
                  }
                </div>
                <button
                  onClick={() => {
                    setCameraPermission('prompt');
                    setError(null);
                  }}
                  style={{
                    background: '#8B4513',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Réessayer
                </button>
              </div>
            )}

            {!scannerActive && cameraPermission !== 'denied' && (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={startScanner}
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
                    opacity: loading ? 0.6 : 1,
                    marginBottom: '20px'
                  }}
                >
                  {loading ? '⏳ Démarrage...' : '📷 Démarrer le scanner iPhone'}
                </button>
                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                  {loading ? 'Initialisation de la caméra...' : 'Pointez la caméra vers le QR code du ticket'}
                </p>
              </div>
            )}

            {scannerActive && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '15px',
                  border: '3px solid #8B4513'
                }}>
                  <video
                    ref={videoRef}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      backgroundColor: '#000'
                    }}
                    autoPlay
                    playsInline
                    muted
                    controls={false}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '2px solid #8B4513',
                    borderRadius: '12px',
                    background: 'rgba(139, 69, 19, 0.1)',
                    pointerEvents: 'none'
                  }} />
                </div>
                <button
                  onClick={stopScanner}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  ⏹️ Arrêter le scanner
                </button>
                <p style={{ fontSize: '14px', color: '#666', margin: '10px 0 0 0' }}>
                  Pointez vers le QR code dans le cadre
                </p>
              </div>
            )}
          </div>
        )}

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
            {ticketInfo && (
              <button
                onClick={() => {
                  setTicketInfo(null);
                  setError(null);
                  setSuccess(null);
                }}
                style={{
                  background: '#8B4513',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                🔄 Nouveau scan
              </button>
            )}
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

            {/* Nouveau scan button */}
            <button
              onClick={() => {
                setTicketInfo(null);
                setError(null);
                setSuccess(null);
                setValidatedBy('');
                setNotes('');
              }}
              style={{
                background: '#8B4513',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                width: '100%',
                marginTop: '15px'
              }}
            >
              🔄 Nouveau scan
            </button>
          </div>
        )}

        {/* Instructions spécifiques iPhone */}
        <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          borderRadius: '12px', 
          padding: '15px',
          color: '#333'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📋 Instructions iPhone :</h4>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Cliquez sur "Démarrer le scanner iPhone"</li>
            <li>Autorisez l'accès à la caméra si Safari le demande</li>
            <li>Si refusé, allez dans Réglages &gt; Safari &gt; Caméra</li>
            <li>Pointez vers le QR code du ticket</li>
            <li>Le ticket sera automatiquement détecté</li>
            <li>Validez ou marquez comme utilisé</li>
          </ol>
          
          {isIOS && (
            <div style={{ 
              background: '#E3F2FD', 
              border: '1px solid #2196F3', 
              borderRadius: '8px', 
              padding: '10px', 
              marginTop: '10px',
              fontSize: '13px',
              color: '#1565C0'
            }}>
              💡 <strong>Astuce iPhone :</strong> Si la caméra ne s'affiche pas, essayez de rafraîchir la page ou d'utiliser Safari en mode privé.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
