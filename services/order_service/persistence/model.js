export const OrderItemType = Object.freeze({
    PRODUCT: 'PRODUCT',
    DISCOUNT: 'DISCOUNT',
})

export const OrderStatus = Object.freeze({
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
})

export class OrderItemModel {
    constructor(data) {
        this.id = data.id ? Number(data.id) : 0;
        this.orderId = data.orderId ? Number(data.orderId) : 0;
        this.productId = data.productId ? Number(data.productId) : 0;
        this.quantity = data.quantity ? Number(data.quantity) : 0;
        this.unitPrice = data.unitPrice ? Number(data.unitPrice) : 0;
        this.subtotal = data.subtotal ? Number(data.subtotal) : (this.quantity * this.unitPrice);
    }
}

export class OrderModel {
    constructor(data) {
        this.id = data.id ? Number(data.id) : 0;
        this.customerId = data.customerId || data.customer_id ? Number(data.customerId || data.customer_id) : 0;
        this.orderDate = data.orderDate || data.order_date ? new Date(data.orderDate || data.order_date) : new Date();
        this.status = data.status || OrderStatus.PENDING;
        this.totalAmount = data.totalAmount || data.total_amount ? Number(data.totalAmount || data.total_amount) : 0;
        this.items = (data.items ?? []).map((item) =>
            item instanceof OrderItemModel ? item : new OrderItemModel(item)
        );
        this.updatedAt = data.updatedAt || data.updated_at ? new Date(data.updatedAt || data.updated_at) : new Date();
    }
}
