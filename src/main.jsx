import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const cleanUrl = () => {
  const params = ["force=reload", "reload=1", "clear_cache=1"];
  const hasParam = params.some((p) => window.location.search.includes(p));
  if (hasParam) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");

    if (registration.active) {
      registration.active.postMessage("SKIP_WAITING");
    }

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "activated" &&
          navigator.serviceWorker.controller
        ) {
          window.location.reload();
        }
      });
    });
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
};

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
              window.location.reload();
            }
          }
        });
      });
    })
    .catch(console.error);
}

cleanUrl();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: "#ffffff",
          color: "#000000",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px 16px",
        },
      }}
    />
  </React.StrictMode>,
);