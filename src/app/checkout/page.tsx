"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BANK_INFO } from "@/lib/constants";
import type { Order, PendingOrder } from "@/lib/types";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("pendingOrder");
    if (!stored) { router.replace("/order"); return; }
    setPendingOrder(JSON.parse(stored));
  }, [router]);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(BANK_INFO.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(`계좌번호: ${BANK_INFO.accountNumber}`);
    }
  };

  const handleSubmitOrder = () => {
    if (!pendingOrder || submitting) return;
    setSubmitting(true);
    const orderId = generateId();
    const newOrder: Order = {
      ...pendingOrder,
      id: orderId,
      createdAt: new Date().toISOString(),
      status: "입금 확인 대기",
    };
    const existing: Order[] = JSON.parse(localStorage.getItem("jumak_orders") ?? "[]");
    localStorage.setItem("jumak_orders", JSON.stringify([newOrder, ...existing]));
    sessionStorage.removeItem("pendingOrder");
    router.push(`/order-complete?orderId=${orderId}`);
  };

  if (!pendingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen">
      <header className="px-4 py-3 shadow-xl border-b border-white/10"
        style={{ background: "linear-gradient(135deg, #1a1082 0%, #0d0b2e 100%)" }}>
        <div className="relative flex items-center justify-center">
          <button onClick={() => router.back()}
            className="absolute left-0 text-white/40 hover:text-white/80 text-sm px-1 py-1 transition-colors">
            ← 뒤로
          </button>
          <div className="text-center">
            <p className="text-[10px] text-white/40 tracking-widest uppercase mb-0.5">정든밤 × wouldulike</p>
            <h1 className="text-lg font-bold text-white">💳 결제 확인</h1>
          </div>
        </div>
        <p className="text-center text-amber-400 text-sm mt-0.5 font-medium">테이블 {pendingOrder.tableNumber}번</p>
      </header>

      <main className="px-3 pt-3 pb-28 space-y-3">
        <section className="glass-card p-4">
          <h2 className="font-bold text-white/80 mb-3 text-sm">주문 정보</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/40">테이블</dt>
              <dd className="font-medium text-white">{pendingOrder.tableNumber}번</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">인원 수</dt>
              <dd className="font-medium text-white">{pendingOrder.headCount}명</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">입금자명</dt>
              <dd className="font-bold text-amber-400">{pendingOrder.depositorName}</dd>
            </div>
          </dl>
        </section>

        <section className="glass-card p-4">
          <h2 className="font-bold text-white/80 mb-3 text-sm">주문 내역</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">상차림비</span>
              <span className="text-white">{pendingOrder.tableCharge.total.toLocaleString()}원</span>
            </div>
            {pendingOrder.items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex justify-between text-sm">
                <span className="text-white/50">
                  {item.name}
                  {item.selectedSide && ` (+${item.selectedSide})`}
                  {item.quantity > 1 && ` × ${item.quantity}`}
                </span>
                <span className="text-white">{(item.price * item.quantity).toLocaleString()}원</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
              <span className="text-white/80">총 결제금액</span>
              <span className="text-amber-400 text-lg">{pendingOrder.totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </section>

        <section className="glass-card p-4">
          <h2 className="font-bold text-white/80 mb-3 text-sm">입금 계좌 정보</h2>
          <dl className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <dt className="text-white/40">은행</dt>
              <dd className="font-medium text-white">{BANK_INFO.bankName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">예금주</dt>
              <dd className="font-medium text-white">{BANK_INFO.accountHolder}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">계좌번호</dt>
              <dd className="font-bold font-mono tracking-wide text-white">{BANK_INFO.accountNumber}</dd>
            </div>
          </dl>
          <button
            onClick={handleCopyAccount}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
              copied
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
            }`}
          >
            {copied ? "✓ 계좌번호가 복사되었습니다" : "계좌번호 복사"}
          </button>
        </section>

        <section className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-300/80 space-y-1.5">
          <p>아래 계좌로 총 금액을 이체해주세요.</p>
          <p>입금자명은 <strong className="text-amber-400">{pendingOrder.depositorName}</strong>으로 동일하게 입력해주세요.</p>
          <p>입금 확인 후 조리가 시작됩니다.</p>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/10 shadow-2xl"
        style={{ background: "rgba(8,7,26,0.85)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/40">총 결제금액</span>
            <span className="text-lg font-bold text-amber-400">{pendingOrder.totalAmount.toLocaleString()}원</span>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={submitting}
            className="btn-primary w-full py-4 text-base disabled:opacity-50"
          >
            {submitting ? "접수 중..." : "주문 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
