import { RedisCache } from "shared-redis"

import { CustomerDAO } from './dao.js';
import { CustomerModel } from './model.js';

export class CustomerRepository {
    constructor() {
        this.customerDAO = new CustomerDAO();
    }

    async create(customer) {
        try {
            this.validarHumano(customer);

            const createdCustomer = await this.customerDAO.create(customer);
            await RedisCache.getInstance().del("customers");
            return this.mapToModel(createdCustomer);
        } catch (error) {
            throw new Error(`Error del repo creando cliente: ${error}`);
        }
    }

    async findById(id) {
        const cachedkey = `customer:${id}`;
        try {
            const cached = await RedisCache.getInstance().get < CustomerModel > (cachedkey);
            if (cached) {
                console.log("Cache hit for", cachedkey);
                return this.mapToModel(cached);
            }
            if (id <= 0) {
                throw new Error('El ID del cliente debe ser un número positivo');
            }

            const customer = await this.customerDAO.findById(id);
            await RedisCache.getInstance().set(cachedkey, customer, 60 * 5);
            return customer ? this.mapToModel(customer) : null;
        } catch (error) {
            throw new Error(`Error del repo buscando cliente por ID: ${error}`);
        }
    }

    async findAll() {
        const cachedkey = `customers`;
        try {
            const cached = await RedisCache.getInstance().get(cachedkey);
            if (cached) {
                console.log("Cache hit for", cachedkey);
                return cached.map(customer => this.mapToModel(customer));
            }

            const customers = await this.customerDAO.findAll();
            await RedisCache.getInstance().set(cachedkey, customers, 60 * 5);
            return customers.map(customer => this.mapToModel(customer));
        } catch (error) {
            throw new Error(`Error del repo buscando todos los clientes: ${error}`);
        }
    }

    async update(id, customer) {
        const cachedkey = `customer:${id}`;
        try {
            if (id <= 0) {
                throw new Error('El ID del cliente debe ser un número positivo');
            }

            this.validarHumano(customer);

            const updatedCustomer = await this.customerDAO.update(id, customer);

            await RedisCache.getInstance().del(cachedkey);
            await RedisCache.getInstance().del("customers");
            return this.mapToModel(updatedCustomer);
        } catch (error) {
            throw new Error(`Error del repo actualizando cliente: ${error}`);
        }
    }

    async delete(id) {
        const cachedkey = `customer:${id}`;
        try {
            if (id <= 0) {
                throw new Error('El ID del cliente debe ser un número positivo');
            }

            await this.customerDAO.delete(id);
            await RedisCache.getInstance().del(cachedkey);
            await RedisCache.getInstance().del("customers");
        } catch (error) {
            throw new Error(`Error del repo eliminando cliente: ${error}`);
        }
    }

    async findByEmail(email) {
        try {
            if (!email || !this.isValidEmail(email)) {
                throw new Error('Formato de correo electrónico inválido');
            }

            const customer = await this.customerDAO.findByEmail(email);
            return customer ? this.mapToModel(customer) : null;
        } catch (error) {
            throw new Error(`Error del repo buscando cliente por correo: ${error}`);
        }
    }

    async findByName(name) {
        const cachedkey = `customers`;
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('El nombre no puede estar vacío');
            }

            let allCustomers;
            let cached = await RedisCache.getInstance().get(cachedkey);

            if (cached) {
                console.log("Cache hit for", cachedkey);
                allCustomers = cached;
            } else { allCustomers = await this.customerDAO.findAll(); }
            if (!cached) await RedisCache.getInstance().set(cachedkey, allCustomers, 60 * 5);
            const filteredCustomers = allCustomers.filter(customer =>
                customer.name.toLowerCase().includes(name.toLowerCase())
            );
            return filteredCustomers.map(customer => this.mapToModel(customer));
        } catch (error) {
            throw new Error(`Error del repo buscando clientes por nombre: ${error}`);
        }
    }

    async findActiveCustomers() {
        const cachedkey = `customers`;
        try {
            let allCustomers;
            let cached = await RedisCache.getInstance().get(cachedkey);

            if (cached) {
                console.log("Cache hit for", cachedkey);
                allCustomers = cached;
            } else { allCustomers = await this.customerDAO.findAll(); }
            if (!cached) await RedisCache.getInstance().set(cachedkey, allCustomers, 60 * 5);
            return allCustomers.map(customer => this.mapToModel(customer));
        } catch (error) {
            throw new Error(`Error del repo buscando clientes activos: ${error}`);
        }
    }

    mapToModel(daoResult) {
        if (!daoResult) {
            throw new Error('No se pueden mapear datos de cliente nulos o indefinidos');
        }

        const customer = new CustomerModel({
            id: daoResult.id,
            name: daoResult.name,
            email: daoResult.email,
            phone: daoResult.phone,
            address: daoResult.address
        });

        this.validarHumano(customer);

        return customer;
    }

    validarHumano(customer) {
        if (!customer.name || customer.name.trim().length === 0) {
            throw new Error('El nombre del cliente no puede estar vacío');
        }

        if (!customer.email || !this.isValidEmail(customer.email)) {
            throw new Error('El cliente debe tener una dirección de correo válida');
        }

        if (!customer.address || customer.address.trim().length === 0) {
            throw new Error('La dirección del cliente no puede estar vacía');
        }

        if (customer.phone && customer.phone.length < 8) {
            throw new Error('El número de teléfono debe tener al menos 8 caracteres');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
