import React from 'react';
import './app.less';
import { Menu, Icon } from 'antd';
const MenuItem = Menu.Item;
import { Link } from 'react-router';

export class LeftMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			current: '1',
			openKeys: [],
		};
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick(e) {
		console.log('click ', e);
		this.setState({ current: e.key });
	}
	render() {
		return (
			<div className="menu">
				<Menu
					mode="inline"
					selectedKeys={[this.state.current]}
					style={{ width: 240 }}
					onClick={this.handleClick}
				>
					<MenuItem key="1">
						<Link to= '/agent' >
							<span>代理商管理</span>
						</Link>
					</MenuItem>
					<MenuItem key="2">
						<Link to= '/cash' >
							<span>结算管理</span>
						</Link>
					</MenuItem>
				</Menu>
			</div>
		);
	}
}


LeftMenu.propTypes = {
	title: React.PropTypes.string,
};
