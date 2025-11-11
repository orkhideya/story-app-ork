import auth from "../utils/middleware";
import PushNotification from "../utils/push-notification";
import IDBHelper from "../utils/idb-helper";

class Navbar {
  static init() {
    this._updateNavigation();
    window.addEventListener("hashchange", () => {
      this._updateNavigation();
    });
  }

  static async _updateNavigation() {
    const navList = document.getElementById("nav-list");
    const isLoggedIn = auth.checkLoggedIn();
    const isPushSupported =
      await PushNotification.isPushNotificationSupported();

    // Get favorite count for badge
    const favoriteCount = isLoggedIn ? await IDBHelper.getFavoriteCount() : 0;
    const favoriteBadge = favoriteCount > 0 
      ? `<span class="nav-badge">${favoriteCount}</span>` 
      : '';

    navList.innerHTML = `
    <ul class="nav-list">
    ${
      isLoggedIn
        ? `
      <li><a href="#/" class="nav-link"><span>Home</span></a></li>
      <li><a href="#/stories" class="nav-link"><span>Stories</span></a></li>
      <li><a href="#/stories/add" class="nav-link"><span>Add Story</span></a></li>
      <li>
        <a href="#/favorites" class="nav-link">
          <span>Favorites ${favoriteBadge}</span>
        </a>
      </li>
      ${
        isPushSupported
          ? `<li><button type="button" id="notificationButton"><span>Notification</span></button></li>`
          : ""
      }
      <li><button type="button" id="logoutButton"><span>Sign Out</span></button></li>
    `
        : `
      <li><a href="#/login" class="nav-link"><span>Login</span></a></li>
      <li><a href="#/register" class="nav-link"><span>Register</span></a></li>
    `
    }
    </ul>
  `;

    if (isLoggedIn) {
      const logoutButton = document.getElementById("logoutButton");
      logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.hash = "#/login";
      });

      // Handle notification subscription button if supported
      if (isPushSupported) {
        const notificationButton =
          document.getElementById("notificationButton");
        
        // Update button UI based on subscription status
        await PushNotification.updateSubscriptionButton(notificationButton);
        
        // Add event listener for notification button
        notificationButton.addEventListener("click", async (e) => {
          e.preventDefault();
          
          // Add loading state
          const originalHTML = notificationButton.innerHTML;
          notificationButton.style.pointerEvents = "none";
          notificationButton.style.opacity = "0.6";

          try {
            const isSubscribed = await PushNotification.isSubscribed();
            
            if (isSubscribed) {
              // If already subscribed, unsubscribe
              await PushNotification.unsubscribe();
              this._showToast("Notifikasi telah dinonaktifkan");
            } else {
              // If not subscribed, subscribe
              await PushNotification.subscribe();
              this._showToast("Notifikasi telah diaktifkan");
            }
            
            // Update button UI after subscription change
            await PushNotification.updateSubscriptionButton(notificationButton);
          } catch (error) {
            console.error("Notification subscription error:", error);
            this._showToast(`Error: ${error.message}`);
            notificationButton.innerHTML = originalHTML;
          } finally {
            notificationButton.style.pointerEvents = "";
            notificationButton.style.opacity = "";
          }
        });
      }
    }
  }

  static _showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }, 100);
  }
}

export default Navbar;