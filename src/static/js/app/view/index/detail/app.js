import React from 'react';
import './app.less';
import { Breadcrumb, Button } from 'antd';
import { DetailTable } from '../table/app';

export class Detail extends React.Component {
	render() {
		return (
			<div className="detail">
				<div className="detail-head">
					<Breadcrumb separator=">">
						<Breadcrumb.Item>代理商管理</Breadcrumb.Item>
						<Breadcrumb.Item href="#">设备管理</Breadcrumb.Item>
					</Breadcrumb>
				</div>
				<div className="detail-button">
					<Button type="primary">Primary</Button>
				</div>
				<div className="detail-body">
					<DetailTable/>
				</div>

			</div>
		);
	}
}


Detail.propTypes = {
	title: React.PropTypes.string,
};
