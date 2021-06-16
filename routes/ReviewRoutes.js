const express = require('express');
const router = express.Router();

const User = require('../models/User')
const ReviewList = require('../models/ReviewList')
const WrapAsync = require('../middleware/WrapAsync')
const ExpressError = require('../middleware/ExpressError')
const isLog = require('../middleware/isLog')


router.post('/rev/:tt/:id', isLog, WrapAsync(async (req, res, next) => {
    const { tt, id } = req.params;
    const { rate, review } = req.body;
    console.log("rating = ", rate)
    console.log("review = ", review)
    const LogedUSR = req.user;
    const FoundUSR = await User.findById(LogedUSR._id)
    const uname = FoundUSR.username;
    const NewReview = new ReviewList({
        MovieID: id,
        Rate: rate,
        Review: review,
        Usr: uname
    })
    FoundUSR.Reviews.push(NewReview);
    await FoundUSR.save();
    await NewReview.save();
    res.redirect(`/search/${tt}/${id}`)
}))

router.delete('/rev/:rid/:id/:tt/:usr', isLog ,WrapAsync( async (req, res) => {
    const { rid, id, tt, usr } = req.params;
    console.log(rid)
    console.log(id)
    console.log(tt)
    console.log(usr)
    if(req.user.username!=usr){ throw new ExpressError(`"Not Authorized to Delete  ~${usr}'s  Review "` , 401)}
    else{
        const Dreview = await ReviewList.findByIdAndDelete(rid);
    const RevUsr = await User.findOneAndUpdate({username:usr}, {$pull: {Review : rid}} , {new:true})
    // console.log(RevUsr)
    req.flash('success', 'Deleted review succefully')
    res.redirect(`/search/${tt}/${id}`)
    }
    
}))

module.exports = router