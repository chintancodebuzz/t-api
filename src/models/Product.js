const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Daily', 'Bakery', 'Beverages', 'Snacks', 'Dairy', 'Frozen', 'Personal Care', 'Household', 'Other']
    },
    mrp: {
        type: Number,
        required: [true, 'MRP is required'],
        min: [0, 'MRP cannot be negative']
    },
    distributorRate: {
        type: Number,
        required: [true, 'Distributor rate is required'],
        min: [0, 'Distributor rate cannot be negative']
    },
    retailerPrice: {
        type: Number,
        required: [true, 'Retailer price is required'],
        min: [0, 'Retailer price cannot be negative']
    },
    uom: {
        type: String,
        required: [true, 'UOM is required'],
        enum: ['Pieces', 'Kg', 'Liter', 'Grams', 'Ml', 'Box', 'Packet', 'Bottle', 'Can', 'Carton']
    },
    unit: {
        type: Number,
        required: [true, 'Unit is required'],
        min: [1, 'Unit must be at least 1']
    },
    crt: {
        type: Number,
        required: [true, 'CRT is required'],
        min: [0, 'CRT cannot be negative']
    },
    image: {
        url: {
            type: String,
            default: ''
        },
        publicId: {
            type: String,
            default: ''
        }
    },
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    weightUnit: {
        type: String,
        enum: ['gms', 'ml', 'kg', 'liter', 'mg'],
        default: 'gms'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);