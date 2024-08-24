const ExpressError = require("./ExpressError")
module.exports.isLog = (req ,res ,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error' , 'Must LOG IN first!');
        // req.session.returnTo = req.originalUrl;
        // console.log("when not logged "+ req.session.returnTo);
        return res.redirect('/login');
    }
    // console.log("when logged "+ req.session.returnTo);
    // req.session.returnTo = req.originalUrl;
    next();
};

// module.exports.storeReturnTo = (req, res, next)=>{
//     if(req.session.returnTo){
//         res.locals.returnTo = req.session.returnTo;
//         console.log("return to in locals : " + res.locals.returnTo);
//     }
//     next();
// };