import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from './actions/user';


function mapDispatchToProps(dispatch) {
	const {
		userLogout,
	} = bindActionCreators(UserActions, dispatch);
	return {
		userLogout,
	};
}

class Head extends React.Component {
	logout(e) {
		e.preventDefault();
		this.props.userLogout();
		window.location.href = '/';
	}
	render() {
		const account = USER.account;
		const role = USER.role.name;
		return (
			<div className="head">
				<div className = "left">
					<img src={require('./logo.png')} alt="logo"/>
					<h1>苏打生活管理系统</h1>
				</div>
				<div className = "right">
					<span className="account">{account}</span>
					<span className="role">{role}</span>
					<a href="#" onClick={this.logout.bind(this)}>退出</a>
				</div>
			</div>
		);
	}
}


Head.propTypes = {
	userLogout: React.PropTypes.func,
};

export default connect(mapDispatchToProps)(Head);
