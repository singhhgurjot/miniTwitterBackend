const express=require('express');
class UserController{
    static register(req,res){
        res.send('Register');
    }
    static login(req,res){
        res.send('Login');
    }
}
module.exports=UserController;