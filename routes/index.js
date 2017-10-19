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




//-- GET all books --//
router.get('/allBooks', function(req, res, next) {
	Books.findAll().then(books => {
		res.render('all_books', {books: books});
	})
});

//-- GET overdue or checked books --//
router.get('/books', function(req, res, next) {
	if(req.query.filter === "overdue"){
		Loans.findAll({
			where: {
			return_by: {
				$lt: new Date()
			}
		},
			include: [{
				model: Books,
				required: true
			}]
		}).then(function(loans){
			res.render('overdue_books', {
				loans: loans
			});
		});
	}
 	else if(req.query.filter === "checked_out"){
 		Loans.findAll({
			where: {
				returned_on: null
			},
			include: [{
				model: Books
			}]
		}).then(function(loans){
			res.render('checked_books', {
				loans: loans
			});
		});
 	}
});

//-- GET new books --//
router.get('/newBook', function(req, res, next) {
	res.render('new_book', {book: Books.build()});
});

//-- POST new books --//
router.post('/newBook', function(req, res) {
	Books.create(req.body).then(function(){
		res.redirect('/allBooks');
	}).catch(function(err){
		console.log(err.message)
		if(err.name === "SequelizeValidationError"){
			res.render('bookError');
		} else throw error;
	});
});

//-- GET book by id --//
router.get('/book_detail/:id', function(req, res, next){
	Books.findById(req.params.id).then(function(book){
		return book;
	}).then(function(book){
		//connect the chosen book's id with the loan's id
		Loans.findOne({
			include: [{
				model: Patrons
			}],
			where:{book_id: book.id}
		}).then(function(loans){
			res.render('book_detail', {
				title: book.title,
				author: book.author,
				genre: book.genre,
				first_published: book.first_published,
				id: book.id,
				loans:loans
			});
		});
	});
});

router.put('/book_detail/:id', function(req, res, next){
	Books.findById(req.params.id).then(function(book){
		return book;		
	}).then(function(book){
		book.update(req.body);
	}).then(function(){
		res.redirect('/allBooks');
	});
});

router.get('/return_book/:id', function(req,res,next) {
	Books.findById(req.params.id).then(function(book){
		return book;
	}).then(function(book){
		//connect the chosen book's id with the loan's id
		Loans.findOne({
			where: {
				book_id: book.id
			},
			include: [{
				model: Books
			},{
				model: Patrons
			}]
		}).then(function(loans){
			return loans
		}).then(function(loans){
			res.render('return_book', {
				loans: loans,
				returned_on: today
			})
		})
	})
});

router.put('/return_book/:id', function(req, res, next){
	Books.findById(req.params.id).then(function(book){
		return book;
	}).then(function(book){
		//connect the chosen book's id with the loan's id
		Loans.findOne({
			where: {
				book_id: book.id
			},
			include: [{
				model: Books
			},{
				model: Patrons
			}]
		}).then(function(loans){
			return loans
		}).then(function(loans){
			loans.update(req.body);
		}).then(function(){
			res.redirect('/allLoans')
		})
	})
});

module.exports = router;



/* TODO */
//Cannot update (PUT) book!!
//Check project requirement Validations!!
//If the book has no patron, return error page




//Notes
// 1 - Import table models in /models/index.js so tables can association with each other
// 2 - Make sure you have name attributes in pug template, otherwise SQL
	//CONSTRAINT ERROR will keep happening!!


