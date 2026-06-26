import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase";
import { PRODUCT_COLLECTION } from "../data/products";
import type { OrderItem } from "../orders/firestore";

export interface InventoryDeductionResult {
  success: boolean;
  error?: string;
}

export interface InventoryRestoreResult {
  success: boolean;
  error?: string;
}

/**
 * Atomically deduct stock for an order using Firestore transactions.
 * This prevents race conditions and negative inventory.
 */
export async function deductInventoryForOrder(
  productId: string,
  items: OrderItem[]
): Promise<InventoryDeductionResult> {
  try {
    const productRef = doc(db, PRODUCT_COLLECTION, productId);

    await runTransaction(db, async (transaction) => {
      // Read current product data
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists()) {
        throw new Error("Product not found");
      }

      const productData = productDoc.data();
      const currentSizeStock = productData.sizeStock || {};

      // Check if we have sufficient stock for all items
      const updatedSizeStock = { ...currentSizeStock };
      
      for (const item of items) {
        const currentStock = currentSizeStock[item.size] || 0;
        
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for size ${item.size}. Available: ${currentStock}, Requested: ${item.quantity}`);
        }
        
        updatedSizeStock[item.size] = currentStock - item.quantity;
        
        // Ensure we never go below 0
        if (updatedSizeStock[item.size] < 0) {
          throw new Error(`Invalid stock calculation for size ${item.size}`);
        }
      }

      // Update the product with new stock levels
      transaction.update(productRef, {
        sizeStock: updatedSizeStock,
        updatedAt: new Date().toISOString(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Inventory deduction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update inventory",
    };
  }
}

/**
 * Atomically restore stock for a cancelled order using Firestore transactions.
 * This prevents race conditions and ensures inventory is restored correctly.
 */
export async function restoreInventoryForOrder(
  productId: string,
  items: OrderItem[]
): Promise<InventoryRestoreResult> {
  try {
    const productRef = doc(db, PRODUCT_COLLECTION, productId);

    await runTransaction(db, async (transaction) => {
      // Read current product data
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists()) {
        throw new Error("Product not found");
      }

      const productData = productDoc.data();
      const currentSizeStock = productData.sizeStock || {};

      // Restore stock for all items
      const updatedSizeStock = { ...currentSizeStock };
      
      for (const item of items) {
        const currentStock = currentSizeStock[item.size] || 0;
        updatedSizeStock[item.size] = currentStock + item.quantity;
      }

      // Update the product with restored stock levels
      transaction.update(productRef, {
        sizeStock: updatedSizeStock,
        updatedAt: new Date().toISOString(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Inventory restoration failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore inventory",
    };
  }
}