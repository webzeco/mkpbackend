const multer = require("multer");
const Product = require("../models/productModel");
const nodeMailjet = require("node-mailjet");
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
exports.recharge = catchAsync(async (req, res, next) => {
  const{email,contactNo,message,product}=req.body;
  console.log(product);
  if (!email||!contactNo||!message) {
    res.status(200).json({
      status: "failed",
      message: "There is no user with that email ..!!!",
    });
  }
  
  
  const html = `
  <!doctype html>
  <html lang="en-US">
  <head>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
      <title>Mk World recharge request</title>
      <meta name="description" content="Reset Password Email Template.">
      <style type="text/css">


*{
 margin: 0px;
 padding: 0px;
}
body{
 font-family: arial;
}
.main{

 margin: 2%;
}

.card{
     width: 20%;
     display: inline-block;
     box-shadow: 2px 2px 20px black;
     border-radius: 5px; 
     margin: 2%;
    }

.image img{
  width: 100%;
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  

 
 }

.title{
 
  text-align: center;
  padding: 10px;
  
 }

h1{
  font-size: 20px;
 }

.des{
  padding: 3px;
  text-align: center;
 
  padding-top: 10px;
        border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}
button{
  margin-top: 40px;
  margin-bottom: 10px;
  background-color: white;
  border: 1px solid black;
  border-radius: 5px;
  padding:10px;
}
button:hover{
  background-color: black;
  color: white;
  transition: .5s;
  cursor: pointer;
}</style>
  </head>
  <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
      <!--100% body table-->
      <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
          style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
          <tr>
              <td>
                  <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                      align="center" cellpadding="0" cellspacing="0">
                      <tr>
                          <td style="height:80px;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td style="text-align:center;">
                            <a  title="logo" target="_blank">
                              <img width="60" src="https://i.ibb.co/hL4XZp2/android-chrome-192x192.png" title="logo" alt="logo">
                            </a>
                          </td>
                      </tr>
                      <tr>
                          <td style="height:20px;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td>
                              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                  style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                  <tr>
                                      <td style="height:40px;">&nbsp;</td>
                                  </tr>
                                  <tr>
                                      <td style="padding:0 35px;">
                                          <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Recharge Request</h1>
                                          <span
                                              style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                          <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                              <h1 style="color:darkgray; font-weight:300; margin:0;font-size:22px;font-family:'Rubik',sans-serif;">Customer Detail</h1>
                                              <h1 style="color:darkgray; font-weight:300; margin:0;font-size:22px;font-family:'Rubik',sans-serif;">${email}</h1>
                                              <h1 style="color:darkgray; font-weight:300; margin:0;font-size:22px;font-family:'Rubik',sans-serif;">${contactNo}</h1>
                                              <h1 style="color:darkgray; font-weight:300; margin:4px;font-size:16px;font-family:'Rubik',sans-serif;">${message}</h1>
                                          </p>                                          
       
       <div style="display: inline-block;
 position: relative;
 width: 200px;
 height: 200px;
 overflow: hidden;
 border-radius: 50%;
 background:gary">
 <img style=" width: auto;
 height: 100%;
 margin-left: -50px;" src=${product.imgPath} alt="product image here" srcset="">

 </div>
     <h1>
         ${product.name}
    </h1>
    <button>${new Date(product.modifiedAt).toLocaleDateString() } - ${new Date(product.modifiedAt).toLocaleTimeString()}</button>
    </div>
                                          
                                      </td>
                                  </tr>
                                  <tr>
                                  <a 
                                              style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; marginLeft:40% font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Mk world
                                              </a>
                                      <td style="height:40px;">&nbsp;</td>
                                  </tr>
                              </table>
                          </td>
                      <tr>
                          <td style="height:20px;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td style="text-align:center;">
                              <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong></strong></p>
                          </td>
                      </tr>
                      <tr>
                          <td style="height:80px;">&nbsp;</td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
      <!--/100% body table-->
  </body>
  
  </html>`;
  const mailjet = nodeMailjet.connect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  );
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "fullstacknodedeveloper@gmail.com",
          Name: "MKWORD Recharge request",
        },
        To: [
          {
            Email: '18251598-126@uog.edu.pk',
          },
        ],
        Subject: "Recharge Request",
        TextPart: "Mk world recharge",
        HTMLPart: html,
        CustomID: "AppGettingStartedTest",
      },
    ],
  });
  request
    .then((result) => {
      // console.log(result.body)
      res.status(200).json({
        status: "success",
        message: "email sent successfully!!!",
      });
    })
    .catch((err) => {
      // console.log(err.statusCode)
      res.status(200).json({
        status: "failed",
        message: "something went Wrong !!!",
      });
    });
});
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