import React from 'react';
import './app.less';
import { Breadcrumb, Button } from 'antd';

export default class Agent extends React.Component {
	render() {
		return (
			<div className="detail">
				<div className="detail-head">
					<Breadcrumb separator=">">
						<Breadcrumb.Item>代理商管理</Breadcrumb.Item>
						<Breadcrumb.Item href="#">设备管理</Breadcrumb.Item>
					</Breadcrumb>
				</div>
				<div className="detail-form">
					{this.props.children}
				</div>
			</div>
		);
	}
}


Agent.propTypes = {
	title: React.PropTypes.string,
};
