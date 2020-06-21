var mongoose = require("mongoose");
const alumni = require("./alumni");

var postSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Alumni"
        },
        username: String,
        name: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments"
    }]
});

module.exports = mongoose.model("Posts", postSchema);