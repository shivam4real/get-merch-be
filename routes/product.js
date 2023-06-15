const express = require("express")
const router = express.Router()
const multer = require("multer")
const PRODUCT = require("../model/Product-Model")
const { decodeToken } = require("../jwt/jwt")

const upload = multer({ dest: "uploads/" })

router.post("/", async (req, res) => {
    let { page = 1, limit = 10 } = req.body

    try {
        let totalCount = await PRODUCT.count()
        let productList = await PRODUCT.find({})
            .select({ __v: 0 })
            .skip((page - 1) * limit)
            .limit(limit * 1)

        res.status(200).json({
            sucess: true,
            data: productList,
            count: totalCount,
        })
    } catch (err) {
        res.status(400).json({
            sucess: false,
            message: "Error " + err,
        })
    }
})

router.get("/:id", async (req, res) => {
    let id = req.params.id
    try {
        let product = await PRODUCT.findById({ _id: id })

        if (product) {
            res.status(200).json({
                sucess: true,
                data: product,
            })
        } else {
            res.status(400).json({
                sucess: false,
                message: "wrong Product id",
            })
        }
    } catch (err) {
        res.status(400).json({
            sucess: false,
            message: "Error " + err,
        })
    }
})

/**
 * only Andmin or creator should have access to this endpoint
 */
router.post("/addProduct", upload.single("photo"), async (req, res) => {
    // Only Admin can access this route
    let { productType, price, color, size, creator } = req.body
    console.log(req.file)
    try {
        let addProduct = new PRODUCT({
            productType: productType,
            price: price,
            color: color,
            size: size,
            productPhoto: req.file.filename,
            creator: creator,
        })
        let addProductRes = await addProduct.save()
        if (addProductRes) {
            res.status(201).json({
                sucess: true,
                message: "Product created.",
            })
        } else {
            res.status(400).json({
                sucess: false,
                message: "Product not created.",
            })
        }
    } catch (err) {
        res.status(500).json({
            sucess: false,
            message: "ERR " + err,
        })
    }
})

module.exports = router
