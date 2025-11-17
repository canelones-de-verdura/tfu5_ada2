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
        this.customerId = data.customerId ? Number(data.customerId) : 0;
        this.orderDate = data.orderDate ? new Date(data.orderDate) : new Date();
        this.status = data.status || OrderStatus.PENDING;
        this.totalAmount = data.totalAmount ? Number(data.totalAmount) : 0;
        this.items = (data.items ?? []).map((item) =>
            item instanceof OrderItemModel ? item : new OrderItemModel(item)
        );
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }

}

export class OrderModel {
    constructor(data) {
        this.id = data.id ? Number(data.id) : 0;
        this.customerId = data.customerId ? Number(data.customerId) : 0;
        this.orderDate = data.orderDate ? new Date(data.orderDate) : new Date();
        this.status = data.status || OrderStatus.PENDING;
        this.totalAmount = data.totalAmount ? Number(data.totalAmount) : 0;
        this.items = (data.items ?? []).map((item) =>
            item instanceof OrderItemModel ? item : new OrderItemModel(item)
        );
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }
}
