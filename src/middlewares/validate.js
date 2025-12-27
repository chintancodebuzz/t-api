const { body, param, validationResult } = require('express-validator');
const Product = require('../models/Product');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

const productValidationRules = () => {
  return [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('category')
      .notEmpty().withMessage('Category is required')
      .custom(async (value) => {
        const categories = Product.schema.path('category').enumValues;
        if (!categories.includes(value)) {
          throw new Error(`Category must be one of: ${categories.join(', ')}`);
        }
        return true;
      }),
    body('mrp').isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
    body('distributorRate').isFloat({ min: 0 }).withMessage('Distributor rate must be a positive number'),
    body('retailerPrice').isFloat({ min: 0 }).withMessage('Retailer price must be a positive number'),
    body('uom')
      .notEmpty().withMessage('UOM is required')
      .custom(async (value) => {
        const uoms = Product.schema.path('uom').enumValues;
        if (!uoms.includes(value)) {
          throw new Error(`UOM must be one of: ${uoms.join(', ')}`);
        }
        return true;
      }),
    body('unit').isInt({ min: 1 }).withMessage('Unit must be at least 1'),
    body('crt').isFloat({ min: 0 }).withMessage('CRT must be a positive number'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be positive'),
    body('weightUnit')
      .optional()
      .isIn(['gms', 'ml', 'kg', 'liter', 'mg', null])
      .withMessage('Invalid weight unit'),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be either active or inactive')
  ];
};

const idValidationRules = () => {
  return [
    param('id').isMongoId().withMessage('Invalid product ID')
  ];
};

module.exports = {
  validate,
  productValidationRules,
  idValidationRules
};