import { VoxideClient } from "@voxide/react";

export const VOXIDE_PUBLISHABLE_KEY =
  import.meta.env.VITE_VOXIDE_API_KEY ||
  "vox_pub_f7a7fd61bf7a6e43e1dcdfdd019a1607e1d3fb2e67d5ff5b";

export const ai = new VoxideClient({
  publicKey: VOXIDE_PUBLISHABLE_KEY,
});

let initPromise = null;

export async function ensureInitialized() {
  if (ai.isInitialized) return ai;
  if (!initPromise) {
    initPromise = ai.init().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}
/**
 * Voxide Voice Integration & Mock Service
 *
 * Provides mock integration ready for Voxide audio stream & structured JSON payload:
 * { "action": "sale" | "stock" | "expense", "item": string, "quantity": number, "amount": number, "language": "am" | "en" }
 */

export const VOXIDE_PRESETS = [
  {
    id: 'sale-sugar-en',
    label: 'Sold 2kg Sugar (260 ETB)',
    labelAm: '2 ኪሎ ስኳር ተሸጠ',
    text: 'Sold 2kg Sugar for 260 ETB',
    language: 'en',
    payload: {
      action: 'sale',
      item: 'Sugar',
      quantity: 2,
      amount: 260,
      language: 'en',
    },
  },
  {
    id: 'sale-sugar-am',
    label: '5 ኪሎ ስኳር ተሸጠ 650 ብር',
    labelAm: '5 ኪሎ ስኳር ተሸጠ 650 ብር',
    text: '5 ኪሎ ስኳር ተሸጠ 650 ብር',
    language: 'am',
    payload: {
      action: 'sale',
      item: 'ስኳር',
      quantity: 5,
      amount: 650,
      language: 'am',
    },
  },
  {
    id: 'sale-oil-en',
    label: 'Sold 3L Cooking Oil (1,950 ETB)',
    labelAm: '3 ሊትር ዘይት ተሸጠ',
    text: 'Sold 3 Liters Cooking Oil for 1950 ETB',
    language: 'en',
    payload: {
      action: 'sale',
      item: 'Cooking Oil',
      quantity: 3,
      amount: 1950,
      language: 'en',
    },
  },
  {
    id: 'stock-teff-en',
    label: 'Restocked 30kg Teff Flour',
    labelAm: '30 ኪሎ ጤፍ ተጨመረ',
    text: 'Restocked 30kg Teff Flour into inventory',
    language: 'en',
    payload: {
      action: 'stock',
      item: 'Teff Flour',
      quantity: 30,
      amount: 0,
      language: 'en',
    },
  },
  {
    id: 'stock-coffee-am',
    label: '15 ኪሎ ቡና ገባ',
    labelAm: '15 ኪሎ ቡና ገባ',
    text: '15 ኪሎ ቡና ወደ መጋዘን ገባ',
    language: 'am',
    payload: {
      action: 'stock',
      item: 'ቡና',
      quantity: 15,
      amount: 0,
      language: 'am',
    },
  },
  {
    id: 'expense-transport-en',
    label: 'Transport Expense (350 ETB)',
    labelAm: 'የትራንስፖርት ወጪ 350 ብር',
    text: 'Transport and delivery expense 350 ETB',
    language: 'en',
    payload: {
      action: 'expense',
      item: 'Transport & Delivery',
      quantity: 1,
      amount: 350,
      language: 'en',
    },
  },
  {
    id: 'expense-electricity-am',
    label: 'የኤሌክትሪክ ክፍያ 520 ብር',
    labelAm: 'የኤሌክትሪክ ክፍያ 520 ብር',
    text: 'የሱቅ ኤሌክትሪክ ክፍያ 520 ብር ተከፈለ',
    language: 'am',
    payload: {
      action: 'expense',
      item: 'የኤሌክትሪክ ክፍያ',
      quantity: 1,
      amount: 520,
      language: 'am',
    },
  },
  {
    id: 'sale-soap-en',
    label: 'Sold 5 Pcs Sunlight Soap (225 ETB)',
    labelAm: '5 ሳሙና ተሸጠ',
    text: 'Sold 5 Pcs Sunlight Soap for 225 ETB',
    language: 'en',
    payload: {
      action: 'sale',
      item: 'Sunlight Soap',
      quantity: 5,
      amount: 225,
      language: 'en',
    },
  },
];

/**
 * Intelligent heuristic parser for simulation text fallback
 */
export function parseVoiceInputText(input, defaultLanguage = 'en') {
  const text = (input || '').trim();
  const isAmharic = /[\u1200-\u137F]/.test(text) || defaultLanguage === 'am';
  const language = isAmharic ? 'am' : 'en';

  const lower = text.toLowerCase();

  // Detect Action
  let action = 'sale';
  if (
    lower.includes('expense') ||
    lower.includes('spent') ||
    lower.includes('bought') ||
    lower.includes('bill') ||
    text.includes('ወጪ') ||
    text.includes('ክፍያ') ||
    text.includes('ተከፈለ')
  ) {
    action = 'expense';
  } else if (
    lower.includes('stock') ||
    lower.includes('restock') ||
    lower.includes('add') ||
    lower.includes('received') ||
    text.includes('ገባ') ||
    text.includes('ተጨመረ') ||
    text.includes('አስገባ')
  ) {
    action = 'stock';
  }

  // Extract Numbers
  const numbers = text.match(/\d+(\.\d+)?/g);
  let quantity = 1;
  let amount = 0;

  if (action === 'expense') {
    if (numbers && numbers.length > 0) {
      amount = parseFloat(numbers[0]);
    }
  } else if (action === 'stock') {
    if (numbers && numbers.length > 0) {
      quantity = parseFloat(numbers[0]);
    }
  } else {
    // Sale: first number usually quantity, second number usually amount
    if (numbers && numbers.length >= 2) {
      quantity = parseFloat(numbers[0]);
      amount = parseFloat(numbers[1]);
    } else if (numbers && numbers.length === 1) {
      // If single number, check if it says ETB/ብር (then amount) or kg/pcs (quantity)
      if (lower.includes('etb') || text.includes('ብር')) {
        amount = parseFloat(numbers[0]);
        quantity = 1;
      } else {
        quantity = parseFloat(numbers[0]);
      }
    }
  }

  // Extract Item name
  let item = 'General Item';
  if (lower.includes('sugar') || text.includes('ስኳር')) {
    item = isAmharic ? 'ስኳር' : 'Sugar';
  } else if (lower.includes('teff') || text.includes('ጤፍ')) {
    item = isAmharic ? 'ጤፍ' : 'Teff Flour';
  } else if (lower.includes('oil') || text.includes('ዘይት')) {
    item = isAmharic ? 'የምግብ ዘይት' : 'Cooking Oil';
  } else if (lower.includes('coffee') || text.includes('ቡና')) {
    item = isAmharic ? 'ቡና' : 'Ethiopian Coffee';
  } else if (lower.includes('soap') || text.includes('ሳሙና')) {
    item = isAmharic ? 'ሳሙና' : 'Sunlight Soap';
  } else if (lower.includes('flour') || text.includes('ዱቄት')) {
    item = isAmharic ? 'የስንዴ ዱቄት' : 'Wheat Flour';
  } else {
    // Clean text as best effort
    const cleaned = text
      .replace(/sold|sale|expense|restocked|stock|for|etb|ብር|ተሸጠ|ወጪ|ተጨመረ|\d+(\.\d+)?/gi, '')
      .replace(/kg|pcs|liters|ኪሎ|ሊትር/gi, '')
      .trim();
    if (cleaned.length > 1) {
      item = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  return {
    action,
    item,
    quantity,
    amount,
    language,
    rawTranscript: text,
  };
}

/**
 * Mock Voxide Audio Streamer
 * Simulates real-time microphone stream ingestion, Voxide ASR token generation,
 * and structured intent classification.
 */
export function simulateVoxideAudioSession(preset, onStatusChange, onComplete) {
  onStatusChange({
    status: 'listening',
    message: 'Streaming audio to Voxide engine...',
    audioLevel: 0.85,
  });

  const timer1 = setTimeout(() => {
    onStatusChange({
      status: 'processing',
      message: 'Voxide ASR: Decoding Ethiopian speech stream...',
      transcript: preset.text,
      audioLevel: 0.3,
    });
  }, 1200);

  const timer2 = setTimeout(() => {
    onStatusChange({
      status: 'success',
      message: 'Structured intent extracted successfully',
      payload: preset.payload,
      confidence: 0.96,
      latencyMs: 340,
    });
    if (onComplete) onComplete(preset.payload);
  }, 2200);

  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
  };
}

/**
 * Ready interface for live Voxide WebSocket connection
 * Can be pointed to a real Voxide Audio stream URL
 */
export class VoxideStreamClient {
  constructor(endpointUrl = 'wss://api.voxide.ai/v1/stream') {
    this.endpointUrl = endpointUrl;
    this.ws = null;
    this.isConnected = false;
  }

  connect(callbacks) {
    // Ready for live WebSocket audio streaming
    console.log(`[VoxideClient] Prepared connection to ${this.endpointUrl}`);
    return {
      connected: false,
      mode: 'mock_ready',
    };
  }

  sendAudioChunk(buffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(buffer);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
