import React from 'react';
import './app.less';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';


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
		this.props.userDetail(327);
	}
	render() {
		let account = '';
		const detail = this.props.detail;
		if(detail && detail.fetch == true) {
			account = detail.result.data.account;
		}
		return (
			<div className="head">
				<div className = "left">
					<img src="#" alt="logo"/>
					<h1>XX 管理系统</h1>
				</div>
				<div className = "right">
					<span>{account}</span>
					<span>用户身份</span>
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
