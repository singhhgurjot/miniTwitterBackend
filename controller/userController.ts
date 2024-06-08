const bcrypt = require('bcryptjs');
const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
dotenv.config();
module.exports = class UserController {
    static register(req, res) {
        const { name, email, password, username } = req.body;
        if (!name || !email || !password || !username) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        User.findOne({ username: username }).then(user => {
            if (user) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);
            User.create({ name, email, password: hashedPassword, username }).then(user => {
                return res.status(200).json({ message: 'User created successfully' });
            }).catch(err => {
                return res.status(500).json({ message: 'Internal Server Error' });
            })
        }).catch(err => {
            return res.status(500).json({ message: 'Internal Server Error' });
        })
    }

    static login(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }
        User.findOne({ username: username }).then(user => {
            if (!user) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.status(200).json({ message: 'User logged in successfully' ,token: token});
        }).catch(err => {
            return res.status(500).json({ message: 'Internal Server Error' });
        })
    }
    static follow(req, res) {
        const { personId } = req.params;
        const userId = req.body.userId;
        if (!personId) {
            return res.status(400).json({ message: 'Please provide personId' });
        }
     User.findByIdAndUpdate(userId, { $push: { following: personId } }).then(user => {
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            User.findByIdAndUpdate(personId, { $push: { followers: userId } }).then(user => {
                if (!user) {
                    return res.status(400).json({ message: 'Person not found' });
                }
                return res.status(200).json({ message: 'Followed successfully' });
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            })
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        })  
}
static unfollow(req, res) {
    const { personId } = req.params;
    const userId = req.body.userId;
    if (!personId) {
        return res.status(400).json({ message: 'Please provide personId' });  
}
User.findByIdAndUpdate(userId, { $pull: { following: personId } }).then(user => {
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        User.findByIdAndUpdate(personId, { $pull: { followers: userId } }).then(user => {
            if (!user) {
                return res.status(400).json({ message: 'Person not found' });
            }
            return res.status(200).json({ message: 'Unfollowed successfully' });
        }).catch(err => {
            console.log(err);
        
            return res.status(500).json({ message: 'Internal Server Error' });
        })
    }).catch(err => {
        
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    })  
}
static uploadProfilePicture(req, res) {
    const {userId}=req.body;
    console.log("Called" ,userId);
    const profilePicture=req.file;
    if(!userId){
        return res.status(400).json({message:'Please provide userId'});
    }
    if(!profilePicture){
        return res.status(400).json({message:'Please provide profilePicture'});
    }
    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        User.findByIdAndUpdate(userId, { profilePic: result.secure_url }).then(user => {
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            return res.status(200).json({ message: "Profile Picture Uploaded Successfully", result:result.secure_url });
        }).catch(err => {   });
    });
    uploadStream.end(req.file.buffer);
}
static getProfile(req, res) {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: 'Please provide userId' });
}
User.findById(userId,{password:0,_id:0}).then(user => {
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    }).catch(err => {
        return res.status(500).json({ message: 'Internal Server Error' });
    })  
}
static getFollowers(req, res) {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: 'Please provide userId' });  
}
User.findById(userId).populate('followers',"-password").then(user => {
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        return res.status(200).json({ followers: user.followers });
    }).catch(err => {
        return res.status(500).json({ message: 'Internal Server Error' });
    })  
}
static getFollowing(req, res) {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).json({ message: 'Please provide userId' });

}
User.findById(userId).populate('following',"-password").then(user => {
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        return res.status(200).json({ following: user.following });
    }).catch(err => {
        return res.status(500).json({ message: 'Internal Server Error' });
    })  
}
}
