const express = require("express");
const Router = express.Router();
const authController = require("./../controller/authController");
const productController = require("./../controller/productController");
Router.get("/allProducts", productController.getAllProducts);
Router.get("/download/:id",
productController.getDownload,
); 

Router.delete("/delete/:id",
productController.deleteProduct,
);                                  
Router.post("/addProduct",
productController.uploadImages.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), 
productController.saveImages,
productController.addProduct,
);
Router.patch("/updateProduct/:id",
productController.uploadImages.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), 
productController.saveImages,
productController.updateProduct,
);

module.exports = Router;
