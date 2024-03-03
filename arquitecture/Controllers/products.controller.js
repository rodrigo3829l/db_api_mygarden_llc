import { Products } from "../models/Products.js";

export const addProduct = async (req, res) => {
    try {
        const {
            product,
            price,
            contact,
            provider
        } = req.body

        const existProduct = await Products.findOne({product})

        if(existProduct) {
            return res.json({
                success : false,
                msg : req.t('products.addProduct.existService')
            })
        }

        const newProduct = new Products ({
            product,
            price,
            contact,
            provider
        })

        await newProduct.save()

        return res.json({
            success: true,
            msg : req.t('products.addProduct.success')
        })


    } catch (error) {
        console.log("Error al agregar un nuevo producto")
        console.log(error)
        return res.json({
            success : false,
            msg : 'Error al agregar un nuevo producto'
        })
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params; // Asume que el ID del producto se pasa como parámetro en la URL
        const updateData = req.body; // Todos los campos que se desean actualizar

        const updatedProduct = await Products.findByIdAndUpdate(id, updateData, { new: true, runValidators: true  });

        if (!updatedProduct) {
            return res.json({
                success: false,
                msg: req.t('products.updateProduct.notProduct')
            });
        }

        return res.json({
            success: true,
            msg: req.t('products.updateProduct.success'),
            data: updatedProduct
        });

    } catch (error) {
        console.log("Error al actualizar el producto", error);
        return res.json({
            success: false,
            msg: 'Error al actualizar el producto'
        });
    }
};


export const setProductUsability = async (req, res) => {
    try {
        const { id } = req.params; // Asume que el ID del producto se pasa como parámetro en la URL

        const product = await Products.findById(id);

        if (!product) {
            return res.json({
                success: false,
                msg: req.t('products.usabillity.notFound')
            });
        }

        product.isUsable = !product.isUsable;
        await product.save();

        return res.json({
            success: true,
            msg: req.t('products.usabillity.success'),
            data: product
        });

    } catch (error) {
        console.log("Error al establecer la usabilidad del producto", error);
        return res.json({
            success: false,
            msg: 'Error al actualizar el estado de usabilidad del producto'
        });
    }
};
