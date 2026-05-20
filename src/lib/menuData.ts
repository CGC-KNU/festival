import type { MenuItem } from "./types";

export const MAIN_MENU: MenuItem[] = [
  { id: "main_garlic_shrimp", category: "main", name: "갈릭 버터 새우", price: 16000 },
  { id: "main_sundubu_ramen", category: "main", name: "차돌 순두부 라면", price: 12000 },
  { id: "main_beef_sukju", category: "main", name: "우삼겹 숙주 볶음", price: 16000 },
  { id: "main_rabokki", category: "main", name: "떡볶이", price: 12000 },
];

export const SIDE_MENU: MenuItem[] = [
  { id: "side_sherbet", category: "side", name: "샤베트", price: 9000 },
  { id: "side_peach", category: "side", name: "황도", price: 8000 },
  { id: "side_eomuk", category: "side", name: "어묵탕", price: 8000 },
  { id: "side_tomato", category: "side", name: "설탕 토마토", price: 8000 },
];

export const SET_MENU: MenuItem[] = [
  { id: "set_a", category: "set", name: "A세트", baseItems: "갈릭 버터 새우 + 사이드 택1", price: 23000 },
  { id: "set_b", category: "set", name: "B세트", baseItems: "우삼겹 숙주 볶음 + 사이드 택1", price: 23000 },
  { id: "set_c", category: "set", name: "C세트", baseItems: "차돌 순두부 라면 + 사이드 택1", price: 19000 },
  { id: "set_d", category: "set", name: "D세트", baseItems: "떡볶이 + 사이드 택1", price: 19000 },
  { id: "set_alcohol", category: "set", name: "술안주 세트", baseItems: "갈릭 버터 새우 + 우삼겹 숙주 볶음 + 사이드 택1", price: 38000 },
  { id: "set_bunsik", category: "set", name: "분식 세트", baseItems: "떡볶이 + 차돌 순두부 라면 + 사이드 택1", price: 30000 },
  { id: "set_popular", category: "set", name: "인기 세트", baseItems: "우삼겹 숙주 볶음 + 떡볶이 + 사이드 택1", price: 35000 },
];

export const COUPON_MENU: MenuItem[] = [
  { id: "coupon_drink", category: "coupon", name: "주막 쿠폰", description: "음료 한 캔", price: 0 },
];

export const SIDE_OPTIONS = ["샤베트", "황도", "어묵탕", "설탕 토마토"] as const;

/** 운영 중 품절 해제 시 id만 제거하면 됩니다 */
export const SOLD_OUT_MENU_IDS = [
  "main_garlic_shrimp",
  "set_a",
  "set_alcohol",
] as const;

export function isMenuSoldOut(menuId: string) {
  return (SOLD_OUT_MENU_IDS as readonly string[]).includes(menuId);
}
