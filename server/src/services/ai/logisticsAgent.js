import { db } from '../../config/db.js';

export class LogisticsAgent {
  static async handleTrackingInquiry(query, userId) {
    const orders = userId ? await db.getUserOrders(userId) : [];

    const orderMatch = query.match(/(?:ORD-\d{4}-\d+|TRK-[A-Z]+-\d+|\b\d{5}\b)/i);
    let targetOrder = null;

    if (orderMatch) {
      const idOrNumber = orderMatch[0];
      targetOrder = await db.getOrderById(idOrNumber, userId);
    }

    if (!targetOrder && orders.length > 0) {
      targetOrder = orders[0];
    }

    if (!targetOrder) {
      return {
        message: "I couldn't locate an active shipment matching your query. Please provide a valid Order ID (e.g. ORD-2026-89412) or tracking number.",
        order: null,
        timeline: []
      };
    }

    return {
      message: `Your order #${targetOrder.order_number} is currently ${targetOrder.status}. Carrier: ${targetOrder.carrier} (Tracking: ${targetOrder.tracking_number}).`,
      order: {
        orderNumber: targetOrder.order_number,
        trackingNumber: targetOrder.tracking_number,
        status: targetOrder.status,
        carrier: targetOrder.carrier,
        estimatedDelivery: targetOrder.estimated_delivery,
        shippingAddress: targetOrder.shipping_address
      },
      timeline: targetOrder.tracking_events || []
    };
  }
}
