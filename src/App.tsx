import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, RefreshCw } from "lucide-react";
import { DreamRecorder } from "./components/DreamRecorder";
import { DreamAnalysis } from "./components/DreamAnalysis";
import { DreamChat } from "./components/DreamChat";
import { analyzeDreamAudio, DreamAnalysisResult } from "./services/geminiService";
import "./types";

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<DreamAnalysisResult | null>(null);

  const handleRecordingComplete = async (audioBase64: string, mimeType: string) => {
    setIsProcessing(true);
    try {
      const result = await analyzeDreamAudio(audioBase64, mimeType);
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing dream:", error);
      alert("Failed to analyze dream. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetJournal = () => {
    setAnalysis(null);
  };

  return (
    <>
      <div className="atmosphere" />
      
      <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <Moon className="w-8 h-8 text-purple-300" />
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-light text-white mb-4 tracking-tight">
            Oneiro
          </h1>
          <p className="text-lg text-purple-200/60 max-w-xl mx-auto font-light tracking-wide">
            Record your dreams. Uncover their meaning. Manifest their imagery.
          </p>
        </motion.header>

        <main className="w-full max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {!analysis ? (
              <motion.div
                key="recorder"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <DreamRecorder 
                  onRecordingComplete={handleRecordingComplete} 
                  isProcessing={isProcessing} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-12"
              >
                <div className="flex justify-end">
                  <button
                    onClick={resetJournal}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Record New Dream
                  </button>
                </div>
                
                <DreamAnalysis 
                  transcription={analysis.transcription} 
                  interpretation={analysis.interpretation} 
                />
                
                <DreamChat 
                  transcription={analysis.transcription} 
                  interpretation={analysis.interpretation} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
