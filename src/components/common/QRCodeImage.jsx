import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeImage({
  value,
  size = 120,
  darkColor = '#1A1D19',
  lightColor = '#FFFFFF',
  className = '',
  alt = 'Arogya Clinic QR Code'
}) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!value) return;
    let isMounted = true;

    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: {
        dark: darkColor || '#1A1D19',
        light: lightColor || '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, darkColor, lightColor]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-black/5 dark:bg-white/5 animate-pulse rounded-xl flex items-center justify-center ${className}`}
      >
        <span className="text-[10px] text-gray-400 font-mono">QR</span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      style={{ width: size, height: size }}
      className={`rounded-xl block object-contain ${className}`}
    />
  );
}
