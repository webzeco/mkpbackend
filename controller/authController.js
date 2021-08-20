const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Crypto = require("crypto");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Email = require("../utils/email");
const nodeMailjet = require("node-mailjet");

const signToken = (user) => {
  const { name, role, email, _id: id } = user;
  return jwt.sign(
    {
      id,
      name,
      role,
      email,
    },
    // this jwt secret should  be greater then 32 alphabets
    process.env.JWT_SECRET,
    {
      // this can be 90d ,30h,50m ,20s
      expiresIn: process.env.JWT_EXPIRE_IN,
    }
  );
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user);
  const cookieOptions = {
    expires: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  // if (process.env.NODE_ENV == "production") {
  //   cookieOptions.secure = true;
  // }
  // cookieOptions.secure = true;
  // name of the cookie jwt
  // cookie data is token
  // cookie properties are cookieOptions
  // res.cookie('jwt', 'tobi', { domain: '.example.com', path: '/admin', secure: true });
  res.cookie("jwt", token, cookieOptions);
  // res.cookie('name',"abdulrehman",cookieOptions)
  // removing new created user password
  user.password = undefined;
  res.header("x-token", token);
  res.header("access-control-expose-headers", "x-token");
  // if (app.locals)  app.locals.user = user;
  // res.locals.user=user;
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.signUp = catchAsync(async (req, res) => {
  const { username, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name: username,
    email,
    password,
    passwordConfirm,
  });
  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { name, password } = req.body;
  console.log({ body: req.body });
  if (!name || !password)
    return next(new AppError("please enter complete detail", 403));
  const user = await User.findOne({ name }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect username or password", 403));
  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1 ) check the token have user
  if (req.headers["x-token"]) {
    token = req.headers["x-token"];
    // console.log({newToken:token});
  }
  //   else if (
  //     req.headers.authorization
  //     //  &&
  //     // req.headers.authorization.startsWith("Bearer")
  //   ) {
  //     // token = req.headers.authorization.split(" ")[1];
  //     token=req.headers.authorization.substr(4);
  //     console.log({mytoken:token});
  // }
  //  else if (req.headers.cookie) {
  //   // console.log({cookie:req.headers.cookie});
  //   // console.log({subcookie:req.headers.cookie.substr(4)});
  //   token =   req.headers.cookie.substr(4);
  // }
  else {
    return next(
      new AppError("You are not login please login anb get access", 401)
    );
  }
  // console.log(req.cookies.jwt);
  // console.log(req.headers.authorization);
  // 2) verification of token
  // console.log("Protector");
  // console.log(token);
  // console.log("Protector");
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // if verification if pass then decoded value  like below
  // decoded={
  //   id: '5f08ac1c6aa46f0df451d8db',
  //   iat: 1594403926,
  //   exp: 1598291926
  //  }
  // 3) check user still exist not delete
  // console.log("current user");
  // console.log(decoded);
  // console.log("current user");
  let currentUser = await User.findOne({ name: decoded.name });
  if (!currentUser)
    return next(
      new AppError("No user belong to this token please try again", 401)
    );
  // 4) check if user change the password after generating token
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently change password please login again", 401)
    );
  }
  // Access granted to the next rout
  // see blew function where req.user used
  req.user = currentUser;
  // res.locals.user = currentUser;
  next();
});
exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      next(new AppError("You do not  have permission to do this action", 403));
    }
    next();
  };
};
exports.logout = (req, res) => {
  res.cookie("jwt", "logging out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const user = await User.findById(req.user._id).select("+password");
  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  ) {
    return next(new AppError("Incorrect password ...!!!", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  req.user = user;
  createAndSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    active: true,
  });
  if (!user) {
    res.status(200).json({
      status: "failed",
      message: "There is no user with that email ..!!!",
    });
  }
  // 2)  create new random  token for reset password
  const resetToken = user.createResetPasswordToken();
  // Nobody know every thing
  // this is tour off user model validator
  await user.save({
    validator: false,
  });
  // 3) Send it to user's email
  // try {
  //   const resetURL = `${process.env.FRONT_URL}/resetPassword/${resetToken}`;
  //   await new Email(user, resetURL).sendPasswordReset();
  //   // send response to user
  //   res.status(200).json({
  //     status: "success",
  //     message: "Token sent to email!",
  //   });
  // } catch (err) {
  //   user.passwordResetToken = undefined;
  //   user.passwordResetExpires = undefined;
  //   await user.save({ validateBeforeSave: false });
  //   console.log(err);
  //   return next(
  //     new AppError("There was an error sending the email. Try again later!"),
  //     500
  //   );
  // }
  let resetURL;
  if (user.role==="customer") {
    resetURL = `${process.env.CUSTOMER_URL}/resetPassword/${resetToken}`; 
  }else{
    resetURL = `${process.env.STAFF_URL}/resetPassword/${resetToken}`;
  }
  const html = `
<!doctype html>
<html lang="en-US">
<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
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
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                        Your password reset token (valid for only 10 minutes). To reset your password, click the
                                            following link and follow the instructions.
                                        </p>
                                        <a href="${resetURL}"
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
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
          Name: "MiniGo",
        },
        To: [
          {
            Email: req.body.email,
          },
        ],
        Subject: "Reset Password",
        TextPart: "Reset Password",
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
// RESET PASSWORD MODULES
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  console.log(req.body);
  console.log(req.params.token);
  const hashedPass = Crypto.createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  // check the user is valid and not expired
  let user;
  user = await User.findOne({
    passwordResetToken: hashedPass,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has expired"));
  }
  // There is token is not expires and there is user set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({
    validator: true,
  });
  req.user = user;
  createAndSendToken(user, 200, res);
  // update changePasswordAt property for user
  // login the user with JWT
});

exports.sendEmail = catchAsync(async (req, res, next) => {});
