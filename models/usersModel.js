const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {isEmail} = require('validator');


var userSchema = new Schema({
    
    name : {
        type : String,
        require : true
    },
    email : {
        type : String,
        required : [true, 'Please enter an email'],
        unique : true,
        validate : [isEmail, 'Please enter a valid email']
    },
    password : {
        type : String,
        minlength : [8, 'Minimum password length is 8 characters']
    },

    userPost : [{
        type : Schema.Types.ObjectId,
        ref : "userPost" 
    }]

},{

    timestamps : true
})

var user = mongoose.model('user', userSchema);

module.exports = user;