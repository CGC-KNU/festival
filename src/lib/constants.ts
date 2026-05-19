export const BANK_INFO = {
  bankName: "카카오뱅크",
  accountNumber: "3333-22-3400327",
  accountHolder: "양민열",
};

export const TABLE_CHARGE_PER_PERSON = 3000;

export const ORDER_STATUS_FLOW = [
  "입금 확인 대기",
  "입금 확인 완료",
  "조리 중",
  "서빙 완료",
] as const;
