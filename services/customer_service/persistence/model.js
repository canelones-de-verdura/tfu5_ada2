export class CustomerModel {
    constructor(data) {
        this.id = data.id || 0;
        this.name = data.name || '';
        this.email = data.email || '';
        this.phone = data.phone || null;
        this.address = data.address || '';
    }

    static fromJSON(json) {
        return new CustomerModel(json);
    }
}
