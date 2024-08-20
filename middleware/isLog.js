

const ExpressError = require("./ExpressError")

const isLog = (req ,res ,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error' , 'Must LOG IN first!')
        return res.redirect('/login')
    }
    else{
        next();
    }
}
module.exports = isLog;