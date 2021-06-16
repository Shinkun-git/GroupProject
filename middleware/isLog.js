

const ExpressError = require("./expressError")

const isLog = (req ,res ,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error' , 'Must LOG IN first!')
        res.redirect('/login')
    }
    else{
        next();
    }
}
module.exports = isLog;