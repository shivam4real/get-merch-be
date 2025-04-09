const express = require("express");
const router = express.Router();
const multer = require("multer");
const PRODUCT = require("../model/Product-Model");
const { decodeToken } = require("../jwt/jwt");

const upload = multer({ dest: "uploads/" });
const validatejwtToken = require("../middleware/authMiddleware");

router.post("/", validatejwtToken, async (req, res) => {
  let { page = 1, limit = 10 } = req.body;

  try {
    let totalCount = await PRODUCT.count();
    let productList = await PRODUCT.find({})
      .select({ __v: 0 })
      .skip((page - 1) * limit)
      .limit(limit * 1);

    res.status(200).json({
      sucess: true,
      data: productList,
      count: totalCount,
    });
  } catch (err) {
    res.status(400).json({
      sucess: false,
      message: "Error " + err,
    });
  }
});

router.get("/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let product = await PRODUCT.findById({ _id: id });

    if (product) {
      res.status(200).json({
        sucess: true,
        data: product,
      });
    } else {
      res.status(400).json({
        sucess: false,
        message: "wrong Product id",
      });
    }
  } catch (err) {
    res.status(400).json({
      sucess: false,
      message: "Error " + err,
    });
  }
});

/**
 * only Andmin or creator should have access to this endpoint
 */
router.post("/addProduct", upload.single("photo"), async (req, res) => {
  // Only Admin can access this route
  let { productType, price, color, size, creator } = req.body;
  console.log(req.body);
  
//   console.log(req.file);
  try {
    let addProduct = new PRODUCT({
      productType: productType,
      price: price,
      color: color,
      size: size,
      creator: creator,
    });
    let addProductRes = await addProduct.save();
    if (addProductRes) {
      res.status(201).json({
        sucess: true,
        message: "Product created.",
      });
    } else {
      res.status(400).json({
        sucess: false,
        message: "Product not created.",
      });
    }
  } catch (err) {
    res.status(500).json({
      sucess: false,
      message: "ERR " + err,
    });
  }
});

// Add a route to update a product
router.put("/:id", async (req, res) => {
  let id = req.params.id;
  let updateFields = req.body;

  try {
    let updatedProduct = await PRODUCT.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (updatedProduct) {
      res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        data: updatedProduct,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error " + err,
    });
  }
});

// Add a route to delete a product
router.delete("/:id", async (req, res) => {
  let id = req.params.id;

  try {
    let deletedProduct = await PRODUCT.findByIdAndDelete(id);

    if (deletedProduct) {
      res.status(200).json({
        success: true,
        message: "Product deleted successfully.",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error " + err,
    });
  }
});

module.exports = router;
