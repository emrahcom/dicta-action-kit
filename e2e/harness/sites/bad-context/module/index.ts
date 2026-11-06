// Arguments that are not an object, which only the context check finds.

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
        type: "string",
        properties: {
          id: { type: "string" },
          note: { type: ["string", "null"] },
        },
        required: ["id"],
      },
      confirm: async () => "Change the note",
      run: async () => {},
    },
  },
};

export default shop;
