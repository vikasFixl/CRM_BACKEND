const express = require("express");
const router = express.Router();
const product = require("../controllers/productController");
const { authorize } = require("../middleweare/middleware");

router.get("/getAllProducts/:firmId", authorize('Read', 'firm', ['Admin', 'subAdmin', 'Custom']), product.getAllProducts);
router.get("/getProductDetails/:id", authorize('Read', 'firm', ['Admin', 'subAdmin', 'Custom']), product.getProductDetails);

router.post("/createProduct", authorize('Update', 'firm', ['Admin', 'subAdmin', 'Custom']), product.createProduct);

router.patch("/updateProduct/:id", authorize('Update', 'firm', ['Admin', 'subAdmin', 'Custom']), product.updateProduct);
router.patch("/softDeleteProduct/:id", product.softDeleteProduct);

router.delete("/deleteProduct/:id", authorize('Delete', 'firm', ['Admin', 'Custom']), product.deleteProduct);

module.exports = router;
