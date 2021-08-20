const mongoose = require("mongoose");
const staticsModel = new mongoose.Schema({
  title: {
    type: String
  },
  image:String
});
const Statics = mongoose.model("Statics", staticsModel);
module.exports = Statics;
