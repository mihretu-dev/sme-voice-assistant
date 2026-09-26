import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ai,
  ensureInitialized,
  VOXIDE_PRESETS,
  simulateVoxideAudioSession,
  parseVoiceInputText,
} from '../services/voxideVoiceService';
import { useVoxideVoice } from '@voxide/react';
import MicPermissionModal from './MicPermissionModal';

// Haptic feedback helper (mobile vibration API)
function haptic(pattern = [30]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// Heights (px) for the idle static visualizer bars
const BAR_HEIGHTS = [10, 22, 14, 26, 8, 18, 12];

export default function VoiceLogger({ compact = false }) {
  const { language, processVoicePayload, lastVoiceEvent, showToast } = useBusiness();
  const isAmharic = language === 'am';
  const voxide = useVoxideVoice(ai);

  const [simState, setSimState] = useState('idle');
  const [simTranscript, setSimTranscript] = useState('');
  const [recentSuccess, setRecentSuccess] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [activePresetId, setActivePresetId] = useState(null);
  const [customText, setCustomText] = useState('');
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify({ action: 'sale', item: 'Sugar', quantity: 3, amount: 390, language: 'en' }, null, 2)
  );
  const [micModalState, setMicModalState] = useState(null); // null | 'prompt' | 'denied' | 'usage_limit' | 'network'
  const cleanupSessionRef = useRef(null);

  useEffect(() => {
    return () => { if (cleanupSessionRef.current) cleanupSessionRef.current(); };
  }, []);

  useEffect(() => {
    if (lastVoiceEvent) {
      setRecentSuccess(true);
      const timer = setTimeout(() => setRecentSuccess(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [lastVoiceEvent]);

  // Derive unified effective state
  let effectiveState = 'idle';
  if (recentSuccess)                                                        effectiveState = 'success';
  else if (simState !== 'idle')                                             effectiveState = simState;
  else if (voxide.status === 'listening' || voxide.status === 'speaking')  effectiveState = 'listening';
  else if (['connecting','thinking','executing'].includes(voxide.status))   effectiveState = 'processing';

  const isBusy = effectiveState === 'listening' || effectiveState === 'processing';

  const connectVoice = async () => {
    haptic([20]);
    const isListening = ['listening','connecting','thinking','speaking','executing'].includes(voxide.status);
    try {
      await ensureInitialized();
      if (isListening) {
        await voxide.disconnect();
      } else {
        await voxide.connect();
      }
      setMicModalState(null);
    } catch (err) {
      console.error('Voxide activation error:', err);
      const msg = err?.message?.toLowerCase() ?? '';
      if (msg.includes('denied') || msg.includes('notallowed')) {
        setMicModalState('denied');
      } else if (msg.includes('usage') || msg.includes('limit') || msg.includes('quota')) {
        setMicModalState('usage_limit');
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed')) {
        setMicModalState('network');
      } else {
        // Generic fallback — show warning and use simulation
        showToast(
          isAmharic
            ? 'የቀጥታ ድምፅ ግንኙነት አልተሳካም፤ ሲሙሌሽን ሁናቴ ጥቅም ላይ...'
            : 'Live audio unavailable. Using simulation mode.',
          'warning'
        );
        const langPresets = VOXIDE_PRESETS.filter(p => p.language === language);
        runVoiceSimulation(langPresets[0] || VOXIDE_PRESETS[0]);
      }
    }
  };

  const handleMicClick = async () => {
    if (cleanupSessionRef.current) { cleanupSessionRef.current(); cleanupSessionRef.current = null; }
    if (simState !== 'idle') { setSimState('idle'); setSimTranscript(''); setActivePresetId(null); return; }
    // Show permission prompt before connecting for the first time
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
    // Fall back to simulation preset
    const langPresets = VOXIDE_PRESETS.filter(p => p.language === language);
    runVoiceSimulation(langPresets[0] || VOXIDE_PRESETS[0]);
  };

  const runVoiceSimulation = (preset) => {
    if (cleanupSessionRef.current) cleanupSessionRef.current();
    setSimState('listening');
    setSimTranscript('');
    setActivePresetId(preset.id);

    cleanupSessionRef.current = simulateVoxideAudioSession(
      preset,
      (statusUpdate) => {
        if (statusUpdate.status === 'listening')   setSimState('listening');
        if (statusUpdate.status === 'processing')  setSimState('processing');
        if (statusUpdate.transcript)               setSimTranscript(statusUpdate.transcript);
      },
      (payload) => {
        processVoicePayload(payload);
        haptic([20, 50, 20]); // success haptic pattern
        setSimState('idle');
        setSimTranscript('');
        setActivePresetId(null);
      }
    );
  };

  const handleSimulateTextSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    processVoicePayload(parseVoiceInputText(customText, language));
    setCustomText('');
  };

  const handleJsonSubmit = (e) => {
    e.preventDefault();
    try { processVoicePayload(JSON.parse(jsonInput)); }
    catch (err) { alert('Invalid JSON: ' + err.message); }
  };

  const statusMessage =
    effectiveState === 'listening'  ? (isAmharic ? 'ድምፅ በማዳመጥ ላይ... ለማቆም ይጫኑ' : 'Listening… click to stop')
    : effectiveState === 'processing' ? (isAmharic ? 'በ Voxide ትርጉም እየተከናወነ ነው...' : 'Transcribing via Voxide…')
    : effectiveState === 'success'    ? (isAmharic ? 'ግብይት ተመዝግቧል!' : 'Transaction recorded!')
    : (isAmharic ? 'ድምፅ ለመቅረጽ ይጫኑ' : 'Say a sale, expense or restock');

  // Orb class composition
  const orbBase = 'flex items-center justify-center w-20 h-20 rounded-full transition-all duration-200 active:scale-95';
  const orbStyle =
    effectiveState === 'listening'  ? `${orbBase} bg-red-600 text-white scale-105 animate-listening-glow`
    : effectiveState === 'processing' ? `${orbBase} bg-panel border-2 border-teal/60 text-teal`
    : effectiveState === 'success'    ? `${orbBase} bg-emerald-600 text-white ring-2 ring-emerald-400/30`
    : `${orbBase} text-white animate-orb-breathe`;
  const orbInlineStyle = effectiveState === 'idle'
    ? { background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }
    : {};


  return (
    <>
    <MicPermissionModal
      isOpen={micModalState !== null}
      error={micModalState === 'prompt' ? null : micModalState}
      onAllow={handleMicAllow}
      onDeny={handleMicDeny}
      language={language}
    />
    <div className={`rounded-2xl bg-panel border border-theme relative overflow-hidden transition-colors duration-300 ${compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'}`}>
      {/* Indigo ambient glow behind orb */}
      <div className="absolute inset-0 glow-voice" />

      {/* Centred voice panel */}
      <div className="relative flex flex-col items-center justify-center text-center">

        {/* Visualizer bars */}
        <div className="flex items-end gap-[3px] h-7 mb-4">
          {BAR_HEIGHTS.map((h, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-all ${
                isBusy
                  ? `bg-teal animate-audio-bar-${i + 1}`
                  : 'bg-teal/30'
              }`}
              style={{ height: isBusy ? undefined : `${h}px`, backgroundColor: isBusy ? 'var(--c-teal)' : undefined }}
            />
          ))}
        </div>

        {/* Mic Orb */}
        <button
          id="voxide-mic-button"
          onClick={handleMicClick}
          className={orbStyle}
          style={orbInlineStyle}
          title={effectiveState === 'listening' ? 'Click to finish' : 'Click to start voice input'}
        >
          {effectiveState === 'listening' ? (
            /* Live audio bars inside orb */
            <div className="flex items-end gap-[3px] h-7">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`w-1 rounded-full bg-white animate-audio-bar-${n}`} />
              ))}
            </div>
          ) : effectiveState === 'processing' ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : effectiveState === 'success' ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>

        {/* Status + transcript */}
        <div className="mt-4 space-y-1.5">
          <p className={`text-sm font-medium transition-colors ${
            effectiveState === 'listening'  ? 'text-red-400'
            : effectiveState === 'processing' ? 'text-indigo-400'
            : effectiveState === 'success'    ? 'text-emerald-400'
            : 'text-t2'
          }`}>
            {statusMessage}
          </p>

          {simTranscript && (
            <div className="text-xs text-t2 font-mono bg-surface px-3 py-1.5 rounded-lg border border-theme inline-block max-w-xs truncate">
              "{simTranscript}"
            </div>
          )}

          <p className="text-[11px] text-t3">
            {isAmharic
              ? 'ምሳሌ፡ «5 ኪሎ ስኳር ተሸጠ 650 ብር» ወይም «የትራንስፖርት ወጪ 300 ብር»'
              : 'Say: "Sold 2kg Sugar for 260 ETB" or "Transport expense 300 ETB"'}
          </p>
        </div>
      </div>

      {/* ── Collapsible testing tools ── */}
      <div className="mt-6 pt-4 border-t border-theme">
        <button
          type="button"
          onClick={() => setShowTools(prev => !prev)}
          className="w-full flex items-center justify-between text-[11px] font-semibold text-t3 hover:text-t1 uppercase tracking-wider transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isAmharic ? 'የፈተና መሳሪያዎች' : 'Testing tools'}
            <span className="px-1.5 py-0.5 rounded bg-raised border border-theme text-[10px] font-mono">
              {VOXIDE_PRESETS.length}
            </span>
          </span>
          {showTools ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTools && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-surface border border-theme space-y-3.5">
            {/* Judge banner */}
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-start gap-2.5">
              <span className="text-amber-400 font-bold text-xs shrink-0 mt-0.5">⚡</span>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                <strong className="font-semibold text-amber-300">Judge Testing Note:</strong>{' '}
                Click the mic above for live voice, or click any preset chip below to test instant parsing without exhausting live credits.
              </p>
            </div>

            {/* Preset chips — 2 cols mobile, 4 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {VOXIDE_PRESETS.map((preset) => {
                const isSale    = preset.payload.action === 'sale';
                const isExpense = preset.payload.action === 'expense';
                const isActive  = activePresetId === preset.id;
                const accentBorder = isSale    ? 'border-l-emerald-500/60'
                                   : isExpense ? 'border-l-rose-500/60'
                                   :             'border-l-sky-500/60';
                return (
                  <button
                    key={preset.id}
                    onClick={() => runVoiceSimulation(preset)}
                    className={`flex items-between flex-col p-2.5 rounded-lg bg-panel hover:bg-raised border border-l-2 text-left transition-all group ${accentBorder} ${
                      isActive ? 'ring-1 ring-indigo-500/50 border-indigo-700/40' : 'border-theme'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold border ${
                        isSale    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50'
                        : isExpense ? 'text-rose-400 bg-rose-950/40 border-rose-800/50'
                        :             'text-sky-400 bg-sky-950/40 border-sky-800/50'
                      }`}>
                        {preset.payload.action}
                      </span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                    </div>
                    <div className="text-xs font-medium text-t1 group-hover:text-t1 truncate w-full">
                      {isAmharic ? preset.labelAm : preset.label}
                    </div>
                    <div className="text-[10px] text-t3 font-mono mt-0.5">
                      {preset.language.toUpperCase()} •{' '}
                      {preset.payload.amount ? `ETB ${preset.payload.amount}` : preset.payload.item}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Freeform text input */}
            <div className="pt-3 border-t border-theme">
              <form onSubmit={handleSimulateTextSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={
                    isAmharic
                      ? 'ምሳሌ፡ 2 ኪሎ ስኳር ተሸጠ 260 ብር...'
                      : 'e.g. Sold 2kg Sugar for 260 ETB...'
                  }
                  className="flex-1 bg-panel border border-theme rounded-lg px-3 py-2 text-xs text-t1 placeholder-t4 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-raised hover:bg-hover text-t1 text-xs font-semibold border border-theme transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Send className="w-3 h-3 text-t3" />
                  <span>{isAmharic ? 'ፈትሽ' : 'Simulate'}</span>
                </button>
              </form>
            </div>

            {/* JSON inspector */}
            <div className="pt-2.5 border-t border-theme flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowJsonEditor(prev => !prev)}
                className="flex items-center gap-1.5 text-t3 hover:text-t1 transition-colors"
              >
                <Code className="w-3.5 h-3.5" />
                <span>{showJsonEditor ? 'Hide JSON Payload' : 'Inspect JSON Payload'}</span>
                {showJsonEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {lastVoiceEvent && (
                <span className="text-[11px] text-t3 font-mono">
                  Last:{' '}
                  <span className="text-t1 font-semibold">
                    {lastVoiceEvent.payload.action.toUpperCase()}
                  </span>{' '}
                  ({lastVoiceEvent.payload.item})
                </span>
              )}
            </div>

            {showJsonEditor && (
              <div className="p-3.5 rounded-lg bg-surface border border-theme text-xs font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-t3 text-[11px]">Structured Payload Editor:</span>
                  <button
                    onClick={handleJsonSubmit}
                    className="px-2.5 py-1 rounded bg-raised hover:bg-hover text-t1 text-[11px] font-sans border border-theme transition-colors"
                  >
                    Send JSON
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full bg-panel border border-theme rounded p-2 text-t2 font-mono text-xs focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}