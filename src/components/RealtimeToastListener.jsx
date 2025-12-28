import { useEffect, useRef } from "react";
import { useToast } from "@chakra-ui/react";
import { db
 } from "../firebase";
import { ref, onValue, update } from "firebase/database";

export default function RealtimeToastListener({ userId }) {
  const toast = useToast();
  const seenIdsRef = useRef(new Set()); // avoids spamming toasts on first load

  useEffect(() => {
    if (!userId) return;

    const nRef = ref(db, `notifications/${userId}`);

    const unsub = onValue(nRef, (snap) => {
      const data = snap.val() || {};
      const entries = Object.entries(data).map(([id, n]) => ({ id, ...n }));

      // sort newest first
      entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      // show toast only for brand-new unread notifications
      for (const n of entries) {
        if (!n.read && !seenIdsRef.current.has(n.id)) {
          seenIdsRef.current.add(n.id);

          toast({
            title: n.title || "Notification",
            description: n.message || "",
            status: n.type === "error" ? "error" : n.type === "success" ? "success" : "info",
            duration: 5000,
            isClosable: true,
            position: "top",
            variant: "subtle",
          });

          // optional: mark as "popped" so refresh doesn't re-toast
          update(ref(db, `notifications/${userId}/${n.id}`), { popped: true }).catch(() => {});
          break;
        }
      }

      // mark everything as "seen" on first load so you don't toast old ones
      if (seenIdsRef.current.size === 0) {
        for (const n of entries) seenIdsRef.current.add(n.id);
      }
    });

    return () => unsub();
  }, [userId, toast]);

  return null;
}
