import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from './actions/user';


function mapStateToProps(state) {
	const { user: { detail, result } } = state;
	return { detail, result };
}

function mapDispatchToProps(dispatch) {
	const {
		userLogout,
		userDetail,
	} = bindActionCreators(UserActions, dispatch);
	return {
		userLogout,
		userDetail,
	};
}

class Head extends React.Component {
	logout(e) {
		e.preventDefault();
		this.props.userLogout();
		window.location.href = '/';
	}
	render() {
		const data = JSON.parse(document.getElementById('main').dataset.user);
		const account = data.user.account;
		const role = data.role[0].name;
		return (
			<div className="head">
				<div className = "left">
					<img src={require('./logo.png')} alt="logo"/>
					<h1>苏打生活管理系统</h1>
				</div>
				<div className = "right">
					<span>{account}</span>
					<span>{role}</span>
					<a href="#" onClick={this.logout.bind(this)}>退出</a>
				</div>
			</div>
		);
	}
}


Head.propTypes = {
	title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(Head);
