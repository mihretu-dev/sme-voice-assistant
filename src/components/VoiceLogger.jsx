import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Send,
  Code,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  SlidersHorizontal,
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

  const [sessionState, setSessionState] = useState('idle');
  const [streamInfo, setStreamInfo] = useState({
    message: isAmharic ? 'ድምፅ ለመመዝገብ ቁልፉን ይጫኑ' : 'Say a sale, expense or restock',
    transcript: '',
  });

  const [showTools, setShowTools] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      { action: 'sale', item: 'Sugar', quantity: 3, amount: 390, language: 'en' },
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

  const handleMicClick = () => {
    if (sessionState === 'listening' || sessionState === 'processing') {
      if (cleanupSessionRef.current) cleanupSessionRef.current();
      setSessionState('idle');
      setStreamInfo({
        message: isAmharic ? 'ምዝገባው ተቋርጧል' : 'Recording stopped.',
        transcript: '',
      });
      return;
    }

    const langPresets = VOXIDE_PRESETS.filter((p) => p.language === language);
    const chosenPreset = langPresets[Math.floor(Math.random() * langPresets.length)] || VOXIDE_PRESETS[0];
    runVoiceSimulation(chosenPreset);
  };

  const runVoiceSimulation = (preset) => {
    if (cleanupSessionRef.current) cleanupSessionRef.current();

    setSessionState('listening');
    setStreamInfo({
      message: isAmharic ? 'ድምፅ በማዳመጥ ላይ...' : 'Listening to speech stream...',
      transcript: '',
    });

    cleanupSessionRef.current = simulateVoxideAudioSession(
      preset,
      (statusUpdate) => {
        setSessionState(statusUpdate.status);
        setStreamInfo((prev) => ({
          ...prev,
          message: statusUpdate.message,
          transcript: statusUpdate.transcript || prev.transcript,
        }));
      },
      (payload) => {
        processVoicePayload(payload);
        setTimeout(() => {
          setSessionState('idle');
          setStreamInfo({
            message: isAmharic ? 'ግብይቱ በተሳካ ሁኔታ ተመዝግቧል' : 'Say a sale, expense or restock',
            transcript: '',
          });
        }, 2500);
      }
    );
  };

  const handleSimulateTextSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const parsed = parseVoiceInputText(customText, language);
    processVoicePayload(parsed);
    setCustomText('');
  };

  const handleJsonSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonInput);
      processVoicePayload(parsed);
    } catch (err) {
      alert('Invalid JSON structure: ' + err.message);
    }
  };

  const isBusy = sessionState === 'listening' || sessionState === 'processing';

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800/90 p-6 sm:p-8">
      {/* Calm centered voice panel */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-[3px] h-6 mb-3">
          {[10, 22, 14, 26, 8, 18, 12].map((h, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full bg-indigo-400 transition-all ${isBusy ? 'animate-pulse' : 'opacity-40'}`}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        <button
          id="voxide-mic-button"
          onClick={handleMicClick}
          className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-150 active:scale-95 ${
            sessionState === 'listening'
              ? 'bg-red-600 text-white'
              : sessionState === 'processing'
              ? 'bg-slate-800 text-indigo-400'
              : sessionState === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
          title={sessionState === 'listening' ? 'Click to stop recording' : 'Click to start recording'}
        >
          {sessionState === 'processing' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : sessionState === 'success' ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        <div className="mt-3">
          <div className="text-xs text-slate-400">{streamInfo.message}</div>
          {streamInfo.transcript && (
            <div className="mt-1.5 text-xs text-slate-300 font-mono bg-slate-950 px-3 py-1 rounded border border-slate-800 inline-block">
              "{streamInfo.transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Collapsed testing tools */}
      <div className="mt-6 pt-4 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => setShowTools((prev) => !prev)}
          className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-slate-200 uppercase tracking-wider transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isAmharic ? 'የፈተና መሳሪያዎች' : 'Testing tools'}
          </span>
          {showTools ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTools && (
          <div className="mt-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {VOXIDE_PRESETS.map((preset) => {
                const isSale = preset.payload.action === 'sale';
                const isExpense = preset.payload.action === 'expense';
                return (
                  <button
                    key={preset.id}
                    onClick={() => runVoiceSimulation(preset)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800/90 text-left transition-colors group"
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {isAmharic ? preset.labelAm : preset.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {preset.language.toUpperCase()} • {preset.payload.item}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold border shrink-0 ${
                        isSale
                          ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50'
                          : isExpense
                          ? 'text-rose-400 bg-rose-950/40 border-rose-800/50'
                          : 'text-sky-400 bg-sky-950/40 border-sky-800/50'
                      }`}
                    >
                      {preset.payload.action}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-800/60">
              <form onSubmit={handleSimulateTextSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={
                    isAmharic
                      ? 'የድምፅ ጽሑፍ አስመስል፡ 2 ኪሎ ስኳር ተሸጠ 260 ብር...'
                      : 'Type spoken sentence simulation: e.g. Sold 2kg Sugar for 260 ETB...'
                  }
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-600 transition-colors"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Send className="w-3 h-3 text-slate-400" />
                  <span>{isAmharic ? 'ፈትሽ' : 'Simulate'}</span>
                </button>
              </form>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowJsonEditor((prev) => !prev)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Code className="w-3.5 h-3.5 text-slate-400" />
                <span>{showJsonEditor ? 'Hide JSON Contract Payload' : 'Inspect Raw JSON Payload Contract'}</span>
                {showJsonEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {lastVoiceEvent && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Last Dispatched: <span className="text-slate-300 font-semibold">{lastVoiceEvent.payload.action.toUpperCase()}</span> ({lastVoiceEvent.payload.item})
                </span>
              )}
            </div>

            {showJsonEditor && (
              <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-[11px]">Structured Payload Editor:</span>
                  <button
                    onClick={handleJsonSubmit}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans border border-slate-700"
                  >
                    Send Direct JSON
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-300 font-mono text-xs focus:outline-none focus:border-slate-700"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}