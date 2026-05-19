import { Suspense } from "react";
import OrderPageContent from "./OrderPageContent";

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-amber-50 flex items-center justify-center">
          <p className="text-gray-400">로딩 중...</p>
        </div>
      }
    >
      <OrderPageContent />
    </Suspense>
  );
}
