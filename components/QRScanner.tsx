import { useState, useEffect, useRef } from 'react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import the library to avoid SSR issues
    const loadScanner = async () => {
      const { Html5QrcodeScanner } = await import('html5-qrcode');

      if (scanning && typeof document !== 'undefined') {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        );

        scannerRef.current = scanner;

        scanner.render(
          (decodedText) => {
            if (scannerRef.current) {
              scannerRef.current.clear();
            }
            setScanning(false);
            onScanSuccess(decodedText);
          },
          (error) => {
            if (onScanError) {
              onScanError(error);
            }
          }
        );
      }
    };

    if (scanning) {
      loadScanner();
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning, onScanSuccess, onScanError]);

  return (
    <div className="w-full">
      {!scanning ? (
        <button
          onClick={() => setScanning(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Mulai Scan QR Code
        </button>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" className="w-full"></div>
          <button
            onClick={() => setScanning(false)}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
