import { useState } from "react";
import Markdown from "react-markdown";
import { motion } from "motion/react";
import { Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import { generateDreamImage } from "../services/geminiService";

interface DreamAnalysisProps {
  transcription: string;
  interpretation: string;
}

export function DreamAnalysis({ transcription, interpretation }: DreamAnalysisProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");

  const handleGenerateImage = async () => {
    // Check if user has selected API key
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
      await window.aistudio.openSelectKey();
      // Assume success after dialog
    }

    setIsGeneratingImage(true);
    try {
      const url = await generateDreamImage(transcription, imageSize);
      setImageUrl(url);
    } catch (err) {
      console.error("Failed to generate image:", err);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Transcription Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 md:p-8"
      >
        <h2 className="text-2xl font-serif text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          The Dream
        </h2>
        <p className="text-lg text-purple-100/80 italic leading-relaxed">
          "{transcription}"
        </p>
      </motion.div>

      {/* Image Generation Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px]"
      >
        {imageUrl ? (
          <div className="w-full">
            <h2 className="text-2xl font-serif text-white mb-6 text-center">Visual Manifestation</h2>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-purple-500/20">
              <img 
                src={imageUrl} 
                alt="Surrealist dream representation" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
              <ImageIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-white mb-2">Generate Dream Imagery</h3>
              <p className="text-purple-200/60 max-w-md mx-auto">
                Use Nano Banana Pro to create a surrealist representation of your dream's core emotional themes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <select 
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as "1K" | "2K" | "4K")}
                className="bg-black/50 border border-purple-500/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                disabled={isGeneratingImage}
              >
                <option value="1K">1K Resolution</option>
                <option value="2K">2K Resolution</option>
                <option value="4K">4K Resolution</option>
              </select>
              
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Manifesting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Interpretation Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-6 md:p-8"
      >
        <h2 className="text-2xl font-serif text-white mb-6">Psychological Interpretation</h2>
        <div className="markdown-body">
          <Markdown>{interpretation}</Markdown>
        </div>
      </motion.div>
    </div>
  );
}
