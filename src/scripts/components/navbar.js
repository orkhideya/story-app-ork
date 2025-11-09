import auth from "../utils/middleware";
import PushNotification from "../utils/push-notification";

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

    navList.innerHTML = `
      <ul class="nav-list">
      ${
        isLoggedIn
          ? `
        <li><a href="#/stories"><i class="fas fa-book"></i> Cerita</a></li>
        <li><a href="#/stories/add"><i class="fas fa-plus"></i> Tambah Cerita</a></li>
        <li><a href="#/about"><i class="fas fa-info-circle"></i> Tentang</a></li>
        ${
          isPushSupported
            ? `<li><a href="#" id="notificationButton" disabled><i class="fas fa-bell"></i> Notifikasi</a></li>`
            : ""
        }
        <li><a href="#" id="logoutButton"><i class="fas fa-sign-out-alt"></i> Keluar</a></li>
      `
          : `
        <li><a href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
        <li><a href="#/register"><i class="fas fa-user-plus"></i> Register</a></li>
        <li><a href="#/about"><i class="fas fa-info-circle"></i> Tentang</a></li>
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
          notificationButton.disabled = true;

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
          } finally {
            notificationButton.disabled = false;
          }
        });
      }
    }
  }

  static _showToast(message) {
    // Simple toast notification (you might want to replace this with your app's toast system)
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
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
