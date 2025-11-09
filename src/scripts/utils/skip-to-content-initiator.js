const SkipToContentInitiator = {
  init({
    skipLinkId = "skip-to-content",
    mainContentId = "main-content",
  } = {}) {
    this._addSkipLink(skipLinkId, mainContentId);
    this._addStylesheet();
    this._setupEventListeners(skipLinkId, mainContentId);
  },

  _addSkipLink(skipLinkId, mainContentId) {
    // Check if skip link already exists
    if (document.getElementById(skipLinkId)) {
      return;
    }

    // Create skip link element
    const skipLink = document.createElement("a");
    skipLink.id = skipLinkId;
    skipLink.className = "skip-to-content";
    skipLink.href = `#${mainContentId}`;
    skipLink.textContent = "Skip to content";

    // Insert as first element in body
    document.body.insertBefore(skipLink, document.body.firstChild);
  },

  _addStylesheet() {
    // Check if stylesheet already exists
    if (document.getElementById("skip-to-content-styles")) {
      return;
    }

    // Create and add stylesheet
    const style = document.createElement("style");
    style.id = "skip-to-content-styles";
    style.textContent = `
        .skip-to-content {
          position: absolute;
          top: -40px;
          left: 0;
          background: #4a90e2;
          color: white;
          padding: 8px 15px;
          z-index: 10000;
          transition: top 0.3s;
          text-decoration: none;
          font-weight: bold;
          border-radius: 0 0 4px 0;
        }
        
        .skip-to-content:focus {
          top: 0;
        }
        
        .skip-to-content:focus-visible {
          outline: 3px solid #ffd700;
          outline-offset: 2px;
        }
      `;

    document.head.appendChild(style);
  },

  _setupEventListeners(skipLinkId, mainContentId) {
    document.addEventListener("click", (event) => {
      if (event.target.id === skipLinkId) {
        event.preventDefault();

        // Find main content and focus it
        const mainContent = document.getElementById(mainContentId);
        if (mainContent) {
          // Make sure mainContent is focusable
          if (!mainContent.hasAttribute("tabindex")) {
            mainContent.setAttribute("tabindex", "-1");
          }

          // Focus the main content
          mainContent.focus();

          // Scroll to main content
          mainContent.scrollIntoView();
        }
      }
    });

    // Setup MutationObserver to handle SPA page changes
    this._setupMutationObserver(mainContentId);
  },

  _setupMutationObserver(mainContentId) {
    // Create observer to watch for page content changes in SPAs
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const mainContent = document.getElementById(mainContentId);
          if (mainContent && !mainContent.hasAttribute("tabindex")) {
            mainContent.setAttribute("tabindex", "-1");
          }
        }
      }
    });

    // Start observing the document body
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },
};

export default SkipToContentInitiator;
