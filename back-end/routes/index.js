var express = require('express');
var router = express.Router();
var config = require('../custom_modules/config.js');
var mysql = require('mysql');
var randtoken = require('rand-token');
var stripe = require('stripe')('sk_test_6UslHQ8394oJ4HVmPEE8gtq2')
var connection = mysql.createConnection({
	host: config.host,
	user: config.username,
	password: config.password,
	database: config.database
});

connection.connect();

var bcrypt = require('bcrypt-nodejs');

var hashedPassword = bcrypt.hashSync("x");
// console.log(hashedPassword)
var checkHash = bcrypt.compareSync("x", hashedPassword)
// console.log(checkHash)


function getStuff(id){
	return new Promise(function(resolve,reject){
		var query = "SELECT * FROM auctions WHERE id="+id;
		connection.query(query,(error,results,fields)=>{
			if(error) return reject(error);
			// console.log(results);
			resolve(results)
		})
	})
}

var auctionsArray = []
for(let x = 1;x<6;x++){
	auctionsArray.push(getStuff(x))
}
// Promise.all(auctionsArray).then(contentsOfPromises=>{
// 	console.log(contentsOfPromises)
// })

auctionsArray[0].then((theResults)=>{
	// console.log(theResults)
	auctionsArray[1].then((theResults2)=>{
		// console.log(theResults2)
	})
})


/* GET top 3 auctions page. */
router.get('/getHomeAuctions', (req, res, next)=> {
  var auctionsQuery = "SELECT * FROM auctions " +
  "INNER JOIN images ON images.auction_id = auctions.id "
  + " limit 30"
  connection.query(auctionsQuery, (error, results, fields) => {
  	// console.log(auctionsQuery)
  	if (error) throw error;
  	res.json(results);
  });
  // res.render('index', { title: 'Express' });
});

router.get('/getAuctionDetail/:auctionId',(req,res,next)=>{
	
	var theAuctionId = req.params.auctionId;
	var getAuctionQuery = "SELECT * FROM auctions WHERE id = ?";
	connection.query(getAuctionQuery,[theAuctionId],(error,results,fields)=>{
		// console.log(getAuctionQuery)
		res.json(results)
	})
})

router.post('/searchResults', (req,res,next)=>{
	var searchQuery = "SELECT * FROM auctions INNER JOIN images ON images.auction_id = auctions.id " +
	"WHERE title LIKE ?"
	// console.log(req.body.searchString)
	var searchString = "%"+req.body.searchString+"%"
	// console.log(searchString)
	connection.query(searchQuery,[searchString],(error,results,fields)=>{
		// console.log(results)
		if(error)throw error
		res.json(results)
	})
})

router.post('/register', (req, res, next)=>{
	// console.log(req.body)
	checkDupeUserQuery = "SELECT * FROM users WHERE username = ?;";
	connection.query(checkDupeUserQuery,[req.body.username],(error,results,fields)=>{
		// console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
		// console.log(results);
		if(results.length === 0){
			
			//go ahead and register user
			var insertUserQuery = "INSERT INTO users (name, username, password, email) VALUES "+"(?, ?, ?, ?);";
				
				// console.log(insertUserQuery)
			connection.query(insertUserQuery,[req.body.name,req.body.username,bcrypt.hashSync(req.body.password),req.body.email],(error2,results2,fields2)=>{
				// console.log(results2);
				res.json({
					msg:"userInserted"
				});
			});
		}else{
			res.json({
				msg: "userNameTaken"
			})
		}
	})
})

router.post('/login', (req, res, next)=>{
	var username = req.body.username;
	var password = req.body.password;
	var findUserQuery = "SELECT * FROM users WHERE username = ?";
	connection.query(findUserQuery,[req.body.username],(error,results,fields)=>{
		if(error)throw error;
		if(results.length === 0){
			res.json({
				msg: "badUsername"
			})
		}else{
			// this is a valid username 
			console.log("password", password)
			console.log("results", results)
			console.log("results[0].password", results[0].password)
			checkHash = bcrypt.compareSync(password, results[0].password);
			console.log("checkHash ",checkHash)
			if(checkHash === false){
				res.json({
					msg: "badPassword"
				})
			}else{
				var token = randtoken.uid(40);
				insertToken = "UPDATE users SET token=?, token_exp=DATE_ADD(NOW(), INTERVAL 1 HOUR) "+
                    "WHERE username=?";
                connection.query(insertToken,[token, username], (error, results)=>{
					// console.log(token);
					res.json({
						msg: "foundUser",
						token: token

					});
				});
			}
		}
	});
});


router.post('/submitBid', (req,res,next)=>{
	// res.json(req.body);
	var selectQuery = "SELECT current_bid, starting_bid FROM auctions WHERE id = ?";
	connection.query(selectQuery,[req.body.auctionItemId],(error,results,fields)=>{
		if((req.body.bidAmount < results[0].current_bid)||(req.body.bidAmount < results[0].starting_bid)){
			res.json({msg:"bidTooLow"})
		}else{

			var getUserId = "SELECT id FROM users WHERE token = ?";
			connection.query(getUserId,[req.body.userToken],(error2,results2,fields2)=>{
				if(results2.length > 0){
					var updateAuctionsQuery = "UPDATE auctions SET high_bidder_id=?, current_bid=?"+
					"WHERE id = ?"
					connection.query(updateAuctionsQuery,[results2[0].id,req.body.bidAmount,req.body.auctionItemId],(errors3,results3,fields3)=>{

						if(error)throw error;
						res.json({
							msg: "bidAccepted",
							newBid: req.body.bidAmount
						})
					})
						
				}else{
					results.json({msg:"badToken"})
				}
			})

			// res.json({msg:"bidHighEnough"})
			// var updateAuctionsQuery = "UPDATE auctions SET high_bidder_id =?, current_bid=?"+
			// "WHERE id = ?"
			// connection.query(updateAuctionsQuery,["",req.body.bidAmount,req.body.auctionItem],())
		}
	})
})

router.post('./stripe',(req,res,next)=>{
	// run a query against res.body.token to make sure this person is logged in
	// res.json(req.body)
	stripe.charges.create({
	  amount: req.body.amount,
	  currency: "usd",
	  source: req.body.stripeToken, // obtained with Stripe.js
	  description: "Charge for zoey.johnson@example.com"
	}, function(err, charge) {
		if(err){
			res.json({
				msg:"errorProcessing"
			})
		}else{
			res.json({
				msg:"paymentSuccess"
			})
		}
	  // asynchronously called
	});

})

module.exports = router;
