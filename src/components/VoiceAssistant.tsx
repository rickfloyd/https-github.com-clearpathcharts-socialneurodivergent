import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini
const getApiKey = () => {
  try {
    // Vite's define will replace this literal
    return process.env.GEMINI_API_KEY || '';
  } catch (e) {
    return '';
  }
};

// Lazy AI initialization to prevent top-level module errors
let aiInstance: any = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        currentTranscript += result[0].transcript;
        if (result.isFinal) {
          isFinal = true;
        }
      }

      setTranscript(currentTranscript);

      if (isFinal && currentTranscript.trim().length > 0) {
        processCommand(currentTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart with delay if it was supposed to be listening
      if (isListening) {
        const timer = setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to restart recognition", e);
            setIsListening(false);
          }
        }, 1000); // 1s cooldown between starts to prevent freezing
        return () => clearTimeout(timer);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  };

  const processCommand = async (text: string) => {
    if (!text.toLowerCase().includes('help') && !text.toLowerCase().includes('navigate') && !text.toLowerCase().includes('change') && !text.toLowerCase().includes('open')) {
      // Only process if it looks like a command to save API calls
      return;
    }

    setIsProcessing(true);
    try {
      const response = await getAI().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `The user said: "${text}". 
        Determine if they are asking to navigate to a section or change their cognitive profile.
        Available sections: Home, Insights, Corporate, Market, Standard, InterfaceHub, Journal, news, Photos, Settings, AI Lab.
        Available profiles: standard_trader, adhd_trader, autism_trader, ptsd_trader, tbi_trader, downs_trader, veteran_trader.
        Return a JSON object with 'action' (either 'navigate', 'change-profile', or 'none') and 'target' (the section or profile ID).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING, description: "Action to take: 'navigate', 'change-profile', or 'none'" },
              target: { type: Type.STRING, description: "The target section or profile ID" }
            },
            required: ["action", "target"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.action && result.action !== 'none' && result.target) {
        console.log("Agentic Action:", result);
        window.dispatchEvent(new CustomEvent('app-command', { detail: result }));
      }
    } catch (error) {
      console.error("Error processing command:", error);
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {isListening && transcript && (
        <div className="bg-black/80 border border-indigo-500/50 text-indigo-300 text-xs px-3 py-1.5 rounded-lg backdrop-blur-md shadow-[0_0_10px_rgba(77,0,255,0.2)]">
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <Loader2 size={12} className="animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <p className="max-w-[150px] truncate">"{transcript}"</p>
          )}
        </div>
      )}
      
      <button
        onClick={toggleListening}
        className={`p-2 rounded-full transition-all flex items-center justify-center ${
          isListening 
            ? 'bg-red-500/20 border border-red-500 text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.4)]' 
            : 'bg-indigo-900/40 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-800/60'
        }`}
        title={isListening ? "Agentic Listening Active" : "Enable Agentic Accessibility"}
      >
        {isListening ? <Mic size={16} /> : <MicOff size={16} />}
      </button>
    </div>
  );
};
