import { CustomerRepository } from '../persistence/repository.js';
import { CustomerModel } from '../persistence/model.js';

export class CustomerService {
    constructor() {
        this.customerRepository = new CustomerRepository();
    }

    /**
     * Obtiene todos los clientes.
     */
    async getAllCustomers() {
        return this.customerRepository.findAll();
    }

    /**
     * Obtiene un cliente por su ID.
     * @param id El ID del cliente.
     */
    async getCustomerById(id) {
        return this.customerRepository.findById(id);
    }

    /**
     * Obtiene un cliente por su email.
     * @param email El email del cliente.
     */
    async getCustomerByEmail(email) {
        return this.customerRepository.findByEmail(email);
    }

    /**
     * Crea un nuevo cliente.
     * @param customerData Datos parciales del cliente.
     */
    async createCustomer(customerData) {
        const newCustomer = new CustomerModel(customerData);
        return this.customerRepository.create(newCustomer);
    }

    /**
     * Actualiza un cliente existente.
     * @param id El ID del cliente a actualizar.
     * @param customerData Datos parciales para actualizar.
     */
    async updateCustomer(id, customerData) {
        const existingCustomer = await this.customerRepository.findById(id);
        if (!existingCustomer) {
            return null; // O lanzar un error
        }

        // Fusiona los datos existentes con los nuevos
        const updatedCustomerData = new CustomerModel({
            ...existingCustomer,
            ...customerData,
            id: id // Asegura que el ID no cambie
        });

        return this.customerRepository.update(id, updatedCustomerData);
    }

    /**
     * Elimina un cliente por su ID.
     * @param id El ID del cliente a eliminar.
     */
    async deleteCustomer(id) {
        return this.customerRepository.delete(id);
    }

    /**
     * Busca clientes por nombre.
     * @param name El nombre o parte del nombre a buscar.
     */
    async searchCustomersByName(name) {
        return this.customerRepository.findByName(name);
    }

    /**
     * Obtiene todos los clientes activos.
     */
    async getActiveCustomers() {
        return this.customerRepository.findActiveCustomers();
    }
}

