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
	showMe() {
		console.log('result',this.props.result);
		console.log('detail',this.props.detail);
	}
	componentDidMount(){
		this.props.userDetail(20);
	}
	render() {
		let account = '';
		let role = '';
		const detail = this.props.detail;
		if(detail && detail.fetch == true) {
			account = detail.result.data.user.account;
			role =  detail.result.data.role[0].name;
		}
		return (
			<div className="head">
				<div className = "left">
					<img src="#" alt="logo"/>
					<h1>苏打生活管理系统</h1>
				</div>
				<div className = "right">
					<span>{account}</span>
					<span>{role}</span>
					<button onClick={this.showMe.bind(this)}>show me</button>
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
