'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// api call fn
const getPrediction = async (videoFrame: ImageData): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return "Hello, how are you?"
}

export default function SignLanguageInterpreter() {
  const [isInterpreting, setIsInterpreting] = useState(false)
  const [result, setResult] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startVideoStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing the camera:", err)
    }
  }, [])

  useEffect(() => {
    startVideoStream()
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [startVideoStream])

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        return context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
    return null
  }, [])

  const handleInterpretation = useCallback(async () => {
    if (!isInterpreting) {
      setIsInterpreting(true)
      while (isInterpreting) {
        const frame = captureFrame()
        if (frame) {
          const prediction = await getPrediction(frame)
          setResult(prediction)
        }
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for 1 second before next prediction
      }
    } else {
      setIsInterpreting(false)
    }
  }, [isInterpreting, captureFrame])

  return (
  <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sign Language Interpreter</h2>
      <div className="space-y-4">
        <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <canvas ref={canvasRef} className="hidden" width="640" height="480" />
        <div className="p-4 bg-gray-100 rounded-lg min-h-[100px]">
          <p className="font-medium">Interpretation Result:</p>
          <p>{result || "No interpretation yet"}</p>
        </div>
      </div>
    </div>
    <div className="px-6 py-4 bg-gray-50">
      <button 
        onClick={handleInterpretation} 
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {isInterpreting ? "Stop Interpreting" : "Start Interpreting"}
      </button>
    </div>
  </div>
)
}