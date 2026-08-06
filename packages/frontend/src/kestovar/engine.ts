// Stub: Kestovar engine
export function getEngine() {
  return {
    status: "unavailable",
    health: async () => ({ status: "failed" }),
  };
}

export default getEngine;
