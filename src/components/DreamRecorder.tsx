import { useState, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface DreamRecorderProps {
  onRecordingComplete: (audioBase64: string, mimeType: string) => void;
  isProcessing: boolean;
}

export function DreamRecorder({ onRecordingComplete, isProcessing }: DreamRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Extract base64 part and mime type
          const [prefix, data] = base64data.split(",");
          const mimeType = prefix.match(/:(.*?);/)?.[1] || "audio/webm";
          onRecordingComplete(data, mimeType);
        };
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 glass-panel max-w-md mx-auto">
      <h2 className="text-2xl font-serif text-white mb-6 text-center">
        {isRecording ? "Listening to your dream..." : "Record your dream"}
      </h2>
      
      <div className="relative">
        {isRecording && (
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording 
              ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30" 
              : "bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : isRecording ? (
            <Square className="w-10 h-10 fill-current" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>
      
      <p className="mt-6 text-sm text-purple-200/60 text-center max-w-xs">
        {isRecording 
          ? "Tap to stop recording when you're finished." 
          : "Speak clearly. Describe the events, emotions, and symbols you remember."}
      </p>
    </div>
  );
}
