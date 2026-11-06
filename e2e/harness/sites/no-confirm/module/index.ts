// A write capability without confirm.

import { type CapabilityModule, dictaCapabilities } from "dicta-action-js";

const shop: CapabilityModule = {
  site: { name: "Shop", desc: "A small shop." },
  state: { desc: "Nothing.", run: async () => ({}) },
  capabilities: {
    ...dictaCapabilities,
    "items.note": {
      level: "write",
      desc: "Sets or removes an item's note.",
      args: {
        type: "object",
        properties: {
          id: { type: "string" },
          note: { type: ["string", "null"] },
        },
        required: ["id"],
      },
      run: async () => {},
    },
  },
};

export default shop;
