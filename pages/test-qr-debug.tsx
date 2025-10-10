import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';

export default function TestQRDebug() {
  const [qrText, setQrText] = useState('https://example.com/api/ticket/validate/TEST123');
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [detectedText, setDetectedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Générer un QR code de test
  const generateTestQR = async () => {
    try {
      const dataURL = await QRCode.toDataURL(qrText, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataURL(dataURL);
    } catch (err) {
      setError('Erreur génération QR: ' + err);
    }
  };

  // Démarrer la caméra pour tester la détection
  const startCamera = async () => {
    setLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Démarrer la détection
      startQRDetection();

    } catch (err) {
      setError('Erreur caméra: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const startQRDetection = () => {
    const detectQR = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // Utiliser jsQR pour détecter
          const jsQR = require('jsqr');
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            console.log('QR Code détecté:', code.data);
            setDetectedText(code.data);
            stopCamera();
            return;
          }
        }
        
        detectionIntervalRef.current = setTimeout(detectQR, 100);
      }
    };
    
    detectQR();
  };

  const stopCamera = () => {
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
  };

  // Analyser le texte détecté
  const analyzeDetectedText = (text: string) => {
    console.log('Analyse du texte détecté:', text);
    
    // Vérifier si c'est une URL de validation
    const validationMatch = text.match(/\/api\/ticket\/validate\/(.+)$/);
    if (validationMatch) {
      return {
        type: 'validation_url',
        ticketId: validationMatch[1],
        fullUrl: text
      };
    }
    
    // Vérifier si c'est juste un ID de ticket
    if (text.match(/^[A-Z0-9-]+$/)) {
      return {
        type: 'ticket_id',
        ticketId: text,
        fullUrl: null
      };
    }
    
    return {
      type: 'unknown',
      ticketId: null,
      fullUrl: text
    };
  };

  useEffect(() => {
    generateTestQR();
  }, [qrText]);

  const analysis = detectedText ? analyzeDetectedText(detectedText) : null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Test et Debug QR Code</h1>
      
      {/* Section génération QR */}
      <div style={{ background: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>📝 Génération QR Code de Test</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Texte à encoder:
          </label>
          <input
            type="text"
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button 
          onClick={generateTestQR}
          style={{ 
            background: '#4a90e2', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Régénérer QR Code
        </button>
        
        {qrCodeDataURL && (
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <img 
              src={qrCodeDataURL} 
              alt="QR Code de test" 
              style={{ maxWidth: '200px', border: '1px solid #ccc' }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Scannez ce QR code avec votre caméra
            </p>
          </div>
        )}
      </div>

      {/* Section détection caméra */}
      <div style={{ background: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>📷 Test Détection Caméra</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={startCamera}
            disabled={loading}
            style={{ 
              background: loading ? '#ccc' : '#4a90e2', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? '⏳ Démarrage...' : '🎥 Démarrer Caméra'}
          </button>
          <button 
            onClick={stopCamera}
            style={{ 
              background: '#e24a4a', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🛑 Arrêter Caméra
          </button>
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
            borderRadius: '8px',
            background: '#000',
            display: streamRef.current ? 'block' : 'none'
          }}
        />

        <canvas 
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>

      {/* Section résultats */}
      {detectedText && (
        <div style={{ background: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>✅ Résultat de la Détection</h3>
          <div style={{ marginBottom: '15px' }}>
            <strong>Texte détecté:</strong>
            <div style={{ 
              background: '#fff', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}>
              {detectedText}
            </div>
          </div>

          {analysis && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Analyse:</strong>
              <div style={{ 
                background: '#fff', 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                fontSize: '14px'
              }}>
                <p><strong>Type:</strong> {analysis.type}</p>
                {analysis.ticketId && <p><strong>Ticket ID:</strong> {analysis.ticketId}</p>}
                {analysis.fullUrl && <p><strong>URL complète:</strong> {analysis.fullUrl}</p>}
              </div>
            </div>
          )}

          <button 
            onClick={() => {
              setDetectedText('');
              setError(null);
            }}
            style={{ 
              background: '#4a90e2', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Nouveau Test
          </button>
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          padding: '15px', 
          color: '#dc2626',
          marginBottom: '20px'
        }}>
          ❌ {error}
        </div>
      )}

      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', fontSize: '14px' }}>
        <h4>🔧 Instructions de Test:</h4>
        <ol>
          <li>Générez un QR code avec le texte par défaut</li>
          <li>Démarrez la caméra</li>
          <li>Pointez la caméra vers le QR code généré</li>
          <li>Vérifiez que le texte est correctement détecté</li>
          <li>Testez avec différents formats d'URL</li>
        </ol>
        
        <h4>📋 Formats de QR Code à tester:</h4>
        <ul>
          <li><code>https://example.com/api/ticket/validate/TEST123</code></li>
          <li><code>/api/ticket/validate/TEST123</code></li>
          <li><code>TEST123</code></li>
          <li><code>ticket-TEST123</code></li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
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
