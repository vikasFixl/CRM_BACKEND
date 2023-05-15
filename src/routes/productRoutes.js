const express = require("express");
const router = express.Router();
const product = require("../controllers/productController");

router.get("/getAllProducts/:firmId", product.getAllProducts);
router.get("/getProductDetails/:id", product.getProductDetails);

router.post("/createProduct", product.createProduct);

router.patch("/updateProduct/:id", product.updateProduct);
router.patch("/softDeleteProduct/:id", product.softDeleteProduct);

router.delete("/deleteProduct/:id", product.deleteProduct);

module.exports = router;
