const ExpressError = require("./ExpressError")

module.exports.isLoggedin= (req ,res ,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error' , 'Must LOG IN first!')
        res.redirect('/login')
    }
    else{
        next();
    }
}