const bcrypt = require('bcryptjs');
const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
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
                return res.status(201).json({ message: 'User created successfully' });
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

}
