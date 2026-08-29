import { PushAPI } from "../api/push.api.js";

export const isPushSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const getPermission = () => (isPushSupported() ? Notification.permission : "unsupported");

// PushManager.subscribe needs the VAPID public key as a Uint8Array, but the
// server hands it over base64url-encoded — this is the standard conversion.
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const getExistingSubscription = async () => {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
};

// Requests permission (must be called from a user gesture), subscribes this
// browser to push, and registers the subscription with the backend so it
// gets included the next time any notification is created for this user.
export const subscribeToPush = async (asAdmin = false) => {
  if (!isPushSupported()) throw new Error("Push notifications are not supported here");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(permission === "denied" ? "denied" : "dismissed");
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const { data } = await PushAPI.getVapidPublicKey();
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });
  }

  await PushAPI.subscribe(subscription.toJSON(), asAdmin);
  return subscription;
};

export const unsubscribeFromPush = async (asAdmin = false) => {
  const subscription = await getExistingSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await PushAPI.unsubscribe(endpoint, asAdmin);
};
