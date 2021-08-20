const multer = require("multer");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const path=require('path');
// multiple images uploads
const imagesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const imagesFilter = (req, file, cb) => {
  console.log("image filtered");
  if (true) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload images", 400), false);
  }
};

const imagesUpload = multer({
  storage: imagesStorage,
  fileFilter: imagesFilter,
});

exports.uploadImages = imagesUpload;
// save to the database in image array
exports.saveImages = catchAsync(async (req, res, next) => {
  if (req.files['image']) {
    req.body.image=req.files['image'][0].filename;
  }
  if (req.files['file']) {
    req.body.name=req.files['file'][0].filename;
    req.body.size=req.files['file'][0].size;
  }
  // console.log(req.files['file'][0]);
  // console.log(req.files['image'][0]);
  next();
});

exports.addProduct = catchAsync(async (req, res) => {
    const {image,name,size,}=req.body;
  const product = await Product.create({image,name,size:(size/1000000).toFixed(2)});
  res.status(201).json({
    status: "success",
    product,
  });
})
exports.getDownloadskhfd=catchAsync(async (req, res) => {
  const {title}=req.params;
console.log({title});
const {file,downloads} = await Apk.findOne({title});
await Apk.findOneAndUpdate({title},{downloads:downloads+1})
console.log({downloads});
  const readyFile = path.join(__dirname, `../public/apk/${file}`);
  res.download(readyFile);
  // console.log('dowloaded');
  // res.sendFile(readyFile);
});
exports.getDownload = catchAsync(async (req, res) => {
  const {id}=req.params;
const {name,downloads} = await Product.findById(id);
await Product.findByIdAndUpdate(id,{downloads:downloads+1})
  const readyFile = path.join(__dirname, `../public/img/${name}`);
  res.download(readyFile);
});
exports.deleteProduct = catchAsync(async (req, res) => {
  const id=req.params.id;
const product = await Product.findByIdAndDelete(id);
res.status(200).json({
  status: "success",
  product,
});
})

exports.updateProduct = catchAsync(async (req, res) => {
  const {id}=req.params;
  const data=req.body;
  if(data.size){
    data.size=(data.size/1000000).toFixed(2);
    data.modifiedAt=new Date();
    data.downloads=0;
  } 
const product = await Product.findByIdAndUpdate(id,data);
res.status(201).json({
  status: "success",
  product,
});
});
exports.addProductImages= catchAsync(async (req, res) => {
  const {id}=req.params;
const product = await Product.findByIdAndUpdate(id,{images:req.body.images});
res.status(201).json({
  status: "success",
  product,
});
});

exports.getAllProducts=catchAsync(async (req, res) => {
const data = await Product.find().populate('reviews');;
res.status(200).json({
  status: "success",
  data,
});
});
exports.getProductsWithCategories = catchAsync(async (req, res) => {
  const {category,subcategory}=req.params;
const data = await Product.find({category:`${category}/${subcategory}`});
  res.status(200).json({ data });
});