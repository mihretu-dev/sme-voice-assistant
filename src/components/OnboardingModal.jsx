import React, { useState } from 'react';
import { X, Mic, LayoutDashboard, Package, Volume2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

const STEPS = [
  {
    icon: Mic,
    title: 'Voice-First Ledger',
    titleAm: 'የድምፅ ቀዳሚ ሂሳብ',
    body: 'Click the mic orb to speak a sale, expense, or restock in English or Amharic. BirrVoice will log it instantly.',
    bodyAm: 'ሽያጭ፣ ወጪ ወይም ዳግም ሙሌት ለመናገር የማይክሮፎን ዙሩን ይጫኑ። BirrVoice ወዲያው ይመዘግበዋል።',
    accent: '#14b8a6',
  },
  {
    icon: LayoutDashboard,
    title: 'Real-Time Dashboard',
    titleAm: 'እውነተኛ ጊዜ ዳሽቦርድ',
    body: 'See your daily inflow, outflow and net cash margin update live. All data persists in your browser.',
    bodyAm: 'ዕለታዊ ገቢ፣ ወጪ እና የተጣራ ጥሬ ገንዘብ ቀጥታ ሲዘምን ይመልከቱ። መረጃዎ በአሳሽዎ ውስጥ ይቀመጣል።',
    accent: '#14b8a6',
  },
  {
    icon: Package,
    title: 'Inventory Tracking',
    titleAm: 'የክምችት ክትትል',
    body: 'Your stock catalog updates automatically when you log sales. Get instant alerts for low or depleted items.',
    bodyAm: 'ሽያጭ ሲመዘግቡ የክምችት ዝርዝርዎ በራስ-ሰር ይዘምናል። ለዝቅተኛ ዕቃዎች ፈጣን ማስጠንቀቂያ ይደርሳዎታል።',
    accent: '#f59e0b',
  },
  {
    icon: Volume2,
    title: 'Try a Voice Preset',
    titleAm: 'የድምፅ ቅድሚያ ሁኔታ ይሞክሩ',
    body: 'Open "Testing Tools" in the Voice Logger and click a preset chip to simulate a transaction instantly.',
    bodyAm: 'በድምፅ ገጽ ውስጥ "የፈተና መሳሪያዎችን" ይክፈቱና የናሙና ቺፕ በመጫን ወዲያው ይሞክሩ።',
    accent: '#14b8a6',
  },
];

export default function OnboardingModal({ onDone }) {
  const { language, setLanguage } = useBusiness();
  const [step, setStep] = useState(0);
  const isAmharic = language === 'am';
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const StepIcon = current.icon;

  const handleDone = () => {
    localStorage.setItem('birrvoice-onboarded', '1');
    onDone();
  };

  const handleSkip = () => {
    localStorage.setItem('birrvoice-onboarded', '1');
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-panel border border-theme rounded-2xl shadow-2xl p-6 modal-enter">
        {/* Skip */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-t4 hover:text-t2 transition-colors flex items-center gap-1 text-xs"
          aria-label={isAmharic ? 'መመሪያውን ዝለል' : 'Skip onboarding'}
        >
          <span className="text-[11px] text-t4 hover:text-t2">{isAmharic ? 'ዝለል' : 'Skip'}</span>
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Language toggle */}
        <div className="absolute top-4 left-4 flex items-center gap-1 bg-surface rounded-lg p-0.5 border border-theme">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
              language === 'en' ? 'bg-raised text-t1' : 'text-t4'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('am')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
              language === 'am' ? 'bg-raised text-t1' : 'text-t4'
            }`}
          >
            አማ
          </button>
        </div>

        {/* Icon */}
        <div className="flex flex-col items-center text-center mt-6 step-enter" key={step}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            style={{
              backgroundColor: current.accent + '20',
              border: `1.5px solid ${current.accent}40`,
            }}
          >
            <StepIcon className="w-8 h-8" style={{ color: current.accent }} />
          </div>

          <h3 className="text-base font-bold text-t1 mb-2">
            {isAmharic ? current.titleAm : current.title}
          </h3>
          <p className="text-xs text-t3 leading-relaxed max-w-[260px]">
            {isAmharic ? current.bodyAm : current.body}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all ${
                i === step ? 'w-5 h-1.5 bg-teal' : 'w-1.5 h-1.5 bg-raised'
              }`}
              style={{ backgroundColor: i === step ? '#14b8a6' : undefined }}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-5 gap-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-t3 hover:text-t1 bg-raised border border-theme transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {isAmharic ? 'ተመለስ' : 'Back'}
          </button>

          {isLast ? (
            <button
              onClick={handleDone}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isAmharic ? 'ጀምር' : "Let's Go!"}
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all active:scale-95 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
            >
              {isAmharic ? 'ቀጣይ' : 'Next'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
