import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useBusiness } from './BusinessContext';
import {
  ai,
  ensureInitialized,
  VOXIDE_PRESETS,
  simulateVoxideAudioSession,
  parseVoiceInputText,
} from '../services/voxideVoiceService';
import { useVoxideVoice } from '@voxide/react';

const VoiceContext = createContext();

function haptic(pattern = [30]) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function VoiceProvider({ children }) {
  const { language, processVoicePayload, lastVoiceEvent, showToast } = useBusiness();
  const isAmharic = language === 'am';
  const voxide = useVoxideVoice(ai);

  const [simState, setSimState] = useState('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recentSuccess, setRecentSuccess] = useState(false);
  const [activePresetId, setActivePresetId] = useState(null);
  const [micModalState, setMicModalState] = useState(null); // null | 'prompt' | 'denied' | 'usage_limit' | 'network'
  const [isWebSpeechListening, setIsWebSpeechListening] = useState(false);

  const recognitionRef = useRef(null);
  const cleanupSessionRef = useRef(null);
  const fullTranscriptRef = useRef('');

  // Auto-clear success state after 2.5s
  useEffect(() => {
    if (lastVoiceEvent) {
      setRecentSuccess(true);
      const timer = setTimeout(() => {
        setRecentSuccess(false);
        setLiveTranscript('');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [lastVoiceEvent]);

  // Derive effective voice state
  let effectiveState = 'idle';
  if (recentSuccess) {
    effectiveState = 'success';
  } else if (simState !== 'idle') {
    effectiveState = simState;
  } else if (isWebSpeechListening || voxide.status === 'listening' || voxide.status === 'speaking') {
    effectiveState = 'listening';
  } else if (['connecting', 'thinking', 'executing'].includes(voxide.status)) {
    effectiveState = 'processing';
  }

  const isListening = effectiveState === 'listening';
  const isProcessing = effectiveState === 'processing';

  // Listen to Voxide transcripts if available
  useEffect(() => {
    if (!ai || typeof ai.on !== 'function') return;
    const unsub = ai.on('transcript', (text) => {
      if (text && typeof text === 'string') {
        setLiveTranscript(text);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Stop web speech recognition
  const stopWebSpeech = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore already stopped
      }
      recognitionRef.current = null;
    }
    setIsWebSpeechListening(false);
  }, []);

  // Process final spoken transcript
  const finalizeSpokenText = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setLiveTranscript('');
      return;
    }
    // Parse using our heuristic / Amharic NLP extractor
    const payload = parseVoiceInputText(trimmed, language);
    processVoicePayload(payload);
    haptic([20, 50, 20]);
  }, [language, processVoicePayload]);

  // Start real browser speech recognition with real-time interim results
  const startWebSpeech = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return false;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true; // Provides real-time preview while speaking!
      recognition.lang = isAmharic ? 'am-ET' : 'en-US';

      fullTranscriptRef.current = '';
      setLiveTranscript('');

      recognition.onstart = () => {
        setIsWebSpeechListening(true);
      };

      recognition.onresult = (event) => {
        let interim = '';
        let finalized = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalized += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }

        const currentDisplay = (finalized + interim).trim();
        fullTranscriptRef.current = currentDisplay;
        setLiveTranscript(currentDisplay);
      };

      recognition.onerror = (event) => {
        console.warn('[WebSpeech Error]', event.error);
        if (event.error === 'not-allowed') {
          setMicModalState('denied');
        }
        setIsWebSpeechListening(false);
      };

      recognition.onend = () => {
        setIsWebSpeechListening(false);
        if (fullTranscriptRef.current.trim()) {
          finalizeSpokenText(fullTranscriptRef.current);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      return true;
    } catch (err) {
      console.warn('[WebSpeech init failed]', err);
      return false;
    }
  }, [isAmharic, finalizeSpokenText]);

  // Connect / disconnect Voxide or Web Speech
  const connectVoice = async () => {
    haptic([20]);
    const currentlyActive = isListening || isProcessing;

    if (currentlyActive) {
      // User clicked stop
      stopWebSpeech();
      if (cleanupSessionRef.current) {
        cleanupSessionRef.current();
        cleanupSessionRef.current = null;
      }
      if (['listening', 'connecting', 'thinking', 'speaking', 'executing'].includes(voxide.status)) {
        try { await voxide.disconnect(); } catch (e) { /* ignore */ }
      }
      setSimState('idle');
      return;
    }

    // Try starting Web Speech for live real-time interim preview
    const webSpeechStarted = startWebSpeech();

    // Also attempt Voxide connection in background
    try {
      await ensureInitialized();
      await voxide.connect();
      setMicModalState(null);
    } catch (err) {
      console.warn('[Voxide activation note]', err);
      // If web speech didn't start either, fallback to simulation preset
      if (!webSpeechStarted) {
        const msg = err?.message?.toLowerCase() ?? '';
        if (msg.includes('denied') || msg.includes('notallowed')) {
          setMicModalState('denied');
        } else if (msg.includes('usage') || msg.includes('limit') || msg.includes('quota')) {
          setMicModalState('usage_limit');
        } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed')) {
          setMicModalState('network');
        } else {
          showToast(
            isAmharic
              ? 'የቀጥታ ድምፅ ግንኙነት አልተሳካም፤ የሙከራ ድምፅ ጥቅም ላይ ዋለ'
              : 'Microphone stream unavailable. Using demo simulation.',
            'warning'
          );
          const langPresets = VOXIDE_PRESETS.filter((p) => p.language === language);
          runVoiceSimulation(langPresets[0] || VOXIDE_PRESETS[0]);
        }
      }
    }
  };

  const toggleVoice = async () => {
    if (cleanupSessionRef.current) {
      cleanupSessionRef.current();
      cleanupSessionRef.current = null;
    }
    if (simState !== 'idle') {
      setSimState('idle');
      setLiveTranscript('');
      setActivePresetId(null);
      return;
    }

    if (isListening) {
      // Stopping active session
      stopWebSpeech();
      if (['listening', 'connecting', 'thinking', 'speaking', 'executing'].includes(voxide.status)) {
        try { await voxide.disconnect(); } catch (e) { /* ignore */ }
      }
      return;
    }

    // Check permission prompt before first live mic
    const permGranted = localStorage.getItem('birrvoice-mic-permission');
    if (!permGranted) {
      setMicModalState('prompt');
      return;
    }
    await connectVoice();
  };

  const handleMicAllow = async () => {
    localStorage.setItem('birrvoice-mic-permission', '1');
    setMicModalState(null);
    await connectVoice();
  };

  const handleMicDeny = () => {
    setMicModalState(null);
    const langPresets = VOXIDE_PRESETS.filter((p) => p.language === language);
    runVoiceSimulation(langPresets[0] || VOXIDE_PRESETS[0]);
  };

  // Run simulation with streaming typing effect so the live transcript shows preview
  const runVoiceSimulation = (preset) => {
    if (cleanupSessionRef.current) cleanupSessionRef.current();
    setSimState('listening');
    setLiveTranscript('');
    setActivePresetId(preset.id);

    // Stream the text preview word by word
    const words = preset.text.split(' ');
    let currentWordIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentWordIndex < words.length) {
        setLiveTranscript(words.slice(0, currentWordIndex + 1).join(' '));
        currentWordIndex++;
      } else {
        clearInterval(streamInterval);
      }
    }, 280);

    cleanupSessionRef.current = simulateVoxideAudioSession(
      preset,
      (statusUpdate) => {
        if (statusUpdate.status === 'listening') setSimState('listening');
        if (statusUpdate.status === 'processing') setSimState('processing');
        if (statusUpdate.transcript) setLiveTranscript(statusUpdate.transcript);
      },
      (payload) => {
        clearInterval(streamInterval);
        processVoicePayload(payload);
        haptic([20, 50, 20]);
        setSimState('idle');
        setActivePresetId(null);
      }
    );
  };

  useEffect(() => {
    return () => {
      stopWebSpeech();
      if (cleanupSessionRef.current) cleanupSessionRef.current();
    };
  }, [stopWebSpeech]);

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isProcessing,
        effectiveState,
        liveTranscript,
        setLiveTranscript,
        toggleVoice,
        runVoiceSimulation,
        activePresetId,
        micModalState,
        setMicModalState,
        handleMicAllow,
        handleMicDeny,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
