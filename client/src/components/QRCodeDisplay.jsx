import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeDisplay({
  value,
  size = 160,
  title = '',
  lightColor = '#ffffff',
  darkColor = '#090d16',
  showFrame = true,
}) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (value) {
      QRCode.toDataURL(
        value,
        {
          width: size * 2, // 2x density for ultra-sharp crispness
          margin: 1.5,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: 'H', // High error correction
        },
        (err, url) => {
          if (!err && url) {
            setDataUrl(url);
          }
        }
      );
    }
  }, [value, size, lightColor, darkColor]);

  if (!dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          padding: showFrame ? '10px' : '0',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: showFrame ? '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.15)' : 'none',
          display: 'inline-block',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={dataUrl}
          alt={`QR: ${value}`}
          style={{
            width: size,
            height: size,
            display: 'block',
            borderRadius: '6px',
            imageRendering: 'crisp-edges',
          }}
        />
      </div>

      {title && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '8px',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}>
          {title}
        </div>
      )}
    </div>
  );
}
