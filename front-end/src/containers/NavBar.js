import React, { Component } from 'react';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';


class NavBar extends Component {

	render() {

		return (
				<div className="nav-wrapper">
					<div className="col-sm-8">
					</div>
					<div className="col-sm-4 text-right">
						<Link to='/login'>Login</Link> or <Link to='/register'>Register</Link>
					</div>
				</div>
		);
	}
}

function mapStateToProps(state){
	return{
		loginData: state.login
	}
}

// function mapDispatchToProps(dispatch){
// 	return bindActionCreators({
// 		getHomeData: GetHomeAction
// 	}, dispatch)
// }

export default connect(mapStateToProps,null)(NavBar);