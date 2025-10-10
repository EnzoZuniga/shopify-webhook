import React, { useState, useEffect, useRef } from 'react';

export default function TestScanner() {
  const [scannerActive, setScannerActive] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  const startScanner = async () => {
    if (typeof window === 'undefined') return;

    setError(null);
    setResult(null);

    try {
      const QrScanner = (await import('qr-scanner')).default;
      
      if (!videoRef.current) return;

      console.log('Démarrage du scanner de test...');

      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code détecté:', result.data);
          setResult(result.data);
          stopScanner();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      await scannerRef.current.start();
      setScannerActive(true);
      console.log('Scanner de test démarré');
    } catch (err) {
      console.error('Erreur scanner:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

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
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>🧪 Test Scanner QR</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Test du scanner QR code</p>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '20px', 
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', textAlign: 'center' }}>
            Test du scanner QR code
          </h3>
          
          {!scannerActive && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={startScanner}
                style={{
                  background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                📷 Démarrer le test
              </button>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                Pointez vers un QR code pour le tester
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
                    objectFit: 'cover'
                  }}
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
                ⏹️ Arrêter le test
              </button>
              <p style={{ fontSize: '14px', color: '#666', margin: '10px 0 0 0' }}>
                Pointez vers un QR code dans le cadre
              </p>
            </div>
          )}

          {error && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '12px', 
              padding: '15px', 
              marginTop: '20px',
              color: '#dc2626'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>❌ Erreur</div>
              <div>{error}</div>
            </div>
          )}

          {result && (
            <div style={{ 
              background: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              borderRadius: '12px', 
              padding: '15px', 
              marginTop: '20px',
              color: '#166534'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>✅ QR Code détecté</div>
              <div style={{ 
                background: '#f7f7f7', 
                padding: '10px', 
                borderRadius: '6px', 
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                {result}
              </div>
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
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
                🔄 Nouveau test
              </button>
            </div>
          )}
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          borderRadius: '12px', 
          padding: '15px',
          color: '#333'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📋 Instructions de test :</h4>
          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Cliquez sur "Démarrer le test"</li>
            <li>Autorisez l'accès à la caméra si demandé</li>
            <li>Pointez vers un QR code (peut être généré en ligne)</li>
            <li>Le contenu du QR code s'affichera automatiquement</li>
            <li>Testez avec différents QR codes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
