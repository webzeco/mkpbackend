const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name  is required"],
    },
    size:Number,
    image: String,   
    modifiedAt:{
      type:Date,
      default:new Date()
    },
   downloads:{
     type:Number,
     default:0
   }
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// this compound index is used for one user only can create one review one Tour
// reviewSchema.index({
//   tour: 1,
//   user: 1,
// }, {
//   unique: true,
// });
// productSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "user",
//     select: "name",
//   });
//   next();
// });

/*
// blow all about calculating average and numbers of Tour ratings

// this function get all saved reviews and apply aggregation on them
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([{
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        nRating: {
          $sum: 1,
        },
        avgRating: {
          $avg: '$rating',
        },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// this post run after creating and saving document
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
// this pre middleware only used for getting current tour
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.Rew = await this.findOne();
  next();
});
// this post run after deleting and updating document
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.Rew.constructor.calcAverageRatings(this.Rew.tour._id);
});
*/

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
