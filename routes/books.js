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
router.get('/', function(req, res) {
  res.render('home');
});




//-- GET all books --//
router.get('/allBooks', function(req, res) {
	Books.findAll().then(books => {
		res.render('all_books', {books: books});
	})
});

//-- GET overdue or checked books --//
router.get('/books', function(req, res) {
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
router.get('/newBook', function(req, res) {
	res.render('new_book', {book: Books.build()});
});

//-- POST new books --//
router.post('/newBook', function(req, res) {
	Books.create(req.body).then(function(){
		res.redirect('/allBooks');
	}).catch((err) => {
		console.log(err.errors[0].path)
		if(err){
			res.render('new_book', {
				errors: err.errors,
				book: Books.build()		
			});
		}
	});
});

//-- GET book by id --//
router.get('/book_detail/:id', function(req, res){
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

router.put('/book_detail/:id', function(req, res){
	Books.update(req.body, {
		where: [{id: req.params.id}]
	}).then(() => {
		res.redirect('/allBooks');
	}).catch((err) => {
		if(err){
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
					errors: err.errors,
					title: book.title,
					author: book.author,
					genre: book.genre,
					first_published: book.first_published,
					id: book.id,
					loans:loans
				});
			});
		});
		} else throw err;
	});
});

router.get('/return_book/:id', function(req,res) {
	Books.findById(req.params.id).then(function(book){
		return book;
	}).then(function(book){
		//connect the chosen book's id with the loan's id
		Loans.findOne({
			where: {
				book_id: req.params.id
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

router.put('/return_book/:id', function(req, res){
	Books.findById(req.params.id).then(function(book){
		return book;
	}).then(function(book){
	Loans.update(req.body, {
		where: {
			book_id: req.params.id
		},
		include: [{
			model: Books
		},{
			model: Patrons
		}]
	}).then((loans) => {
		res.redirect('/allLoans');
	}).catch(err => {
		console.log(err)
		Loans.findOne({
			where: {
				book_id: req.params.id
			},
			include: [{
				model: Books
			},{
				model: Patrons
			}]
		}).then((loans) => {
			res.render('return_book', {
				error: "Returned On must be filled! (YYYY-MM-DD)",
				loans: loans,
				returned_on: today
			});
		});
	});
});
	
});

module.exports = router;




//Notes
// 1 - Import table models in /models/index.js so tables can association with each other
// 2 - Make sure you have name attributes in pug template, otherwise SQL
	//CONSTRAINT ERROR will keep happening!!


