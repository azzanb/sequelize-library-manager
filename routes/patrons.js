var express = require('express');
var router = express.Router();
var Books = require('../models').Books;
var Patrons = require('../models').Patrons;
var Loans = require('../models').Loans;
var moment = require('moment');

//Set up date formats for today and seven days in advance
var year = moment().get('year'),
	month = moment().get('month') + 1,
	day = moment().get('date'),
	sevenDays = day + 7,
	today = year + "-" + month + "-" + day,
	sevenDaysLater = year + "-" + month + "-" + sevenDays;

//Associate Loans table to Books table and Patrons table
Loans.belongsTo(Books, {foreignKey: 'book_id'});
Loans.belongsTo(Patrons, {foreignKey: 'patron_id'});

//-- GET Home --//
router.get('/', function(req, res, next) {
  res.render('home');
});


router.get('/allPatrons', function(req, res, next) {
	Patrons.findAll().then(function(patrons){
		res.render('all_patrons', {
			patrons: patrons
		});
	});
});

router.get('/patrons/new', function(req, res, next) {
  if(req.path === '/patrons/new'){
  	res.render('new_patron');
  }
});

router.post('/patrons/new', function(req,res,next){
	Patrons.create(req.body).then(function(){
		res.redirect('/allPatrons');
	}).catch(function(err){
		console.log(err);
		if(err.name === "SequelizeValidationError"){
			res.render('patronError');
		} else throw error;
		console.log(err)
	});
})

router.get('/patron_detail/:id', function(req, res, next){
	Patrons.findOne({
		where: {
			id: req.params.id
		}
	}).then(function(patron){
		Loans.findAll({
			where: {
				patron_id: patron.id, 
			},
			include: [{
				model: Books
			}]
		}).then(function(loans){
			res.render('patron_detail', {
				patron: patron,
				loans: loans
			});
		})
	})
});

router.put('/patron_detail/:id', function(req, res, next){
	Patrons.findOne({
		where: {
			id: req.params.id
		}
	}).then(function(patron){
		return patron;
	}).then(function(loans){
		loans.update(req.body);
	}).then(function(){
		res.redirect('/allPatrons');
	});
});

module.exports = router;

