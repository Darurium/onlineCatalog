const { Product, ProductInfo } = require("../models/models");
const ApiError = require("../error/ApiError");
const uuid = require("uuid");
const path = require("path");

class ProductController {

    async create(req, res, next) {
        try {
            let { name, price, typeId, brandId, info } = req.body;
            const { img } = req.files;
            const fileName = uuid.v4() + ".jpg";
            img.mv(path.resolve(__dirname, "..", "static", fileName));
            const product = await Product.create({ name, price, typeId, brandId, img: fileName });

            if (info) {
                info = JSON.parse(info);
                info.forEach(item => {
                    ProductInfo.create({
                        title: item.title,
                        description: item.description,
                        productId: product.id
                    })
                })
            }

            
            return res.json(product)
        } catch (error) {
            next(ApiError.badRequest(error.message))
        }
    }

    async getAll(req, res) {
        let { typeId, brandId, limit, page } = req.query;
        page = page || 1;
        limit = limit || 9;
        let offset = page * limit - limit;
        let products;
        if (!typeId && !brandId) {
            products = await Product.findAndCountAll({ limit, offset });
        };
        if (!typeId && brandId) {
            products = await Product.findAndCountAll({ where: { brandId }, limit, offset });
        };
        if (typeId && !brandId) {
            products = await Product.findAndCountAll({ where: { typeId }, limit, offset });
        };
        if (typeId && brandId) {
            products = await Product.findAndCountAll({ where: { brandId, typeId }, limit, offset });
        };

        return res.json(products);
    }

    async getOne(req, res) {
        const {id} = req.params;
        const product = await Product.findOne({
            where: {id},
            include: [{model: ProductInfo, as: "info"}]
        });
        return res.json(product);
    }

}


module.exports = new ProductController();