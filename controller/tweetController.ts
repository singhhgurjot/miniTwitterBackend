const Tweet = require('../models/tweetModel');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUD_CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

module.exports = class TweetController {

    static createTweet(req, res) {
        const { text, type, userId } = req.body;
        console.log("Create Tweet");
        if (type === "image") { 
            console.log("With Image");
            console.log("Text", text);
            if(!text){
                return res.status(400).json({ message: "Please provide text" });
            }

            console.log(req.file);
            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: "Internal Server Error" });
                }

                Tweet.create({ content: text, contentUrl: result.secure_url, userId, tweetType: "image" })
                    .then(tweet => {
                        User.findByIdAndUpdate(userId, { $push: { tweets: tweet._id } }).then(user => {
                            if (!user) {
                                return res.status(400).json({ message: "User not found" });
                            }
                        })
                        return res.status(200).json({ message: "Posted Successfully", tweet });

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
                    User.findByIdAndUpdate(userId, { $push: { tweets: tweet._id } }).then(user => {
                        if (!user) {
                            return res.status(400).json({ message: "User not found" });
                        }
                    })
                    return res.status(200).json({ message: "Posted Successfully", tweet });
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({ message: "Internal Server Error" });
                }); 
        }
    }
}
static likeTweet(req, res) {
    const { tweetId } = req.params;
    const userId = req.body.userId;
    if (!tweetId) {
        return res.status(400).json({ message: "Please provide tweetId" });
    }
    Tweet.findByIdAndUpdate(tweetId, { $push: { likes: userId } }).then(tweet => {
        if (!tweet) {
            return res.status(400).json({ message: "Tweet not found" });
        }
        User.findByIdAndUpdate(userId, { $push: { likedTweets: tweetId } }).then(user => {
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            return res.status(200).json({ message: "Liked Successfully" });
        }).catch(err => {
            return res.status(500).json({ message: "Internal Server Error" });
        })
    }).catch(err => {
        return res.status(500).json({ message: "Internal Server Error" });
    })
}
    static unlikeTweet(req, res) {
        const { tweetId } = req.params;
        const userId = req.body.userId;
        if (!tweetId) {
            return res.status(400).json({ message: "Please provide tweetId" });
        }
        Tweet.findByIdAndUpdate(tweetId, { $pull: { likes: userId } }).then(tweet => {
            if (!tweet) {
                return res.status(400).json({ message: "Tweet not found" });
            }
            User.findByIdAndUpdate(userId, { $pull: { likedTweets: tweetId } }).then(user => {
                if (!user) {
                    return res.status(400).json({ message: "User not found" });
                }
                return res.status(200).json({ message: "Unliked Successfully" });
            }).catch(err => {
                return res.status(500).json({ message: "Internal Server Error" });
            })
        }).catch(err => {
            return res.status(500).json({ message: "Internal Server Error" });
        })
    }
    static commentTweet(req, res) {
        const { tweetId } = req.params;
        const { text, userId } = req.body;
        if (!tweetId || !text || !userId) {
            return res.status(400).json({ message: "Please provide all the fields" });
        }
        Comment.create({ content:text, userId ,tweetId}).then(comment => {
            Tweet.findByIdAndUpdate(tweetId, { $push: { comments: comment._id  } }).then(tweet => {
                if (!tweet) {
                    return res.status(400).json({ message: "Tweet not found" });
                }
                return res.status(200).json({ message: "Commented Successfully" });
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ message: "Internal Server Error" });
            })

        }).catch(err => {});
      
    }
    static updateTweet(req, res) {
        const { tweetId } = req.params;
        const { text ,userId } = req.body;
        if (!tweetId || !text) {
            return res.status(400).json({ message: "Please provide all the fields" });
        }
        Tweet.findById(tweetId).then(tweet => {
            if (!tweet) {
                return res.status(400).json({ message: "Tweet not found" });
            }
            if (tweet.userId != userId) {
                console.log(tweet.userId.toString(),"  ", userId)
                return res.status(401).json({ message: "You are not authorized to update this tweet" });
            }
            else{
                Tweet.findByIdAndUpdate(tweetId, { content: text }).then(tweet => {
                    if (!tweet) {
                        return res.status(400).json({ message: "Tweet not found" });
                    }
                    return res.status(200).json({ message: "Updated Successfully" });
                }).catch(err => {
                    return res.status(500).json({ message: "Internal Server Error" });
                })
            }
        }).catch(err => {
            return res.status(500).json({ message: "Internal Server Error" });
        
        })
       
    }
    static deleteTweet(req, res) {
        const { tweetId } = req.params;
        const userId = req.body.userId;
        if (!tweetId) {
            return res.status(400).json({ message: "Please provide tweetId" });
        }
        Tweet.findById(tweetId).then(tweet => {
            if (!tweet) {
                return res.status(400).json({ message: "Tweet not found" });
            }
            if (tweet.userId != userId) {
                return res.status(401).json({ message: "You are not authorized to delete this tweet" });
            }
            else {
                Tweet.findByIdAndDelete(tweetId).then(tweet => {
                    if (!tweet) {
                        return res.status(400).json({ message: "Tweet not found" });
                    }
                    User.findByIdAndUpdate(userId, { $pull: { tweets: tweetId } }).then(user => {
                        if (!user) {
                            return res.status(400).json({ message: "User not found" });
                        }
                        return res.status(200).json({ message: "Deleted Successfully" });
                    }).catch(err => {
                        return res.status(500).json({ message: "Internal Server Error" });
                    })
                }).catch(err => {
                    return res.status(500).json({ message: "Internal Server Error" });
                })
            }
        }).catch(err => {
            return res.status(500).json({ message: "Internal Server Error" });
        })      
    }
    static getFollowersTweets(req, res) {
        const userId = req.body.userId
        if (!userId) {
            return res.status(400).json({ message: "Please provide userId" });
        }
        User.findById(userId).then(user => {
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            User.find({ _id: { $in: user.following } }).then(following => {
                let followingIds = following.map(follow => follow._id);
                Tweet.find({ userId: { $in: followingIds } }).populate("userId", ("-password")).sort({ createdAt: -1 }).then(tweets => {
                    return res.status(200).json({ tweets });
                }).catch(err => {
                    return res.status(500).json({ message: "Internal Server Error" });
                })
            }).catch(err => {
                return res.status(500).json({ message: "Internal Server Error" });
            })
        }).catch(err => {
            return res.status(500).json({ message: "Internal Server Error" });
        })      
    }
}
