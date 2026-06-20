import type { OrderStatus } from "./firestore";

/**
 * Defines valid status transitions for orders.
 * Maps each status to the statuses it can transition to.
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

/**
 * Check if a transition from currentStatus to nextStatus is valid.
 */
export function isValidTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
  if (currentStatus === nextStatus) return false;
  return STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

/**
 * Get valid next statuses for the given current status.
 */
export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[currentStatus];
}

/**
 * Check if an order status is locked (no further transitions allowed).
 */
export function isStatusLocked(status: OrderStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}

/**
 * Convert Indian phone number (10 digits) to WhatsApp format (+91...).
 */
export function convertToWhatsAppPhone(indianPhone: string): string {
  const digits = indianPhone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  // Already in international format or invalid
  return digits;
}

/**
 * Build WhatsApp message for order confirmation.
 */
export function buildConfirmationMessage(
  customerName: string,
  productName: string,
  itemsSummary: string,
  totalItems: number,
  totalPrice: number
): string {
  return `Dear ${customerName},\n\nYour Pearl by Ann order has been confirmed.\n\nProduct:\n${productName}\n\nItems:\n${itemsSummary}\n\nTotal Items: ${totalItems}\nTotal Amount: ₹${totalPrice}\n\nThank you for shopping with Pearl by Ann.`;
}

/**
 * Build WhatsApp message for order shipped notification.
 */
export function buildShippedMessage(
  customerName: string,
  productName: string,
  itemsSummary: string
): string {
  return `Dear ${customerName},\n\nYour Pearl by Ann order has been shipped.\n\nProduct:\n${productName}\n\nItems:\n${itemsSummary}\n\nStatus: Shipped\n\nThank you for shopping with Pearl by Ann.`;
}

/**
 * Build WhatsApp message for order delivered notification.
 */
export function buildDeliveredMessage(customerName: string): string {
  return `Dear ${customerName},\n\nYour Pearl by Ann order has been marked as delivered.\n\nWe hope you enjoy your purchase.\n\nThank you for shopping with Pearl by Ann.`;
}

/**
 * Build WhatsApp URL with message.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}
