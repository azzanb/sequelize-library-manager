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

//GET all loans
router.get('/allLoans', function(req, res, next) {
	Loans.findAll({ 
		include: [{
			model: Books
		},{
			model: Patrons
			}
		] 
	}).then(function(loans){
		res.render('all_loans', {
			loans: loans
		});	
	});
	
});

//Route to page to create a new loan
router.get('/newLoan', function(req, res, next) {
	Books.findAll().then(books => {
		return books;
	}).then(books => {
		Patrons.findAll().then(patrons => {
			return patrons
		}).then(patrons => {
			res.render('new_loan', {
				books: books,
				patrons: patrons,
				loaned_on: today,
				return_by: sevenDaysLater
			});
		});
	});
});

//POST a new loan
router.post('/newLoan', function(req,res,next){
	Loans.create(req.body).then(function(){
		res.redirect('/allLoans');
	}).catch(err => {
		if(err.name === "SequelizeValidationError"){
			Books.findAll().then(books => {
				return books;
			}).then(books => {
				Patrons.findAll().then(patrons => {
					return patrons
				}).then(patrons => {
					console.log(err.errors[0]);
					res.render('new_loan', {
						errors: err.errors,
						books: books,
						patrons: patrons,
						loaned_on: today,
						return_by: sevenDaysLater
					});
				});
			});
		}	
	});
});

//Route to page that lists all overdue loans
router.get('/overdueLoans', function(req, res, next) {
	Loans.findAll({ 
		where: {
			return_by: {
				$lt: new Date()
			}
		},
		include: [{
			model: Books,
		},{
			model: Patrons,
			}
		] 
	}).then(function(loans){
		res.render('overdue_loans', {
			loans: loans
		});	
	});
});

//Route to page that lists all checked out loans
router.get('/checkedLoans', function(req, res, next) {
	Loans.findAll({ 
		where: {
			returned_on: null
		},
		include: [{
			model: Books,
		},{
			model: Patrons,
			}
		] 
	}).then(function(loans){
		res.render('checked_loans', {
			loans: loans
		});	
	});
});



module.exports = router;
