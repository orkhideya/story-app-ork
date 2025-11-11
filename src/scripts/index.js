// CSS imports
import "../styles/styles.css";
import App from "./pages/app";
import Navbar from "./components/navbar";
import SkipToContentInitiator from "./utils/skip-to-content-initiator";

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Skip to Content feature
  SkipToContentInitiator.init({
    skipLinkId: "skip-to-content",
    mainContentId: "main-content",
  });

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  // Initialize navigation
  Navbar.init();
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});

// Register service worker HANYA di production
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    try {
      const registration = await navigator.serviceWorker.register("/sw.bundle.js", {
        scope: "/",
      });
      console.log("Service Worker registered with scope:", registration.scope);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }
  return null;
};

// Call this when your app initializes
registerServiceWorker();