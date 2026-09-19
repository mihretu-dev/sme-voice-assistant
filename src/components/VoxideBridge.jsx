import { useEffect } from "react";
import { ai, ensureInitialized } from "../services/voxideVoiceService";
import { useBusiness } from "../context/BusinessContext";

/**
 * Headless Voxide Bridge
 * Registers schema tools and binds real-time state with VoxideClient.
 * Returns null to eliminate the floating pill widget in favor of the unified central mic button.
 */
export function VoxideBridge() {
  const { processVoicePayload, inventory, language } = useBusiness();

  useEffect(() => {
    // Proactively initialize Voxide client
    ensureInitialized().catch((err) => {
      console.warn("[Voxide] Background initialization notice:", err);
    });

    // Bind real-time inventory catalog and language context to Voxide
    ai.bindState(() => ({
      commodities: inventory.map((i) => ({ name: i.name, nameAm: i.nameAm })),
      language,
    }));

    // Register capability handlers for Voxide tool calling
    ai.register({
      logSale: {
        description: "Log a sale of a commodity by quantity and total amount in Birr.",
        params: {
          item: { type: "string", required: true },
          quantity: { type: "number", required: true },
          amount: { type: "number" },
          language: { type: "string" },
        },
        handler: async ({ item, quantity, amount = 0, language: lang = "en" }) => {
          console.log("[Voxide Live] logSale called:", { item, quantity, amount, lang });
          return processVoicePayload({ action: "sale", item, quantity, amount, language: lang });
        },
      },
      logExpense: {
        description: "Log a business expense.",
        params: {
          item: { type: "string", required: true },
          amount: { type: "number", required: true },
          language: { type: "string" },
        },
        handler: async ({ item, amount, language: lang = "en" }) => {
          console.log("[Voxide Live] logExpense called:", { item, amount, lang });
          return processVoicePayload({ action: "expense", item, quantity: 1, amount, language: lang });
        },
      },
      restockItem: {
        description: "Restock an inventory item by quantity.",
        params: {
          item: { type: "string", required: true },
          quantity: { type: "number", required: true },
          language: { type: "string" },
        },
        handler: async ({ item, quantity, language: lang = "en" }) => {
          console.log("[Voxide Live] restockItem called:", { item, quantity, lang });
          return processVoicePayload({ action: "stock", item, quantity, amount: 0, language: lang });
        },
      },
    });
  }, [inventory, language, processVoicePayload]);

  // Headless integration: unified mic in VoiceLogger.jsx controls recording
  return null;
}