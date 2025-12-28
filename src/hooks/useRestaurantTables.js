import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestore } from "../firebase";

export function useRestaurantTables(restaurantId) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    const q = query(
      collection(firestore, "restaurants", restaurantId, "tables"),
      orderBy("number", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setTables(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("tables listen error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [restaurantId]);

  return { tables, loading };
}
