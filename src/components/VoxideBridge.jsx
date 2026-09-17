import { useEffect } from "react";
import { VoxideWidget } from "@voxide/react";
import { ai, VOXIDE_PUBLISHABLE_KEY } from "../services/voxideVoiceService";
import { useBusiness } from "../context/BusinessContext";

export function VoxideBridge() {
  const { processVoicePayload, inventory, language } = useBusiness();
  const apiKey =
    import.meta.env.VITE_VOXIDE_API_KEY ||
    "vox_pub_f7a7fd61bf7a6e43e1dcdfdd019a1607e1d3fb2e67d5ff5b";

  useEffect(() => {
    ai.bindState(() => ({
      commodities: inventory.map((i) => ({ name: i.name, nameAm: i.nameAm })),
      language,
    }));

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
          console.log("VOXIDE CALLED logSale:", { item, quantity, amount, lang });
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
          console.log("VOXIDE CALLED logExpense:", { item, amount, lang });
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
          console.log("VOXIDE CALLED restockItem:", { item, quantity, lang });
          return processVoicePayload({ action: "stock", item, quantity, amount: 0, language: lang });
        },
      },
    });
  }, [inventory, language, processVoicePayload]);

  return <VoxideWidget client={ai} apiKey={apiKey} publicKey={apiKey} />;
}