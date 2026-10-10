import { db } from '../../config/db.js';

export class OperationsAgent {
  /**
   * Warehouse Inventory Monitor & Restock Threshold Alerts
   */
  static async checkInventoryHealth() {
    const inventory = await db.getWarehouseInventory();
    const lowStockAlerts = inventory.filter(i => i.is_low_stock);

    return {
      totalWarehouses: 4,
      totalTrackedSKUs: inventory.length,
      criticalStockAlerts: lowStockAlerts.length,
      alerts: lowStockAlerts.map(item => ({
        warehouse: item.warehouse_code,
        productCode: item.product_code,
        productName: item.product_name,
        availableQuantity: item.quantity - item.reserved_quantity,
        reorderThreshold: item.reorder_threshold,
        shortage: item.reorder_threshold - (item.quantity - item.reserved_quantity),
        recommendedAction: `Trigger automated PO restock of ${item.reorder_threshold * 2} units to ${item.warehouse_code}`
      }))
    };
  }
}
