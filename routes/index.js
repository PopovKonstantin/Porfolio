var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Start Page', my_name_user: req.session.myname, my_surname_user: req.session.mysurname });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});

router.get('/contact', function(req, res, next) {
  res.render('contact', { title: 'Contact' });
});

router.get('/portfolio', function(req, res, next) {
  res.render('portfolio', { title: 'Portfolio' });
});

router.get('/samplepage', function(req, res, next) {
  res.render('samplepage', { title: 'Samplepage' });
});

router.get('/users', function(req, res) {
  var db = req.db;
  var users = db.get('users');
  users.find({},{}, function(e, docs){
    res.render('users', { title: 'Users', 'users': docs });
  });
});

router.get('/newuser', function(req, res, next) {
  res.render('newuser', { title: 'New User' });
});

router.get('/authuser', function(req, res, next) {
  res.render('authuser', { title: 'Authorizize User' });
});

router.get('/chat', function(req, res, next) {
  res.render('chat', { title: 'Chat', my_name_user: req.session.myname, my_surname_user: req.session.mysurname });
});

/* POST to add new user to db */
router.post('/createuser', function(req, res) {
  var db = req.db;
  var userSurName = req.body.surname;
  var userName = req.body.uname;
  var userEmail = req.body.email;
  var userPhone = req.body.phone;
  var userPassword = req.body.password;
  var users = db.get('users');
  users.insert({
    'surname' : userSurName,
    'name' : userName,
    'email' : userEmail,
    'phone' : userPhone,
    'password' : userPassword
  }, function (error, doc) {
    if (error) {
      res.send("Could not create new user.");
    } else {
	  console.log(req.cookies);
	  req.session.myemail = userEmail;
	  req.session.myname = userName;
	  req.session.mysurname = userSurName;
      res.location('/');
      res.redirect('/');
    }
  });
});

/* POST to add new user to db */
router.post('/enter', function(req, res) {
  var db = req.db;
  var userEmail = req.body.email;
  var userPassword = req.body.password;
  var users = db.get('users');
  users.findOne({email:userEmail}, function(err,user, next){
    if (user){
       if (user.password == userPassword){
		 console.log(req.cookies);
		req.session.myemail = userEmail;
		req.session.myname = user.name;
		req.session.mysurname = user.surname;
         res.location('/');
         res.redirect('/');
       }
       else {
       res.send("Could not find user.");
       }
   }
    else
{res.send("ERROR");}
  });
});

module.exports = router;
