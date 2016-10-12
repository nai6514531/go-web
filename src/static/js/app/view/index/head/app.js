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
	onClick(e) {
		e.preventDefault();
		// this.props.userDetail(327);
		this.props.userLogout();
	}
	showMe() {
		console.log('result',this.props.result);
		console.log('detail',this.props.detail);
	}
	render() {
		return (
			<div className="head">
				<div className = "left">
					<img src="#" alt="logo"/>
					<h1>XX 管理系统</h1>
				</div>
				<div className = "right">
					<span>用户名</span>
					<span>用户身份</span>
					<button onClick={this.showMe.bind(this)}>show me</button>
					<a href="#" onClick={this.onClick.bind(this)}>退出</a>
				</div>
			</div>
		);
	}
}


Head.propTypes = {
	title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(Head);
