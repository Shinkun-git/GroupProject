const express = require('express')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RevSchema = new Schema({
    MovieID: String,
    Rate: Number,
    Review: String,
    Usr: String
})

module.exports = mongoose.model('Review', RevSchema);


