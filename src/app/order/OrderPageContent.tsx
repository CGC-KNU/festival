"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MAIN_MENU, SIDE_MENU, SET_MENU } from "@/lib/menuData";
import { TABLE_CHARGE_PER_PERSON } from "@/lib/constants";
import SideMenuModal from "@/components/SideMenuModal";
import type { CartItem, MenuItem } from "@/lib/types";

type Category = "main" | "side" | "set";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "main", label: "메인" },
  { key: "side", label: "사이드" },
  { key: "set", label: "세트" },
];

const MENU_BY_CATEGORY: Record<Category, MenuItem[]> = {
  main: MAIN_MENU,
  side: SIDE_MENU,
  set: SET_MENU,
};

const TABLE_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1);

export default function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTable = searchParams.get("table") ?? "";

  const [tableNumber, setTableNumber] = useState(initialTable);
  const [headCount, setHeadCount] = useState(0);
  const [depositorName, setDepositorName] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("main");
  const [sideModalOpen, setSideModalOpen] = useState(false);
  const [pendingSetMenu, setPendingSetMenu] = useState<MenuItem | null>(null);

  const tableCharge = headCount * TABLE_CHARGE_PER_PERSON;
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = cartTotal + tableCharge;

  const addToCart = (item: MenuItem, selectedSide?: string) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.id === item.id &&
          (item.category !== "set" || ci.selectedSide === selectedSide)
      );
      if (existingIdx >= 0) {
        return prev.map((ci, i) =>
          i === existingIdx ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          category: item.category as CartItem["category"],
          price: item.price,
          quantity: 1,
          selectedSide,
        },
      ];
    });
  };

  const handleAddMenu = (item: MenuItem) => {
    if (item.category === "set") {
      setPendingSetMenu(item);
      setSideModalOpen(true);
    } else {
      addToCart(item);
    }
  };

  const handleSideSelect = (sideName: string) => {
    if (pendingSetMenu) addToCart(pendingSetMenu, sideName);
    setPendingSetMenu(null);
    setSideModalOpen(false);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCartItems((prev) => {
      const newQty = prev[index].quantity + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      return prev.map((ci, i) => (i === index ? { ...ci, quantity: newQty } : ci));
    });
  };

  const removeItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const hasMainOrSet = cartItems.some(
    (ci) => ci.category === "main" || ci.category === "set"
  );

  const canOrder =
    tableNumber !== "" &&
    headCount > 0 &&
    depositorName.trim().length > 0 &&
    cartItems.length > 0 &&
    hasMainOrSet;

  const handleOrder = () => {
    if (!canOrder) return;
    const pendingOrder = {
      tableNumber,
      headCount,
      depositorName: depositorName.trim(),
      items: cartItems,
      tableCharge: { price: 3000 as const, quantity: headCount, total: tableCharge },
      totalAmount,
    };
    sessionStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
    router.push("/checkout");
  };

  const currentMenuItems = MENU_BY_CATEGORY[activeCategory];

  return (
    <div className="max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-3 shadow-xl border-b border-white/10"
        style={{ background: "linear-gradient(135deg, #1a1082 0%, #0d0b2e 100%)", backdropFilter: "blur(12px)" }}>
        <div className="relative flex items-center justify-center">
          <div className="text-center">
            <p className="text-[10px] text-white/40 tracking-widest uppercase mb-0.5">정든밤 × wouldulike</p>
            <h1 className="text-lg font-bold text-white">🌌 주막 주문</h1>
          </div>
          <a href="/admin" className="absolute right-0 text-white/30 hover:text-white/70 text-xl p-1 transition-colors" title="관리자">
            📋
          </a>
        </div>
        {tableNumber ? (
          <p className="text-center text-amber-400 text-sm mt-0.5 font-medium">테이블 {tableNumber}번</p>
        ) : (
          <p className="text-center text-white/35 text-sm mt-0.5">테이블을 선택해주세요</p>
        )}
      </header>

      <main className="pb-28 px-3 pt-3 space-y-3">
        {/* 테이블 선택 */}
        <section className="glass-card p-4">
          <h2 className="font-bold text-white/80 mb-3 text-sm tracking-wide">테이블 번호 선택</h2>
          <div className="grid grid-cols-5 gap-2">
            {TABLE_NUMBERS.map((n) => (
              <button
                key={n}
                onClick={() => setTableNumber(String(n))}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tableNumber === String(n)
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* 주문 정보 */}
        <section className="glass-card p-4">
          <h2 className="font-bold text-white/80 mb-3 text-sm tracking-wide">주문 정보</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-white">인원 수</p>
              {headCount > 0 && (
                <p className="text-xs text-white/40">
                  상차림비 {(headCount * TABLE_CHARGE_PER_PERSON).toLocaleString()}원 포함
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHeadCount(Math.max(0, headCount - 1))}
                className="w-9 h-9 rounded-full bg-white/10 text-white font-bold text-xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                −
              </button>
              <span className="w-8 text-center font-bold text-lg text-white">{headCount}</span>
              <button
                onClick={() => setHeadCount(headCount + 1)}
                className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center hover:bg-indigo-500 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <input
            className="input-dark"
            placeholder="입금자명 (계좌이체 시 입력할 이름)"
            value={depositorName}
            onChange={(e) => setDepositorName(e.target.value)}
          />
        </section>

        {/* 주의사항 */}
        <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-400">
          <p className="font-bold mb-0.5">⚠️ 주의사항</p>
          <p className="text-amber-300/80">메인 메뉴 또는 세트 메뉴를 반드시 1개 이상 주문해야 합니다.</p>
        </section>

        {/* 메뉴 */}
        <section className="glass-card overflow-hidden">
          {/* 탭 */}
          <div className="flex border-b border-white/10">
            {CATEGORIES.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeCategory === tab.key
                    ? "text-amber-400 border-b-2 border-amber-400"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 메뉴 목록 */}
          <div className="divide-y divide-white/5">
            {currentMenuItems.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{item.name}</p>
                  {item.baseItems && (
                    <p className="text-xs text-white/35 mt-0.5">{item.baseItems}</p>
                  )}
                  <p className="text-amber-400 font-bold mt-1 text-sm">
                    {item.price.toLocaleString()}원
                  </p>
                </div>
                <button
                  onClick={() => handleAddMenu(item)}
                  className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-500 active:scale-95 transition-all"
                  style={{ boxShadow: "0 2px 12px rgba(99,102,241,0.35)" }}
                >
                  + 담기
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 장바구니 */}
        <section className="glass-card p-4">
          <h2 className="font-bold text-white mb-3">🛒 장바구니</h2>

          {headCount === 0 && cartItems.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-6">
              인원 수를 입력하고 메뉴를 담아주세요
            </p>
          ) : (
            <div className="space-y-3">
              {headCount > 0 && (
                <div className="flex items-center justify-between bg-indigo-500/10 rounded-xl px-3 py-2.5 border border-indigo-500/20">
                  <div>
                    <p className="text-sm font-medium text-white/80">상차림비</p>
                    <p className="text-xs text-white/35">{headCount}명 × 3,000원 · 삭제 불가</p>
                  </div>
                  <p className="font-bold text-white">{tableCharge.toLocaleString()}원</p>
                </div>
              )}

              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.selectedSide ?? ""}-${index}`} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    {item.selectedSide && (
                      <p className="text-xs text-amber-400/80">+ {item.selectedSide}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => updateQuantity(index, -1)}
                      className="w-7 h-7 rounded-full bg-white/10 text-white text-sm font-bold flex items-center justify-center hover:bg-white/20">
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-medium text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(index, 1)}
                      className="w-7 h-7 rounded-full bg-white/10 text-white text-sm font-bold flex items-center justify-center hover:bg-white/20">
                      +
                    </button>
                    <span className="text-sm font-bold w-16 text-right text-white">
                      {(item.price * item.quantity).toLocaleString()}원
                    </span>
                    <button onClick={() => removeItem(index)}
                      className="text-white/20 hover:text-red-400 w-6 text-center text-lg transition-colors">
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {cartItems.length > 0 && !hasMainOrSet && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-xs text-red-400">
                  메인 또는 세트 메뉴를 1개 이상 추가해야 주문할 수 있습니다.
                </div>
              )}

              {(headCount > 0 || cartItems.length > 0) && (
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-bold text-white/80">합계</span>
                  <span className="text-lg font-bold text-amber-400">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/10 shadow-2xl"
        style={{ background: "rgba(8,7,26,0.85)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-white/40">총 결제금액</p>
            <p className="text-xl font-bold text-amber-400">{totalAmount.toLocaleString()}원</p>
          </div>
          <button
            onClick={handleOrder}
            disabled={!canOrder}
            className="btn-primary px-8 py-3 text-sm disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
          >
            주문하기
          </button>
        </div>
      </div>

      {sideModalOpen && pendingSetMenu && (
        <SideMenuModal
          setMenu={pendingSetMenu}
          onSelect={handleSideSelect}
          onClose={() => { setSideModalOpen(false); setPendingSetMenu(null); }}
        />
      )}
    </div>
  );
}
