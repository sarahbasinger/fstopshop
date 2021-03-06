import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import GetAuctionDetail from '../actions/GetAuctionDetail';
import SubmitBidAction from '../actions/SubmitBidAction';
import $ from 'jquery';

class AuctionDetail extends Component {
	
constructor(props) {
	super(props);
	this.submitBid = this.submitBid.bind(this);
}

	componentDidMount() {
		var auctionId = this.props.params.auctionId;
		this.props.getThisAuction(auctionId)
		
	}

	submitBid(event){
		event.preventDefault();
		console.log(this.props.userToken)
		if(this.props.userToken === undefined){

		}else{
			var bidAmount = Number(event.target[0].value);
			var auctionItem = this.props.auctionItemDetail[0]
			if(auctionItem.current_bid === "No bids yet"){
				auctionItem.current_bid = Number(auctionItem.starting_bid - .01)
			}

			if(bidAmount < auctionItem.current_bid){
				console.log("bid too low")
			}else{
				console.log("submit to express")
				this.props.submitBidToExpress(bidAmount, auctionItem.id, this.props.userToken)
			}
		}
	}

	makePayment(){
		console.log("pay auction clicked")
		var handler = window.StripeCheckout.configure({
			key: 'pk_test_6TYEZOAU1inGPbOhpKgYbpLn',
			locale: 'auto',
			token: function(stripeToken){
				var theData = {
					amount: 10 * 100,
					stripeToken: stripeToken.id,
					token: this.props.userToken
				}
			
				$.ajax({
					method: 'POST',
					url: "http://localhost:3000/stripe",
					data: theData
				}).done((data)=>{
					console.log(data)
					if(data.msg==="paymentSuccess"){

					}
				})
			}
		})
		handler.open({
			name: "buy stuff from my auction site",
			description: "pay for auction",
			amount: 10 * 100
		})
	}

	render() {
		if(this.props.auctionItemDetail.length === 0){
			return(<h1>Loading auction...</h1>);
		}
		var auctionItem = this.props.auctionItemDetail[0]
		console.log(this.props.auctionItemDetail[0])
		if(auctionItem.current_bid === null){
			auctionItem.current_bid = "No bids yet"
		}
		return(
			
		<div className="col-xs-12">
			<h1>{auctionItem.title}</h1>
			<p>{auctionItem.description}</p>
			<p>Starting bid: ${auctionItem.starting_bid}</p>
			<p>Current high bid: ${auctionItem.current_bid}</p>
			<p>High bidder id: {auctionItem.high_bidder_id}</p>
			<form onSubmit={this.submitBid}>
				<input type="number" placeholder="enter your bid"/>
				<button type="submit" className="search-button">Bid</button>
			</form>
			<button className="btn btn-primary" onClick={this.makePayment}>Pay auction</button>
		</div>
		)
	}
}

function mapStateToProps(state){
	return{
		auctionItemDetail: state.auctionItem,
		userToken: state.login.token
	}
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({
		getThisAuction: GetAuctionDetail,
		submitBidToExpress: SubmitBidAction
	}, dispatch)
}

export default connect(mapStateToProps,mapDispatchToProps)(AuctionDetail);