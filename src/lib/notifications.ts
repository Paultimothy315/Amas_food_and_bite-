/**
 * Utility for browser push notifications
 */

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === "granted") {
    return new Notification(title, {
      icon: "https://lh3.googleusercontent.com/d/1EmqPTH4tj_FUj-AEjqe1uKFT0hemqqoK",
      badge: "https://lh3.googleusercontent.com/d/1EmqPTH4tj_FUj-AEjqe1uKFT0hemqqoK",
      ...options
    });
  }
  return null;
};
