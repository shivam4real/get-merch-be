const express = require("express");
const router = express.Router();
const multer = require("multer");
const PRODUCT = require("../model/Product-Model");
const { decodeToken } = require("../jwt/jwt");
const fs = require("fs");

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
        success: true,
        data: {
          ...product._doc,
          photo: `data:image/jpeg;base64,${product.photo}`, // Send the Base64 image with the proper data URI
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Wrong Product ID",
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
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

  // Validate required fields
  if (!productType || !price || !color || !size || !creator) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  // Validate if a file is uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Photo is required.",
    });
  }

  // Validate file type (ensure it's an image)
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only JPEG and PNG are allowed.",
    });
  }

  try {
    // Convert the uploaded file to a Base64 string
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    let addProduct = new PRODUCT({
      productType: productType,
      price: price,
      color: color,
      size: size,
      creator: creator,
      photo: base64Image, // Save the Base64 string in the database
    });

    let addProductRes = await addProduct.save();
    if (addProductRes) {
      res.status(201).json({
        success: true,
        message: "Product created.",
        data: addProductRes,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Product not created.",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "ERR " + err,
    });
  }
});

// Add a route to update a product
router.put("/:id", upload.single("photo"), async (req, res) => {
  let id = req.params.id;
  let { productType, price, color, size, creator } = req.body;

  // Validate required fields
  if (!productType || !price || !color || !size || !creator) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    let updateFields = { productType, price, color, size, creator };

    // If a file is uploaded, process the image
    if (req.file) {
      // Validate file type (ensure it's an image)
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only JPEG and PNG are allowed.",
        });
      }

      // Convert the uploaded file to a Base64 string
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString("base64");
      updateFields.photo = base64Image; // Add the Base64 image to the update fields
    }

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
