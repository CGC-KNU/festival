import type { Order, OrderStatus, PendingOrder } from "@/lib/types";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const LOCAL_KEY = "jumak_orders";

function isFirebaseConfigured() {
  // NEXT_PUBLIC_* envs are embedded at build-time. If any are missing,
  // Firestore init may still succeed but operations will fail at runtime.
  // We use the same presence check as firebase.ts expects.
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

export function loadOrdersLocal(): Order[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
}

export function saveOrdersLocal(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(orders));
}

export async function createOrder(pending: PendingOrder) {
  const base: Omit<Order, "id" | "createdAt"> = {
    ...pending,
    status: "입금 확인 대기",
  };

  // Prefer Firestore, but keep a local fallback for environments without config.
  if (isFirebaseConfigured()) {
    try {
      const ref = await addDoc(collection(db, "orders"), {
        ...base,
        createdAt: serverTimestamp(),
      });

      const order: Order = {
        ...base,
        id: ref.id,
        createdAt: new Date().toISOString(), // client fallback string for UI; server timestamp is stored too
      };

      // Keep local mirror so admin/order-complete still works offline if desired.
      const existing = loadOrdersLocal();
      saveOrdersLocal([order, ...existing]);
      return order;
    } catch {
      // Fall back to local if Firestore denies writes (e.g. rules) or misconfigured runtime.
    }
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const order: Order = {
    ...base,
    id,
    createdAt: new Date().toISOString(),
  };
  const existing = loadOrdersLocal();
  saveOrdersLocal([order, ...existing]);
  return order;
}

export function subscribeOrders(onChange: (orders: Order[]) => void) {
  if (!isFirebaseConfigured()) {
    onChange(loadOrdersLocal());
    const handler = () => onChange(loadOrdersLocal());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }

  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  try {
    return onSnapshot(q, (snap) => {
      const orders: Order[] = snap.docs.map((d) => {
        const data = d.data() as Omit<Order, "id"> & { createdAt?: any };
        const createdAt =
          data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString();
        return {
          ...(data as any),
          id: d.id,
          createdAt,
        } as Order;
      });
      onChange(orders);

      // mirror
      saveOrdersLocal(orders);
    });
  } catch {
    onChange(loadOrdersLocal());
    const handler = () => onChange(loadOrdersLocal());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (isFirebaseConfigured()) {
    try {
      await setDoc(doc(db, "orders", orderId), { status }, { merge: true });
    } catch {
      // ignore and still update local mirror for resilience
    }
  }

  const updated = loadOrdersLocal().map((o) =>
    o.id === orderId ? { ...o, status } : o
  );
  saveOrdersLocal(updated);
  return updated;
}

export async function getOrderById(orderId: string) {
  if (isFirebaseConfigured()) {
    try {
      const snap = await getDoc(doc(db, "orders", orderId));
      if (!snap.exists()) return null;
      const data = snap.data() as Omit<Order, "id"> & { createdAt?: any };
      const createdAt =
        data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString();
      const order: Order = {
        ...(data as any),
        id: snap.id,
        createdAt,
      };
      return order;
    } catch {
      // fallback below
    }
  }

  return loadOrdersLocal().find((o) => o.id === orderId) ?? null;
}

