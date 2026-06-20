"use client";

import type { OrderStatus } from "@/lib/orders/firestore";

interface StatusChangeConfirmationModalProps {
  currentStatus: OrderStatus;
  nextStatus: OrderStatus;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function StatusChangeConfirmationModal({
  currentStatus,
  nextStatus,
  onConfirm,
  onCancel,
  loading = false,
}: StatusChangeConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Confirm Status Change</h2>
        <p className="mt-3 text-sm text-gray-600">
          Change order status from <span className="font-medium">{currentStatus}</span> to{" "}
          <span className="font-medium">{nextStatus}</span>?
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full bg-olive px-6 py-3 text-sm font-semibold text-white transition hover:bg-olive-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating…" : "Confirm"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
