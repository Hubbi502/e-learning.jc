// components/Camera.tsx

"use client"; // This component uses client-side hooks and APIs

import React, { useState, useRef, useEffect, JSX } from 'react';

export default function Camera(): JSX.Element {
  // --- State ---
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user'); // 'user' = front, 'environment' = back

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Effect for Cleanup ---
  useEffect(() => {
    // A cleanup function to stop the streaam when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]); // Dependency array: runs when 'stream' changes

  // --- Effect to connect stream to video ---
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      
      // Add event listener for when metadata is loaded
      const video = videoRef.current;
      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
        setIsLoading(false);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      // Try to play the video
      video.play().catch(err => {
        console.error("Error playing video: ", err);
        setError("Tidak dapat memutar video: " + err.message);
        setIsLoading(false);
      });
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [stream]);

  // --- Handlers ---

  /**
   * Starts the camera and connects the stream to the video element.
   */
  const startCamera = async () => {
    setPhoto(null);
    setError(null);
    setIsLoading(true);

    // Define video constraints
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: facingMode // Use current facing mode
      },
      audio: false
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Media stream obtained:', mediaStream.getTracks());
      setStream(mediaStream);
      
      // The actual connection will happen in the useEffect
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setIsLoading(false);
      // Handle errors (e.g., user denies permission)
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

  /**
   * Stops the camera stream.
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      
      // Clear video srcObject
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    setError(null);
    setIsLoading(false);
  };

  /**
   * Toggles between front and back camera
   */
  const switchCamera = async () => {
    // Stop current stream
    stopCamera();
    
    // Toggle facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Start camera with new facing mode (will use updated facingMode from state)
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

  /**
   * Captures a photo from the video stream.
   */
  const takePhoto = () => {
    if (!stream) {
      setError("Kamera tidak aktif. Silakan nyalakan kamera terlebih dahulu.");
      return;
    }

    // Ensure refs are set and get the 2D context
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Check if video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        setError("Video belum siap. Tunggu sebentar dan coba lagi.");
        return;
      }
      
      const context = canvas.getContext('2d');

      // Check if context is available (it might not be)
      if (!context) {
        setError("Tidak dapat mengambil foto. Context canvas tidak tersedia.");
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Mirror the image horizontally ONLY for front camera
      if (facingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      // Reset transformation
      context.setTransform(1, 0, 0, 1, 0, 0);

      // Convert the canvas image to a data URL (PNG format)
      const dataUrl = canvas.toDataURL('image/png');
      setPhoto(dataUrl);

      // Stop the camera after taking the photo
      stopCamera();
    }
  };

  // --- Render ---

  return (
    <div className="w-full">
      {/* 1. Error Display */}
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

      {/* 2. Main Content Area (Video or Photo) */}
      <div className="relative w-full max-w-3xl mx-auto aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Show video stream if active */}
        {stream && (
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

      {/* 3. Control Buttons */}
      <div style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {!stream && !photo && (
          <button 
            onClick={startCamera} 
            disabled={isLoading}
            style={{ 
              padding: '14px 28px', 
              fontSize: '16px', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              backgroundColor: isLoading ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              boxShadow: isLoading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              minWidth: '180px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {isLoading ? '⏳ Memuat...' : '📷 Nyalakan Kamera'}
          </button>
        )}
        
        {stream && (
          <>
            <button 
              onClick={takePhoto} 
              style={{ 
                padding: '14px 28px', 
                fontSize: '16px', 
                cursor: 'pointer',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '150px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
              }}
            >
              � Ambil Foto
            </button>
            <button 
              onClick={switchCamera} 
              style={{ 
                padding: '14px 28px', 
                fontSize: '16px', 
                cursor: 'pointer',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '180px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
              }}
              title={facingMode === 'user' ? 'Beralih ke Kamera Belakang' : 'Beralih ke Kamera Depan'}
            >
              🔄 {facingMode === 'user' ? 'Kamera Belakang' : 'Kamera Depan'}
            </button>
            <button 
              onClick={stopCamera} 
              style={{ 
                padding: '14px 28px', 
                fontSize: '16px', 
                cursor: 'pointer',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '130px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
              }}
            >
              ⏹️ Matikan
            </button>
          </>
        )}

        {photo && !stream && (
          <button 
            onClick={startCamera} 
            style={{ 
              padding: '14px 28px', 
              fontSize: '16px', 
              cursor: 'pointer',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              minWidth: '180px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            � Ambil Foto Lagi
          </button>
        )}
      </div>

      {/* Camera Mode Indicator */}
      {stream && (
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '25px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'inline-block',
          width: '100%',
          maxWidth: '300px',
          margin: '20px auto 0',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}>
          {facingMode === 'user' ? '🤳 Kamera Depan (Mirror)' : '📸 Kamera Belakang'}
        </div>
      )}
    </div>
  );
}