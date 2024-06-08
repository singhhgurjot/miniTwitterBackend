const Tweet = require('../models/tweetModel');
const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv");
// const User = require('../models/userModel');
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUD_CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

module.exports = class TweetController {

    static createTweet(req, res) {
        const { text, type, userId } = req.body;
        if (type === "image") {
            console.log(text);
            console.log(req.file);

            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: "Internal Server Error" });
                }

                Tweet.create({ content: text, contentUrl: result.secure_url, userId, tweetType: "image" })
                    .then(tweet => {
                        return res.status(201).json({ message: "Tweet created successfully", tweet });
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(500).json({ message: "Internal Server Error" });
                    });
            });

            uploadStream.end(req.file.buffer);
        } else if(type==="text"){ {
            Tweet.create({ content: text, userId, tweetType: "text" })
                .then(tweet => {
                    return res.status(201).json({ message: "Posted Successfully", tweet });
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }); 
        }
    }
}
}
