
const Tweet = require('../models/tweetModel');
const cloudinary = require('cloudinary').v2;
const dotenv= require("dotenv");
// const User = require('../models/userModel');
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUD_CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
module.exports=class TweetController{

    static async createTweet(req, res){
       const {text}=    req.body;
        console.log(text);
        console.log(req.file);
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
            if (error){
                console.log(error);
                return res.status(500).json({message:"Internal Server Error"});
            
            }
            else{
                return res.json({ message: "Done", result: result.secure_url }); 
            }
            
        }).end(req.file.buffer);
        
              
    }
}