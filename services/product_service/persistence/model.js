export class CategoryModel {
    constructor(data) {
        this.id = data.id || 0;
        this.name = data.name || '';
        this.description = data.description || '';
    }
}

export class ProductModel {
    constructor(data) {
        this.id = data.id || 0;
        this.name = data.name || '';
        this.description = data.description || '';
        this.price = data.price || 0;
        this.stock = data.stock || 0;
        this.category = (data.category ?? []).map((cat) =>
            cat instanceof CategoryModel ? cat : new CategoryModel(cat)
        );
    }
}
