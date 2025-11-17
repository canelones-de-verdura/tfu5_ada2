import { CustomerService } from "../logic/service.js";

const service = new CustomerService()

export async function getAllCustomers(req, res) {
    try {
        const customers = await service.getAllCustomers();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los clientes", error: error.message });
    }
}

export async function getCustomerById(req, res) {
    try {
        const id = parseInt(req.params.id);
        const customer = await service.getCustomerById(id);

        if (!customer) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        return res.status(200).json(customer);
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el cliente", error: error.message });
    }
}

export async function createCustomer(req, res) {
    try {
        const newCustomer = await service.createCustomer(req.body);

        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el cliente", error: error.message });
    }
}

export async function updateCustomer(req, res) {
    try {
        const id = parseInt(req.params.id);
        const updatedCustomer = await service.updateCustomer(id, req.body);

        if (!updatedCustomer) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        return res.status(200).json(updatedCustomer);
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar el cliente", error: error.message });
    }
}

export async function deleteCustomer(req, res) {
    try {
        const id = parseInt(req.params.id);
        await service.deleteCustomer(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el cliente", error: error.message });
    }
}

// solo porque lo pide la letra
export async function createCustomerSOAP(req, res) {
    try {
        const xml = req.body;

        const name = extract(xml, 'name');
        const email = extract(xml, 'email');

        const payload = { name, email };

        const newCustomer = await service.createCustomer(payload);

        const responseXML = `
            <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <CreateCustomerResponse>
                        <id>${newCustomer.id}</id>
                        <name>${newCustomer.name}</name>
                        <email>${newCustomer.email}</email>
                        <createdAt>${newCustomer.createdAt}</createdAt>
                    </CreateCustomerResponse>
                </soap:Body>
            </soap:Envelope>
        `;

        res.set('Content-Type', 'text/xml');
        res.status(200).send(responseXML);

    } catch (error) {
        const faultXML = `
            <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Body>
                    <soap:Fault>
                        <faultcode>soap:Server</faultcode>
                        <faultstring>Error al crear el cliente: ${error.message}</faultstring>
                    </soap:Fault>
                </soap:Body>
            </soap:Envelope>
        `;

        res.set('Content-Type', 'text/xml');
        res.status(500).send(faultXML);
    }
}

function extract(xml, tag) {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`); // magia negra
    const m = xml.match(regex);
    return m ? m[1] : null;
}

