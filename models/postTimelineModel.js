const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var postSchema = new Schema({

    postContent : {
        type : String,
        require : true
    },
    userPostRef : {
        type : Schema.Types.ObjectId,
        ref : "user"
    },
    comments : [{
        type : Schema.Types.ObjectId,
        ref : "commentPost" 
    }]
},{
    timestamps : true
})

var commentSchema = new Schema({
    commentContent : {
        type : String
    },
    userComReference : {
        type : Schema.Types.ObjectId,
        ref : "user"
    },
},{
    timestamps : true
})

var userPost = mongoose.model('userPost', postSchema) ;
var commentPost = mongoose.model('commentPost', commentSchema);

module.exports = {
    userPost,
    commentPost
};