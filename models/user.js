const { Schema, model } = require('mongoose');


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"

    },


tokens:[{
    token:{
        type:String,
        required:true
    }
}]
},
    { timestamps: true }
);




const User = model("user", userSchema);

module.exports = User;