var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var alumniSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        username: String,
        name: String
    },
    branch: String,
    batch: String,
    college: String,
    image: String,
    address: String,
    city: String,
    state: String,
    phone: String,
    country: String,
    mobile: String,
    email: { type: String, unique: true },
    passwordResetToken: String,
    passwordResetExpires: Date,
    isVerified: { type: Boolean, default: false },
    friends: [],

});
alumniSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Alumni", alumniSchema);