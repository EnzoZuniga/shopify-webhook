import { useState, useRef, useEffect } from 'react';

export default function MobileScannerSimple() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [userAgent, setUserAgent] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Vérifier les permissions au chargement
    if (typeof window !== 'undefined') {
      setUserAgent(navigator.userAgent);
      
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

  const startCamera = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎥 Démarrage caméra simple...');
      
      // Contraintes ultra-simples
      const constraints = {
        video: true,
        audio: false
      };

      console.log('Demande d\'accès caméra...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Stream obtenu:', stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScannerActive(true);
        setCameraPermission('granted');
        console.log('✅ Caméra démarrée');
      }

    } catch (err) {
      console.error('❌ Erreur caméra:', err);
      setError(err instanceof Error ? err.message : 'Erreur caméra');
      setCameraPermission('denied');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScannerActive(false);
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
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
          🎥 Test Caméra Simple
        </h2>
        
        <div style={{ 
          background: '#f0f8ff', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #4a90e2',
          fontSize: '14px'
        }}>
          <strong>📋 Test simple :</strong>
          <br />1. Cliquez sur "Démarrer la Caméra"
          <br />2. Autorisez l'accès à la caméra
          <br />3. Vérifiez que la vidéo s'affiche
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
              onClick={startCamera}
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
              {loading ? '⏳ Démarrage...' : '🎥 Démarrer la Caméra'}
            </button>
          ) : (
            <button 
              onClick={stopCamera}
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
              🛑 Arrêter la Caméra
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
            maxWidth: '400px',
            height: 'auto',
            borderRadius: '12px',
            background: '#000',
            display: scannerActive ? 'block' : 'none',
            margin: '0 auto'
          }}
        />

        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '20px',
          fontSize: '12px'
        }}>
          <strong>Status:</strong> {scannerActive ? '✅ Caméra active' : '⏸️ Caméra arrêtée'}
          <br />
          <strong>Permission:</strong> {cameraPermission}
          <br />
          <strong>User Agent:</strong> {userAgent || 'Chargement...'}
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
