import { ProductRepository } from '../persistence/repository.js';
import { ProductModel } from '../persistence/model.js';

export class ProductService {
    constructor() {
        this.productRepository = new ProductRepository();
    }

    /**
     * Obtiene todos los productos.
     */
    async getAllProducts() {
        return this.productRepository.findAll();
    }

    /**
     * Obtiene un producto por su ID.
     * @param id El ID del producto.
     */
    async getProductById(id) {
        // El Repository ya se encarga de buscar las categorías.
        return this.productRepository.findById(id);
    }

    /**
     * Obtiene productos por categoría.
     * @param categoryId El ID de la categoría.
     */
    async getProductsByCategory(categoryId) {
        return this.productRepository.findByCategory(categoryId);
    }

    /**
     * Crea un nuevo producto.
     * @param productData Datos del producto a crear.
     */
    async createProduct(productData) {
        const newProduct = new ProductModel(productData);
        return this.productRepository.create(newProduct);
    }

    /**
     * Actualiza un producto existente.
     * @param id El ID del producto a actualizar.
     * @param productData Datos parciales para actualizar.
     */
    async updateProduct(id, productData) {
        const existingProduct = await this.productRepository.findById(id);
        if (!existingProduct) {
            return null;
        }

        // Fusiona los datos existentes con los nuevos
        const updatedProductData = new ProductModel({
            ...existingProduct,
            ...productData,
            id: id
        });

        return this.productRepository.update(id, updatedProductData);
    }

    /**
     * Elimina un producto por su ID.
     * @param id El ID del producto a eliminar.
     */
    async deleteProduct(id) {
        return this.productRepository.delete(id);
    }

    /**
     * Busca productos por nombre.
     * @param name El nombre o parte del nombre a buscar.
     */
    async searchProductsByName(name) {
        return this.productRepository.findByName(name);
    }

    /**
     * Obtiene productos con stock bajo.
     * @param threshold El umbral de stock bajo (por defecto 10).
     */
    async getLowStockProducts(threshold = 10) {
        return this.productRepository.findLowStockProducts(threshold);
    }

    /**
     * Actualiza solo el stock de un producto.
     * @param id El ID del producto.
     * @param newStock El nuevo valor de stock.
     */
    async updateProductStock(id, newStock) {
        return this.productRepository.updateStock(id, newStock);
    }
}
