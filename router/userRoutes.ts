const express=require('express');
const router=express.Router();
const UserController=require('../controller/userController.ts');

router.post('/register',UserController.register);
router.post('/login',UserController.login);
router.post('/follow/:personId',UserController.follow);
router.post('/unfollow/:personId', UserController.unfollow);
module.exports=router;