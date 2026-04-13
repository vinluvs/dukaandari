"use client";

import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize the scanner on mount
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Stop scanning after success
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        onScan(decodedText);
      },
      (errorMessage) => {
        if (onError) onError(errorMessage);
      }
    );

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan, onError]);

  return (
    <div className="w-full flex justify-center">
      <div id="qr-reader" className="w-full max-w-sm overflow-hidden rounded-md border" />
    </div>
  );
}
