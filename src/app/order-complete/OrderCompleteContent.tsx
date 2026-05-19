"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Order } from "@/lib/types";

export default function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { router.replace("/order"); return; }
    const orders: Order[] = JSON.parse(localStorage.getItem("jumak_orders") ?? "[]");
    setOrder(orders.find((o) => o.id === orderId) ?? null);
    setLoading(false);
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">로딩 중...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-white/40 text-center">주문 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const shortId = order.id.split("-")[0];
  const orderTime = new Date(order.createdAt).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="max-w-lg mx-auto min-h-screen">
      <header className="px-4 py-3 shadow-xl border-b border-white/10"
        style={{ background: "linear-gradient(135deg, #1a1082 0%, #0d0b2e 100%)" }}>
        <p className="text-[10px] text-white/40 tracking-widest uppercase text-center mb-0.5">정든밤 × wouldulike</p>
        <h1 className="text-lg font-bold text-white text-center">주문 완료</h1>
      </header>

      <main className="px-3 pt-3 pb-8 space-y-3">
        {/* 성공 */}
        <div className="glass-card p-6 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-white mb-1">주문이 접수되었습니다!</h2>
          <p className="text-sm text-white/40">주문번호 <span className="text-amber-400 font-mono">#{shortId}</span></p>
          <p className="text-xs text-white/30 mt-0.5">{orderTime}</p>
        </div>

        <section className="glass-card p-4">
          <h3 className="font-bold text-white/80 mb-3 text-sm">주문 정보</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/40">테이블</dt>
              <dd className="font-medium text-white">{order.tableNumber}번</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">인원 수</dt>
              <dd className="font-medium text-white">{order.headCount}명</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">입금자명</dt>
              <dd className="font-bold text-amber-400">{order.depositorName}</dd>
            </div>
          </dl>
        </section>

        <section className="glass-card p-4">
          <h3 className="font-bold text-white/80 mb-3 text-sm">주문 내역</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">상차림비</span>
              <span className="text-white">{order.tableCharge.total.toLocaleString()}원</span>
            </div>
            {order.items.map((item, index) => (
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
              <span className="text-amber-400">{order.totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </section>

        <section className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-sm text-white/60 space-y-1.5">
          <p className="font-medium text-white/80">✨ 입금 확인 후 조리가 시작됩니다.</p>
          <p>주문 변경이 필요한 경우 직원을 호출해주세요.</p>
        </section>

        <a
          href={`/order?table=${order.tableNumber}`}
          className="block w-full py-4 rounded-xl text-center font-bold text-white/70 border border-white/15 bg-white/[0.06] hover:bg-white/10 transition-colors text-sm"
        >
          + 추가 주문하기
        </a>
      </main>
    </div>
  );
}
