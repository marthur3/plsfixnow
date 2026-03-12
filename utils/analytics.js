export const trackEvent = (name, props = {}) => {
  if (typeof window === "undefined") return;
  if (typeof window.va === "function") {
    window.va("track", name, props);
  }
};
