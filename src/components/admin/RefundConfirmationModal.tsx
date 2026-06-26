"use client";

import React from "react";

interface RefundConfirmationModalProps {
  orderAmount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function RefundConfirmationModal({
  orderAmount,
  onConfirm,
  onCancel,
  loading,
}: RefundConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Confirm Refund
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Refund ₹{orderAmount.toLocaleString()} to customer?
          </p>
          <p className="mt-1 text-xs text-gray-500">
            This action cannot be undone. The payment will be refunded through Razorpay.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="ml-2">Processing...</span>
              </div>
            ) : (
              "Confirm Refund"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}