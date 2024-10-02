const router = require('express').Router();
const path = require('path');

router.get('/', function (req, res) {
  res.render('team.ejs');
});

module.exports = router;
