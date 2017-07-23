import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import logoutAction from '../actions/LogoutAction.js'


class NavBar extends Component {

	constructor(props) {
		super(props);
		this.handleLogout = this.handleLogout.bind(this);
	}

	handleLogout(){
		this.props.logout({token: undefined});
	}

	render() {
		console.log("loginData", this.props.loginData.msg)
		if(this.props.loginData.msg === 'foundUser'){
			return (
				<div className="nav-wrapper text-right">
					<div className="col-xs-12 text-right">
						Welcome back! <Link to='/account'>View account</Link> or <Link to='/' onClick={this.handleLogout}>Log out</Link>
					</div>
				</div>
			)
		}else{
			return (
				<div className="nav-wrapper text-right">
					<div className="col-xs-12 text-right">
						<Link to='/login'>Login</Link> or <Link to='/register'>Register</Link>
					</div>
				</div>
			)
		}
	}
}

function mapStateToProps(state){
	return{
		loginData: state.login
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({
		logout: logoutAction
	}, dispatch)
}

export default connect(mapStateToProps,mapDispatchToProps)(NavBar);