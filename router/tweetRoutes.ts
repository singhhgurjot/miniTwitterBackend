const express = require('express');
const router = express.Router();
const multer = require('multer');
const TweetController = require('../controller/tweetController.ts');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/create', upload.single('image'),TweetController.createTweet);
module.exports = router;