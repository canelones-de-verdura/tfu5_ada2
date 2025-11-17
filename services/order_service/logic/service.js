import { OrderModel, OrderItemModel, OrderStatus } from '../persistence/model.js';
import { OrderRepository } from '../persistence/repository.js';

export class OrderService {
    constructor() {
        this.orderRepository = new OrderRepository();
    }

    async findProductById(id) {
        const response = await fetch(`localhost:8080/api/products/${id}`)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return response.body;
    }

    async updateProduct(id, product) {
        const response = await fetch(`localhost:8080/api/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(product),
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
    }

    /**
     * Obtiene todas las órdenes.
     */
    async getAllOrders() {
        return this.orderRepository.findAll();
    }

    /**
     * Obtiene una orden por su ID.
     * @param id El ID de la orden.
     */
    async getOrderById(id) {
        // El Repository ya se encarga de buscar los items de la orden.
        return this.orderRepository.findById(id);
    }

    /**
     * Obtiene todas las órdenes de un cliente específico.
     * @param customerId El ID del cliente.
     */
    async getOrdersByCustomerId(customerId) {
        return this.orderRepository.findByCustomerId(customerId);
    }

    /**
     * Crea una nueva orden, validando stock y calculando el total.
     * @param orderData Datos de la orden a crear.
     */
    async createOrder(orderData) {
        if (!orderData.items || orderData.items.length === 0) {
            throw new Error('La orden debe tener al menos un ítem.');
        }

        let totalAmount = 0;
        const itemsWithDetails = [];

        // 1. Validar stock y calcular precios y total
        for (const item of orderData.items) {
            const product = await this.findProductById(item.productId);
            if (!product) {
                throw new Error(`El producto con ID ${item.productId} no existe.`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para el producto: ${product.name}.`);
            }

            item.unitPrice = product.price;
            item.subtotal = product.price * item.quantity;
            totalAmount += item.subtotal;
            itemsWithDetails.push(new OrderItemModel(item));
        }

        // 2. Crear el objeto de la orden completo
        const newOrder = new OrderModel({
            ...orderData,
            items: itemsWithDetails,
            totalAmount: totalAmount,
            status: OrderStatus.PENDING,
            orderDate: new Date(),
            updatedAt: new Date()
        });

        // 3. Crear la orden en la base de datos
        const createdOrder = await this.orderRepository.create(newOrder);

        // 4. Actualizar el stock de los productos
        for (const item of createdOrder.items) {
            const currentProduct = await this.findProductById(item.productId);
            currentProduct.stock = currentProduct.stock - item.quantity;
            if (currentProduct) {
                await this.updateProduct(item.productId, currentProduct);
            }
        }

        return createdOrder;
    }

    /**
     * Actualiza el estado de una orden.
     * @param id El ID de la orden.
     * @param status El nuevo estado.
     */
    async updateOrderStatus(id, status) {
        return this.orderRepository.updateStatus(id, status);
    }

    /**
     * Elimina una orden y repone el stock de los productos.
     * @param id El ID de la orden a eliminar.
     */
    async deleteOrder(id) {
        // 1. Obtener la orden para saber qué productos reponer
        const orderToDelete = await this.orderRepository.findById(id);
        if (orderToDelete && orderToDelete.items) {
            // 2. Reponer el stock
            for (const item of orderToDelete.items) {
                const currentProduct = await this.findProductById(item.productId);
                currentProduct.stock = currentProduct.stock + item.quantity;
                if (currentProduct) {
                    await this.updateProduct(item.productId, currentProduct);
                }
            }
        }

        // 3. Eliminar la orden
        return this.orderRepository.delete(id);
    }

    /**
     * Obtiene órdenes por estado.
     * @param status El estado de las órdenes a buscar.
     */
    async getOrdersByStatus(status) {
        return this.orderRepository.findByStatus(status);
    }

    /**
     * Obtiene todas las órdenes pendientes.
     */
    async getPendingOrders() {
        return this.orderRepository.findPendingOrders();
    }

    /**
     * Obtiene órdenes dentro de un rango de fechas.
     * @param startDate Fecha de inicio.
     * @param endDate Fecha de fin.
     */
    async getOrdersByDateRange(startDate, endDate) {
        return this.orderRepository.findOrdersByDateRange(startDate, endDate);
    }

    /**
     * Calcula el revenue total de órdenes entregadas.
     */
    async calculateTotalRevenue() {
        return this.orderRepository.calculateTotalRevenue();
    }
}
