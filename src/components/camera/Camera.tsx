// components/Camera.tsx

"use client"; // This component uses client-side hooks and APIs

import React, { useState, useRef, useEffect } from 'react';

export default function Camera(): JSX.Element {
  // --- State ---
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Effect for Cleanup ---
  useEffect(() => {
    // A cleanup function to stop the stream when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]); // Dependency array: runs when 'stream' changes

  // --- Handlers ---

  /**
   * Starts the camera and connects the stream to the video element.
   */
  const startCamera = async () => {
    setPhoto(null);
    setError(null);

    // Define video constraints
    const constraints: MediaStreamConstraints = {
      video: {
        width: 640,
        height: 480
      },
      audio: false
    };

    try {
      // Request media stream
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      // Handle errors (e.g., user denies permission)
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera access was denied. Please allow camera access in your browser settings.");
        } else {
          setError(`Could not access camera: ${err.message}`);
        }
      } else {
        setError("An unknown error occurred while accessing the camera.");
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
    }
    setError(null);
  };

  /**
   * Captures a photo from the video stream.
   */
  const takePhoto = () => {
    if (!stream) {
      setError("Camera is not active. Please start the camera first.");
      return;
    }

    // Ensure refs are set and get the 2D context
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Check if context is available (it might not be)
      if (!context) {
        setError("Could not get canvas context to take photo.");
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

      // Convert the canvas image to a data URL (PNG format)
      const dataUrl = canvas.toDataURL('image/png');
      setPhoto(dataUrl);

      // Stop the camera after taking the photo
      stopCamera();
    }
  };

  // --- Render ---

  return (
    <div>
      {/* 1. Error Display */}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* 2. Main Content Area (Video or Photo) */}
      <div style={{ position: 'relative', width: 640, height: 480, background: '#222' }}>
        
        {/* Show video stream if active */}
        {stream && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Mute audio to avoid feedback loops
            style={{ width: '100%', height: '100%' }}
          />
        )}

        {/* Show captured photo */}
        {photo && (
          <img
            src={photo}
            alt="Snapshot"
            style={{ width: '100%', height: '100%' }}
          />
        )}

        {/* Hidden canvas for processing the snapshot */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* 3. Control Buttons */}
      <div style={{ marginTop: '10px' }}>
        {!stream && (
          <button onClick={startCamera}>Start Camera</button>
        )}
        
        {stream && (
          <button onClick={takePhoto} style={{ marginRight: '10px' }}>Take Photo</button>
        )}

        {stream && (
          <button onClick={stopCamera}>Stop Camera</button>
        )}
      </div>
    </div>
  );
}