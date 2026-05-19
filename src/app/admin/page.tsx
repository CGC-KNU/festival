"use client";

import { useEffect, useRef, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";

const ADMIN_PASSWORD = "0629";

const STATUS_FLOW: OrderStatus[] = [
  "입금 확인 대기",
  "입금 확인 완료",
  "조리 중",
  "서빙 완료",
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  "입금 확인 대기": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  "입금 확인 완료": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "조리 중": "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  "서빙 완료": "bg-green-500/20 text-green-400 border border-green-500/30",
  취소: "bg-white/5 text-white/25 border border-white/10",
};

function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_FLOW.indexOf(current);
  return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

function loadOrders(): Order[] {
  return JSON.parse(localStorage.getItem("jumak_orders") ?? "[]");
}

function saveOrders(orders: Order[]) {
  localStorage.setItem("jumak_orders", JSON.stringify(orders));
}

// ─── 비밀번호 화면 ───────────────────────────────────────────
function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      onSuccess();
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-xs text-center">
        <div className="text-5xl mb-3">🔐</div>
        <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">관리자 전용</p>
        <h1 className="text-xl font-bold text-white mb-1">정든밤 주막</h1>
        <p className="text-sm text-white/40 mb-6">비밀번호를 입력해주세요</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={ref}
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="● ● ● ●"
            className={`w-full rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none transition-all ${
              error
                ? "bg-red-500/20 border-2 border-red-500/50"
                : "bg-white/[0.08] border-2 border-white/20 focus:border-indigo-500"
            }`}
            maxLength={10}
          />
          {error && <p className="text-red-400 text-sm">비밀번호가 틀렸습니다.</p>}
          <button type="submit" className="btn-primary w-full py-3 text-base">
            입장
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── 관리자 메인 ─────────────────────────────────────────────
function AdminMain() {
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = () => setOrders(loadOrders());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = loadOrders().map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    saveOrders(updated);
    setOrders(updated);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    window.location.reload();
  };

  const pendingCount = orders.filter((o) => o.status === "입금 확인 대기").length;
  const cookingCount = orders.filter((o) => o.status === "조리 중").length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 px-4 py-4 border-b border-white/10 shadow-xl"
        style={{ background: "linear-gradient(135deg, #1a1082 0%, #0d0b2e 100%)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] text-white/40 tracking-widest uppercase">관리자</p>
              <h1 className="text-lg font-bold text-white leading-tight">🌌 정든밤 주막</h1>
            </div>
            <div className="flex gap-2">
              {pendingCount > 0 && (
                <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full text-xs font-bold">
                  입금대기 {pendingCount}
                </span>
              )}
              {cookingCount > 0 && (
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full text-xs font-bold">
                  조리중 {cookingCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="text-white/40 hover:text-white/80 text-sm px-2 py-1 transition-colors">
              🔄
            </button>
            <button onClick={handleLogout} className="text-white/30 hover:text-white/60 text-sm px-2 py-1 transition-colors">
              나가기
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-5xl mb-3">📭</div>
            <p>아직 접수된 주문이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const shortId = order.id.split("-")[0];
              const orderTime = new Date(order.createdAt).toLocaleString("ko-KR", {
                month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
              });

              return (
                <div key={order.id}
                  className={`glass-card overflow-hidden transition-opacity ${order.status === "취소" ? "opacity-40" : ""}`}>
                  {/* 헤더 */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
                    style={{ background: "rgba(26,16,130,0.3)" }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">테이블 {order.tableNumber}번</span>
                      <span className="text-white/30 text-xs font-mono">#{shortId}</span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[order.status]}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* 본문 */}
                  <div className="px-4 py-3 space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="text-white/40">
                        주문시간: <span className="text-white/80 font-medium">{orderTime}</span>
                      </div>
                      <div className="text-white/40">
                        인원: <span className="text-white/80 font-medium">{order.headCount}명</span>
                      </div>
                      <div className="text-white/40">
                        입금자: <span className="text-amber-400 font-bold">{order.depositorName}</span>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-2 space-y-1">
                      <p className="text-xs text-white/30 mb-1">주문 내역</p>
                      <div className="text-sm text-white/50">
                        상차림비 — {order.tableCharge.total.toLocaleString()}원
                      </div>
                      {order.items.map((item, i) => (
                        <div key={`${item.id}-${i}`} className="text-sm text-white/50">
                          {item.name}
                          {item.selectedSide && ` (${item.selectedSide})`}
                          {item.quantity > 1 && ` × ${item.quantity}`}
                          {" — "}
                          {(item.price * item.quantity).toLocaleString()}원
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                      <span className="text-sm text-white/40">총 결제금액</span>
                      <span className="font-bold text-amber-400 text-lg">
                        {order.totalAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {/* 상태 버튼 */}
                  {order.status !== "서빙 완료" && order.status !== "취소" && (
                    <div className="px-4 pb-4 flex gap-2">
                      {nextStatus && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus)}
                          className="btn-primary flex-1 py-2.5 text-sm"
                        >
                          → {nextStatus}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`테이블 ${order.tableNumber}번 주문을 취소하시겠습니까?`)) {
                            updateStatus(order.id, "취소");
                          }
                        }}
                        className="px-4 py-2.5 bg-white/[0.07] text-white/50 text-sm rounded-xl hover:bg-white/15 border border-white/10 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── 페이지 진입점 ────────────────────────────────────────────
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") setAuthenticated(true);
    setChecking(false);
  }, []);

  if (checking) return null;
  if (!authenticated) return <PasswordGate onSuccess={() => setAuthenticated(true)} />;
  return <AdminMain />;
}
