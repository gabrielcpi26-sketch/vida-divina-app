// src/registerSW.js
export function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.log("SW registration failed", err));
    });
  }
}
