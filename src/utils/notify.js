// src/utils/notify.js
import { db
 } from "../firebase";
import { ref, push, set, update, get, child } from "firebase/database";

export async function sendNotification(userId, payload) {
  if (!userId) return;
  const nref = push(ref(db, `notifications/${userId}`));
  await set(nref, {
    title: payload.title || "Notification",
    message: payload.message || "",
    link: payload.link || null,
    read: false,
    createdAt: Date.now(),
    type: payload.type || "info",
  });
}

// optional helper
export async function markAllRead(userId) {
  if (!userId) return;
  const snap = await get(child(ref(db), `notifications/${userId}`));
  const data = snap.val() || {};
  await Promise.all(
    Object.keys(data).map((nid) =>
      update(ref(db, `notifications/${userId}/${nid}`), { read: true })
    )
  );
}
