const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { productValidationRules, idValidationRules, validate } = require('../middlewares/validate');
const upload = require('../middlewares/upload');

router.get('/options', productController.getProductOptions);

router.get('/stats/summary', productController.getProductStats);

router.get('/', productController.getProducts);

router.get('/category/:category', productController.getProductsByCategory);

router.get('/:id', idValidationRules(), validate, productController.getProductById);

router.post('/',
  upload.single('image'),
  productValidationRules(),
  validate,
  productController.createProduct
);

router.put('/:id',
  upload.single('image'),
  idValidationRules(),
  productValidationRules(),
  validate,
  productController.updateProduct
);

router.delete('/:id', idValidationRules(), validate, productController.deleteProduct);

module.exports = router;