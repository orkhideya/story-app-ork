import CONFIG from "../config";

class PushNotification {
  static async isPushNotificationSupported() {
    return "serviceWorker" in navigator && "PushManager" in window;
  }

  static async requestNotificationPermission() {
    if (!(await this.isPushNotificationSupported())) {
      console.error("Push notifications not supported");
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  static urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  static async getSubscription() {
    if (!(await this.isPushNotificationSupported())) {
      return null;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription;
    } catch (error) {
      console.error("Error getting subscription:", error);
      return null;
    }
  }

  static async isSubscribed() {
    const subscription = await this.getSubscription();
    return !!subscription;
  }

  static async subscribe() {
    if (!(await this.isPushNotificationSupported())) {
      throw new Error("Push notifications not supported");
    }
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User not logged in");
    }
    try {
      const permissionGranted = await this.requestNotificationPermission();
      if (!permissionGranted) {
        throw new Error("Notification permission denied");
      }

      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      let subscription = await serviceWorkerRegistration.pushManager.getSubscription();

      if (!subscription) {
        const vapidPublicKey = CONFIG.PUSH_NOTIFICATION.VAPID_PUBLIC_KEY;
        const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);
        subscription = await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // Extract keys for server
      const p256dh = btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("p256dh"))
        )
      );
      const auth = btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("auth"))
        )
      );

      // Format yang BENAR sesuai API Dicoding - keys harus dalam object
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: p256dh,
          auth: auth,
        },
      };

      console.log("Sending subscription:", subscriptionData);

      // Send subscription to server
      const response = await fetch(
        `${CONFIG.BASE_URL}${CONFIG.NOTIFICATION_ENDPOINTS.SUBSCRIBE}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscriptionData),
        }
      );

      const responseData = await response.json();

      console.log("Server response:", responseData);

      if (!response.ok || responseData.error) {
        throw new Error(responseData.message || "Subscription failed");
      }

      return responseData;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      throw error;
    }
  }

  static async unsubscribe() {
    if (!(await this.isPushNotificationSupported())) {
      throw new Error("Push notifications not supported");
    }
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User not logged in");
    }
    try {
      const subscription = await this.getSubscription();
      if (!subscription) {
        return { error: false, message: "Not subscribed" };
      }

      const response = await fetch(
        `${CONFIG.BASE_URL}${CONFIG.NOTIFICATION_ENDPOINTS.UNSUBSCRIBE}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        }
      );

      const responseData = await response.json();

      // Unsubscribe dari browser HANYA jika server berhasil
      if (!responseData.error) {
        await subscription.unsubscribe();
      } else {
        throw new Error(responseData.message);
      }

      return responseData;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      throw error;
    }
  }

  static async updateSubscriptionButton(buttonElement) {
    if (!buttonElement) return;
    try {
      const isSubscribed = await this.isSubscribed();
      if (isSubscribed) {
        buttonElement.innerHTML = '<i class="fas fa-bell-slash"></i><span>Unsubscribe</span>';
        buttonElement.title = "Berhenti berlangganan notifikasi";
        buttonElement.classList.add("subscribed");
      } else {
        buttonElement.innerHTML = '<i class="fas fa-bell"></i><span>Subscribe</span>';
        buttonElement.title = "Berlangganan notifikasi";
        buttonElement.classList.remove("subscribed");
      }
      buttonElement.disabled = false;
    } catch (error) {
      console.error("Error updating subscription button:", error);
      buttonElement.innerHTML = '<i class="fas fa-bell"></i><span>Unsubscribe</span>';
      buttonElement.disabled = true;
    }
  }
}

export default PushNotification;