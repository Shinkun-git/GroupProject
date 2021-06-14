const express = require('express');
const router = express.Router();

const User = require('../models/User')
const ReviewList = require('../models/ReviewList')

router.get('/rev/:id', async (req, res, next) => {
    console.log('reviews listed here')
})

router.post('/rev/:tt/:id', async (req, res, next) => {
    const { tt, id } = req.params;
    const {rating , review} = req.body;
    console.log("rating = ",rating)
    console.log("review = ",review)
    const LogedUSR = req.user;
    const FoundUSR = await User.findById(LogedUSR._id)
    const uname = FoundUSR.username;
    const NewReview = new ReviewList({
        MovieID: id,
        Rate: rating,
        Review: review,
        Usr: uname
    })
    FoundUSR.Reviews.push(NewReview);
    await FoundUSR.save();
    await NewReview.save();
    res.redirect(`/search/${tt}/${id}`)
})

module.exports = router