const router = require('express').Router()
const path = require('path')

router.get('/', function (req, res) {
  res.render('home.ejs')
  // const indexPath = path.join(__dirname, '../views/home.ejs')
})

module.exports = router