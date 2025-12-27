const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const sendResponse = (res, statusCode, data, message) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    data: data,
    message: message
  });
};


exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { category, status, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const total = await Product.countDocuments(query);
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    const categories = Product.schema.path('category').enumValues;
    const uoms = Product.schema.path('uom').enumValues;
    
    sendResponse(res, 200, {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      },
      filters: {
        categories,
        uoms,
        statuses: ['active', 'inactive']
      }
    }, "Products fetched successfully");
  } catch (error) {
    next(error);
  }
};


exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    sendResponse(res, 200, product, "Product fetched successfully");
  } catch (error) {
    next(error);
  }
};


exports.createProduct = async (req, res, next) => {
  try {
    let imageData = {};
    
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageData = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    }
    
    const product = new Product({
      ...req.body,
      image: imageData
    });
    
    await product.save();
    
    sendResponse(res, 201, product, "Product created successfully");
  } catch (error) {
    next(error);
  }
};


exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    let imageData = product.image;
    
    if (req.file) {
      if (product.image && product.image.publicId) {
        await deleteFromCloudinary(product.image.publicId);
      }
      
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageData = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    }
    
    Object.keys(req.body).forEach(key => {
      if (key !== 'image') {
        product[key] = req.body[key];
      }
    });
    
    product.image = imageData;
    product.updatedAt = Date.now();
    
    await product.save();
    
    sendResponse(res, 200, product, "Product updated successfully");
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    if (product.image && product.image.publicId) {
      await deleteFromCloudinary(product.image.publicId);
    }
    
    await product.deleteOne();
    
    sendResponse(res, 200, null, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};


exports.getProductOptions = async (req, res, next) => {
  try {
    const categories = Product.schema.path('category').enumValues;
    const uoms = Product.schema.path('uom').enumValues;
    
    sendResponse(res, 200, {
      categories,
      uoms,
      weightUnits: ['gms', 'ml', 'kg', 'liter', 'mg'],
      statuses: ['active', 'inactive']
    }, "Product options fetched successfully");
  } catch (error) {
    next(error);
  }
};


exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const categories = Product.schema.path('category').enumValues;
    if (!categories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${categories.join(', ')}`
      });
    }
    
    const query = { category };
    const total = await Product.countDocuments(query);
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    
    sendResponse(res, 200, {
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      },
      category
    }, `Products in ${category} category`);
  } catch (error) {
    next(error);
  }
};


exports.getProductStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const inactiveProducts = await Product.countDocuments({ status: 'inactive' });
    
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    sendResponse(res, 200, {
      totalProducts,
      activeProducts,
      inactiveProducts,
      categoryStats
    }, "Product statistics fetched");
  } catch (error) {
    next(error);
  }
};