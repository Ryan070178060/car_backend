const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const jwt = require('jsonwebtoken');
const cors= require("cors");

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// Database connection with MongoDB
mongoose.connect("mongodb+srv://Ryan:shamala254@cluster0.brlg6co.mongodb.net", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// API Creation
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
  return   cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage:storage });

// Creating Upload Endpoint for images
app.use('/api/images', express.static(path.join(__dirname, 'api/upload/images')))

app.post("/api/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `https://car-backend-tt86.onrender.com/api/images/${req.file.filename}`
  });
});

// Schema for creating products
const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

const Product = mongoose.model("Product", productSchema);






// Create API for adding products
app.post('/api/addproduct', async (req, res) => {
  try {
    const products = await Product.find({});
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const newProduct = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await newProduct.save();
    console.log("Product Saved");
    
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Create API for deleting products
app.post('/api/removeproduct', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Product Removed");
    
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

//Creating API for getting all products
app.get('/api/allproducts', async (req,res)=>{
    let products = await Product.find({});
    console.log('All Products Fetched');
    res.send(products);
});

//Creating endpoint for new collection  data
app.get('/api/newcollection', async (req,res)=>{
  let products= await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("NewCollections Fetched");
  res.send(newcollection);
});

// Start the server
app.listen(port, () => {
  console.log("Server Running on Port " + port);
});
