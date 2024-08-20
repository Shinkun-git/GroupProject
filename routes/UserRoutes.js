const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/User')
const  isLog = require('../middleware/isLog')
const  WrapAsync = require('../middleware/WrapAsync')

router.get('/register', (req, res) => {
    res.render('register')
})
router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/register',WrapAsync(async (req, res, next) => {
    const { username, email, password } = req.body;
    const newUser = await new User({ username, email })
    const RegUser = await User.register(newUser, password)
    req.login(RegUser, (err) => { if (err) { next(err) } });
    res.redirect('/');
}))

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Logged IN successfully!!')
    res.redirect('/');
})

router.get('/logout',isLog, (req, res,next) => {
    req.logout(function(err){
        if(err) return next(err);
        req.flash('success', "Goodbye!");
        res.redirect('/');
    });
});

module.exports = router