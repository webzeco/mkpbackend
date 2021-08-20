const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find({ active: true });
  res.status(200).json({ users });
});
exports.getStaff = catchAsync(async (req, res) => {
  const users = await User.find({ active: true ,role:"customer"});
  res.status(200).json({ users });
});

exports.addUser = catchAsync(async (req, res) => {
  const newUser = await User.create(
    {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    contactNo: req.body.contactNo,
    admin:req.user.id
    }
  );
// add to embed way to add users id
  res.status(201).json({
    status: 'success',
    newUser
  });
});

exports.deleteUser = catchAsync(async (req, res,next) => {
  const doc = await User.findOneAndUpdate(
    { name: req.params.name },
    { active: false },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!doc) {
    return next(new AppError("NO document found with that name", 404));
  }
  res.status(204).json({
    message: "success",
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  let me = await User.findById(req.user.id);
  // .populate({
  //   path: "admin",
  //   select: "-users  -_id -passwordChangedAt -__v",
  // });
  if (!me) {
    res.status(200).json({
      data: null,
    });
    // return next(
    //   new AppError(
    //     "This route is not for changing password use updateMyPassword",
    //     400
    //   )
    // );
  }
  res.status(200).json({
    data: me,
  });
});

const filter = (obj, ...fields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (!fields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  // create error if user posts password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for changing password use updateMyPassword",
        400
      )
    );
  }
  // filter out  the unwanted fields name that are not allowed to updated
  const filterObj = filter(req.body, "name", "email");
  if (req.file) {
    filterObj.photo = req.file.filename;
  }
  // update the user data
  let updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) {
    updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, {
      new: true,
      runValidators: true,
    });
  }
  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});
