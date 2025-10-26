// components/Camera.tsx

"use client";

import React, { useState, useRef, useEffect, JSX } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';

export default function Camera(): JSX.Element {
  // --- State ---
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [qrScanEnabled, setQrScanEnabled] = useState<boolean>(false);
  const [lastQrCode, setLastQrCode] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      
      const video = videoRef.current;
      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
        setIsLoading(false);
        
        if (qrScanEnabled) {
          startQrScanning();
        }
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      video.play().catch(err => {
        console.error("Error playing video: ", err);
        setError("Tidak dapat memutar video: " + err.message);
        setIsLoading(false);
      });
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [stream, qrScanEnabled]);

  // --- Handlers ---
  const startCamera = async () => {
    setPhoto(null);
    setError(null);
    setIsLoading(true);

    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: facingMode
      },
      audio: false
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Media stream obtained:', mediaStream.getTracks());
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setIsLoading(false);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.");
        } else if (err.name === "NotFoundError") {
          setError("Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.");
        } else if (err.name === "NotReadableError") {
          setError("Kamera sedang digunakan oleh aplikasi lain.");
        } else {
          setError(`Tidak dapat mengakses kamera: ${err.message}`);
        }
      } else {
        setError("Terjadi kesalahan tidak dikenal saat mengakses kamera.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    stopQrScanning();
    setError(null);
    setIsLoading(false);
  };

  const startQrScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Initialize QR reader if not already done
    if (!qrReaderRef.current) {
      qrReaderRef.current = new BrowserQRCodeReader();
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Try to decode QR code from canvas
        try {
          // Convert canvas to blob and then to image element
          canvas.toBlob(async (blob) => {
            if (blob && qrReaderRef.current) {
              const url = URL.createObjectURL(blob);
              const img = new Image();
              img.src = url;
              
              img.onload = async () => {
                try {
                  const result = await qrReaderRef.current?.decodeFromImageElement(img);
                  if (result && result.getText()) {
                    const qrText = result.getText();
                    if (qrText !== lastQrCode) {
                      console.log('🔍 QR Code Detected:', qrText);
                      console.log('📊 QR Code Details:', {
                        text: qrText,
                        format: result.getBarcodeFormat(),
                        timestamp: new Date().toISOString()
                      });
                      setLastQrCode(qrText);
                    }
                  }
                } catch (err) {
                  // No QR code found
                } finally {
                  URL.revokeObjectURL(url);
                }
              };
            }
          }, 'image/png');
        } catch (err) {
          // Silently ignore errors during scanning
        }
      }
    }, 300);
  };

  const stopQrScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const toggleQrScanning = () => {
    if (qrScanEnabled) {
      stopQrScanning();
      setQrScanEnabled(false);
      setLastQrCode(null);
      console.log('🔴 QR Scanning stopped');
    } else {
      setQrScanEnabled(true);
      console.log('🟢 QR Scanning started');
      if (stream && videoRef.current) {
        startQrScanning();
      }
    }
  };

  const switchCamera = async () => {
    stopCamera();
    
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setPhoto(null);
    setError(null);
    setIsLoading(true);

    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: newFacingMode
      },
      audio: false
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Switched to camera:', newFacingMode, mediaStream.getTracks());
      setStream(mediaStream);
    } catch (err) {
      console.error("Error switching camera: ", err);
      setIsLoading(false);
      if (err instanceof Error) {
        setError(`Tidak dapat beralih kamera: ${err.message}`);
      } else {
        setError("Terjadi kesalahan saat beralih kamera.");
      }
    }
  };

  const takePhoto = () => {
    if (!stream) {
      setError("Kamera tidak aktif. Silakan nyalakan kamera terlebih dahulu.");
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        setError("Video belum siap. Tunggu sebentar dan coba lagi.");
        return;
      }
      
      const context = canvas.getContext('2d');

      if (!context) {
        setError("Tidak dapat mengambil foto. Context canvas tidak tersedia.");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Mirror the image horizontally ONLY for front camera
      if (facingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      context.setTransform(1, 0, 0, 1, 0, 0);

      const dataUrl = canvas.toDataURL('image/png');
      setPhoto(dataUrl);

      stopCamera();
    }
  };

  // --- Render ---
  return (
    <div className="w-full">
      {/* Error Display */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <span className="text-red-800 flex-1">{error}</span>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
          <span className="text-2xl animate-pulse">⏳</span>
          <span className="text-blue-800">Memuat kamera...</span>
        </div>
      )}

      {/* Main Content Area (Video or Photo) */}
      <div className="relative w-full max-w-3xl mx-auto aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Show video stream if active */}
        {stream && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ 
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
              }}
            />
            
            {/* QR Scanning Indicator */}
            {qrScanEnabled && (
              <div className="absolute top-4 left-4 bg-green-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="font-semibold text-sm">QR Scanning Active</span>
              </div>
            )}
            
            {/* Last QR Code Display */}
            {lastQrCode && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-3 rounded-lg">
                <div className="text-xs text-green-400 mb-1">Last Detected QR Code:</div>
                <div className="text-sm font-mono break-all">{lastQrCode}</div>
              </div>
            )}
          </>
        )}

        {/* Show captured photo */}
        {photo && (
          <img
            src={photo}
            alt="Snapshot"
            className="w-full h-full object-contain bg-black"
          />
        )}

        {/* Show placeholder when no stream */}
        {!stream && !photo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
            <div className="text-6xl md:text-8xl animate-bounce">📷</div>
            <div className="text-lg md:text-xl font-medium">Kamera Belum Aktif</div>
          </div>
        )}

        {/* Hidden canvas for processing the snapshot */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Buttons */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!stream && !photo && (
          <button 
            onClick={startCamera} 
            disabled={isLoading}
            className={`
              px-6 py-3.5 rounded-xl font-bold text-white text-base
              transition-all duration-300 transform
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-lg active:scale-95'
              }
              min-w-[200px] shadow-md
            `}
          >
            {isLoading ? '⏳ Memuat...' : '📷 Nyalakan Kamera'}
          </button>
        )}
        
        {stream && (
          <>
            <button 
              onClick={takePhoto} 
              className="
                px-6 py-3.5 rounded-xl font-bold text-white text-base
                bg-gradient-to-r from-green-500 to-emerald-600
                hover:from-green-600 hover:to-emerald-700
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                active:scale-95 min-w-[160px] shadow-md
              "
            >
              📸 Ambil Foto
            </button>
            
            <button 
              onClick={toggleQrScanning} 
              className={`
                px-6 py-3.5 rounded-xl font-bold text-white text-base
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                active:scale-95 min-w-[160px] shadow-md
                ${qrScanEnabled 
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                }
              `}
            >
              {qrScanEnabled ? '⏹️ Stop QR Scan' : '🔍 Scan QR Code'}
            </button>
            
            <button 
              onClick={switchCamera} 
              className="
                px-6 py-3.5 rounded-xl font-bold text-white text-base
                bg-gradient-to-r from-orange-500 to-amber-600
                hover:from-orange-600 hover:to-amber-700
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                active:scale-95 min-w-[180px] sm:min-w-[200px] shadow-md
              "
              title={facingMode === 'user' ? 'Beralih ke Kamera Belakang' : 'Beralih ke Kamera Depan'}
            >
              <span className="hidden sm:inline">
                🔄 {facingMode === 'user' ? 'Kamera Belakang' : 'Kamera Depan'}
              </span>
              <span className="sm:hidden">
                🔄 {facingMode === 'user' ? 'Belakang' : 'Depan'}
              </span>
            </button>
            
            <button 
              onClick={stopCamera} 
              className="
                px-6 py-3.5 rounded-xl font-bold text-white text-base
                bg-gradient-to-r from-red-500 to-rose-600
                hover:from-red-600 hover:to-rose-700
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                active:scale-95 min-w-[140px] shadow-md
              "
            >
              ⏹️ Matikan
            </button>
          </>
        )}

        {photo && !stream && (
          <button 
            onClick={startCamera} 
            className="
              px-6 py-3.5 rounded-xl font-bold text-white text-base
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700
              transition-all duration-300 transform hover:scale-105 hover:shadow-lg
              active:scale-95 min-w-[200px] shadow-md
            "
          >
            🔄 Ambil Foto Lagi
          </button>
        )}
      </div>

      {/* Camera Mode Indicator */}
      {stream && (
        <div className="mt-6 flex justify-center">
          <div className="
            px-6 py-3 rounded-full 
            bg-gradient-to-r from-indigo-600 to-purple-600
            text-white font-semibold text-sm
            shadow-lg inline-flex items-center gap-2
          ">
            <span className="text-lg">
              {facingMode === 'user' ? '🤳' : '📸'}
            </span>
            <span className="hidden sm:inline">
              {facingMode === 'user' ? 'Kamera Depan (Mirror)' : 'Kamera Belakang'}
            </span>
            <span className="sm:hidden">
              {facingMode === 'user' ? 'Depan' : 'Belakang'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
