import React from 'react';
import './app.less';

export class Head extends React.Component {
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
					<a href="#">退出</a>
				</div>
			</div>
		);
	}
}


Head.propTypes = {
	title: React.PropTypes.string,
};
