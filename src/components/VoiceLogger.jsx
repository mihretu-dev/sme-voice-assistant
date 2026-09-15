import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Sparkles,
  Send,
  Code,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import {
  VOXIDE_PRESETS,
  simulateVoxideAudioSession,
  parseVoiceInputText,
} from '../services/voxideVoiceService';

export default function VoiceLogger() {
  const { language, processVoicePayload, lastVoiceEvent } = useBusiness();
  const isAmharic = language === 'am';

  // Voice session state: 'idle' | 'listening' | 'processing' | 'success'
  const [sessionState, setSessionState] = useState('idle');
  const [streamInfo, setStreamInfo] = useState({
    message: isAmharic ? 'ድምፅዎን ለመቅዳት ማይክሮፎኑን ይጫኑ' : 'Press mic to stream voice to Voxide engine',
    transcript: '',
    audioLevel: 0,
  });

  // Simulation fallback states
  const [customText, setCustomText] = useState('');
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        action: 'sale',
        item: 'Sugar',
        quantity: 3,
        amount: 390,
        language: 'en',
      },
      null,
      2
    )
  );

  const cleanupSessionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cleanupSessionRef.current) cleanupSessionRef.current();
    };
  }, []);

  // Trigger simulated voice stream for a chosen preset or random default
  const handleMicClick = () => {
    if (sessionState === 'listening' || sessionState === 'processing') {
      // Cancel active
      if (cleanupSessionRef.current) cleanupSessionRef.current();
      setSessionState('idle');
      setStreamInfo({
        message: 'Voice streaming cancelled.',
        transcript: '',
        audioLevel: 0,
      });
      return;
    }

    // Pick a realistic preset corresponding to current language
    const langPresets = VOXIDE_PRESETS.filter((p) => p.language === language);
    const chosenPreset = langPresets[Math.floor(Math.random() * langPresets.length)] || VOXIDE_PRESETS[0];

    runVoiceSimulation(chosenPreset);
  };

  const runVoiceSimulation = (preset) => {
    if (cleanupSessionRef.current) cleanupSessionRef.current();

    setSessionState('listening');
    setStreamInfo({
      message: isAmharic ? 'ድምፅ እየተቀዳ ነው... Voxide ASR በመገናኘት ላይ' : 'Listening... Streaming audio to Voxide engine',
      transcript: '',
      audioLevel: 0.8,
    });

    cleanupSessionRef.current = simulateVoxideAudioSession(
      preset,
      (statusUpdate) => {
        setSessionState(statusUpdate.status);
        setStreamInfo((prev) => ({
          ...prev,
          message: statusUpdate.message,
          transcript: statusUpdate.transcript || prev.transcript,
          audioLevel: statusUpdate.audioLevel ?? prev.audioLevel,
        }));
      },
      (payload) => {
        // Dispatch structured JSON payload to state
        processVoicePayload(payload);
        setTimeout(() => {
          setSessionState('idle');
          setStreamInfo({
            message: isAmharic ? 'ድምፅዎ በተሳካ ሁኔታ ተመዝግቧል!' : 'Voice transaction logged successfully!',
            transcript: '',
            audioLevel: 0,
          });
        }, 3000);
      }
    );
  };

  // Simulation Fallback 1: Natural language text parsing
  const handleSimulateTextSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const parsed = parseVoiceInputText(customText, language);
    processVoicePayload(parsed);
    setCustomText('');
  };

  // Simulation Fallback 2: Direct raw JSON payload submission
  const handleJsonSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput);
      processVoicePayload(parsed);
    } catch (err) {
      alert('Invalid JSON structure: ' + err.message);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl">
      {/* Background ambient glowing accent */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Radio className="w-3 h-3 animate-pulse" />
              {isAmharic ? 'የድምፅ ግብይት ምዝገባ' : 'Voice Transaction Stream'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Payload: &#123;action, item, quantity, amount, language&#125;
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            {isAmharic ? 'Voxide የንግድ ድምፅ ረዳት' : 'Voxide Audio Stream Logger'}
          </h2>
        </div>

        {/* Engine status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              sessionState === 'listening'
                ? 'bg-rose-500 animate-ping'
                : sessionState === 'processing'
                ? 'bg-amber-400 animate-pulse'
                : sessionState === 'success'
                ? 'bg-emerald-400'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-slate-300 font-medium">
            {sessionState === 'listening'
              ? (isAmharic ? 'ድምፅ እየቀዳ ነው...' : 'Audio Streaming...')
              : sessionState === 'processing'
              ? (isAmharic ? 'ትርጉም እየተሰራ ነው...' : 'ASR Processing...')
              : sessionState === 'success'
              ? (isAmharic ? 'ተሳክቷል' : 'Intent Extracted')
              : (isAmharic ? 'Voxide ዝግጁ' : 'Voxide Ready')}
          </span>
        </div>
      </div>

      {/* Main Mic Interactive Area */}
      <div className="flex flex-col items-center justify-center py-6 relative z-10">
        <div className="relative flex items-center justify-center">
          {/* Animated pulse rings during active listening */}
          {sessionState === 'listening' && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-rose-500/30 animate-pulse-ring" />
              <div className="absolute w-44 h-44 rounded-full bg-rose-500/20 animate-pulse-ring [animation-delay:0.5s]" />
              <div className="absolute w-52 h-52 rounded-full bg-rose-500/10 animate-pulse-ring [animation-delay:1s]" />
            </>
          )}

          {sessionState === 'processing' && (
            <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-indigo-400/50 animate-spin" />
          )}

          {/* Primary Trigger Button */}
          <button
            id="voxide-mic-button"
            onClick={handleMicClick}
            className={`relative group flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full transition-all duration-300 transform active:scale-95 shadow-2xl focus:outline-none ${
              sessionState === 'listening'
                ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 shadow-rose-500/50 scale-105'
                : sessionState === 'processing'
                ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-indigo-500/50'
                : sessionState === 'success'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/50'
                : 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/40 hover:shadow-indigo-500/60 hover:scale-105'
            }`}
            title={sessionState === 'listening' ? 'Click to stop' : 'Click to stream voice'}
          >
            {sessionState === 'listening' ? (
              <div className="flex items-center gap-1">
                <span className="w-1.5 bg-white rounded-full animate-sound-wave-1" />
                <span className="w-1.5 bg-white rounded-full animate-sound-wave-2" />
                <span className="w-1.5 bg-white rounded-full animate-sound-wave-3" />
                <span className="w-1.5 bg-white rounded-full animate-sound-wave-4" />
                <span className="w-1.5 bg-white rounded-full animate-sound-wave-5" />
              </div>
            ) : sessionState === 'processing' ? (
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            ) : sessionState === 'success' ? (
              <CheckCircle2 className="w-11 h-11 text-white animate-bounce" />
            ) : (
              <Mic className="w-11 h-11 text-white group-hover:scale-110 transition-transform duration-200" />
            )}
          </button>
        </div>

        {/* Live Audio & Transcript Feedback */}
        <div className="mt-5 text-center max-w-lg px-4">
          <p className="text-sm font-semibold text-slate-200">{streamInfo.message}</p>
          {streamInfo.transcript && (
            <p className="mt-1.5 text-xs text-indigo-300 font-mono bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-800/40 inline-block">
              "{streamInfo.transcript}"
            </p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {isAmharic
              ? 'ይናገሩ፡ ለምሳሌ «5 ኪሎ ስኳር ተሸጠ 650 ብር» ወይም «የትራንስፖርት ወጪ 300 ብር»'
              : 'Speak naturally: e.g., "Sold 2kg Sugar for 260 ETB" or "Restocked 30kg Teff"'}
          </p>
        </div>
      </div>

      {/* Simulation Fallback Bar: Quick Presets */}
      <div className="mt-4 pt-6 border-t border-slate-800/80 relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isAmharic ? 'የድምፅ ማስመሰያ ፈጣን አዝራሮች' : 'Quick Voice Simulation Fallback'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {isAmharic ? 'ለፈተና ጠቅ ያድርጉ' : 'Click to test real-time state dispatch'}
          </span>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap gap-2">
          {VOXIDE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => runVoiceSimulation(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-left flex items-center gap-2 shadow-sm ${
                preset.language === 'am'
                  ? 'bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 border-emerald-800/40'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${preset.language === 'am' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
              <span>{isAmharic ? preset.labelAm : preset.label}</span>
              <span className="text-[10px] font-mono opacity-60 uppercase">{preset.payload.action}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Fallback: Free-Form Text Input Simulation */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 relative z-10">
        <form onSubmit={handleSimulateTextSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={
                isAmharic
                  ? 'የድምፅ ጽሑፍ አስመስል (ለምሳሌ፡ 2 ኪሎ ስኳር ተሸጠ 260 ብር)...'
                  : 'Simulate spoken transcript (e.g. Sold 2kg Sugar for 260 ETB)...'
              }
              className="w-full bg-slate-800/80 border border-slate-700/70 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 active:scale-95 transition-all whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'ድምፅ አስመስል' : 'Simulate Voice'}</span>
          </button>
        </form>
      </div>

      {/* Expandable Raw JSON Payload Inspector */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 relative z-10">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowJsonEditor((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showJsonEditor ? 'Hide Voxide JSON Payload Inspector' : 'Inspect / Test Voxide JSON Payload'}</span>
            {showJsonEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {lastVoiceEvent && (
            <span className="text-[11px] text-emerald-400 font-mono">
              Last event: {lastVoiceEvent.payload.action.toUpperCase()} ({lastVoiceEvent.payload.item})
            </span>
          )}
        </div>

        {showJsonEditor && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-semibold">Structured Voxide Payload Contract:</span>
              <button
                onClick={handleJsonSubmit}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-sans font-medium"
              >
                Send Payload to Store
              </button>
            </div>
            <textarea
              rows={6}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
