"use client";

import { SIDE_OPTIONS } from "@/lib/menuData";
import type { MenuItem } from "@/lib/types";

type Props = {
  setMenu: MenuItem;
  onSelect: (sideName: string) => void;
  onClose: () => void;
};

export default function SideMenuModal({ setMenu, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(8,7,26,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-lg rounded-t-2xl p-6 pb-safe border-t border-white/10"
        style={{ background: "linear-gradient(180deg, #1a1464 0%, #0d0b2e 100%)" }}>
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
        <p className="text-xs text-white/40 tracking-widest uppercase text-center mb-1">사이드 선택</p>
        <h3 className="font-bold text-lg text-white text-center mb-1">{setMenu.name}</h3>
        <p className="text-sm text-white/40 text-center mb-5">사이드 메뉴를 1개 선택해주세요</p>

        <div className="space-y-2">
          {SIDE_OPTIONS.map((side) => (
            <button
              key={side}
              onClick={() => onSelect(side)}
              className="w-full p-3.5 text-left rounded-xl bg-white/[0.07] border border-white/10 hover:bg-white/15 hover:border-amber-400/40 transition-all"
            >
              <span className="font-medium text-white">{side}</span>
            </button>
          ))}
        </div>

        <button onClick={onClose} className="w-full mt-3 p-3 text-center text-white/30 text-sm hover:text-white/60 transition-colors">
          취소
        </button>
      </div>
    </div>
  );
}
