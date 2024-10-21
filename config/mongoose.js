
const mongoose = require('mongoose');
const debuglog = require('debug')('mongo:')

mongoose.connect("mongodb://127.0.0.1:27017/khatabook")

const db = mongoose.connection

db.on('open', () => debuglog('Connected to Database...'))

db.on('error', err => debuglog(err))

module.exports = db;