const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const app = express();
const server = require('http').createServer(app);
var io = require('socket.io')(server);
const Chat = require('../models/Chat.js');

server.listen(4000);

// socket io
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
  socket.on('save-message', (data) => {
    console.log(data);
    io.emit('new-message', { message: data });
  });
});

/* Get Chat Updated */
router.route('/:room')
.get((req, res, next) => {
  Chat.find({ room: req.params.room})
  .then((chats) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'applications/json');
    res.json(chats);
  }, (err) => {
    next(err);
  })
  .catch((err) => {
    next(err);
  })
});

/* GET SINGLE CHAT BY ID */
router.get('/:id', (req, res, next) => {
  Chat.findById(req.params.id, (err, post) => {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE CHAT */
router.post('/', (req, res, next) => {
  Chat.create(req.body, (err, post) => {
    if (err) return next(err);
    res.json(post);
  });
});

/* UPDATE CHAT */
router.put('/:id', (req, res, next) => {
  Chat.findByIdAndUpdate(req.params.id, req.body, (err, post) => {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE CHAT */
router.delete('/:id', (req, res, next) => {
  Chat.findByIdAndRemove(req.params.id, req.body, (err, post) => {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;