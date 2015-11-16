var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

router.get('/users', function(req, res, next){
    res.json(User.query(req.query));
});

router.get('/users/:id', function(req, res, next){
    res.json(User.get(req.params.id));
});

router.put('/users/:id', function(req, res, next){
    res.json(User.update(req.params.id, req.body));
});

router.delete('/users/:id', function(req, res, next){
    User.delete(req.params.id);
    res.status(204).end();
});

router.post('/users', function(req, res, next){
    res.json(User.create(req.body));
});

module.exports = router;
