import React from 'react';
import './app.less';
import { Menu, Icon } from 'antd';
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

export class LeftMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			current: '1',
			openKeys: [],
		};
		this.getKeyPath = this.getKeyPath.bind(this);
		this.onOpenChange = this.onOpenChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick(e) {
		console.log('click ', e);
		this.setState({ current: e.key });
	}
	onOpenChange(openKeys) {
		const latestOpenKey = openKeys.find(key => !(this.state.openKeys.indexOf(key) > -1));
		this.setState({ openKeys: this.getKeyPath(latestOpenKey) });
	}
	getKeyPath(key) {
		const map = {
			sub1: ['sub1'],
			sub2: ['sub2'],
			sub3: ['sub2', 'sub3'],
			sub4: ['sub4'],
		};
		return map[key] || [];
	}
	render() {
		return (
			<div className="menu">
				<Menu
					mode="inline"
					openKeys={this.state.openKeys}
					selectedKeys={[this.state.current]}
					style={{ width: 240 }}
					onOpenChange={this.onOpenChange}
					onClick={this.handleClick}
				>
					<SubMenu key="sub1" title={<span><Icon type="user" /><span>代理商管理</span></span>}>
						<MenuItem key="1">设备管理</MenuItem>
						<MenuItem key="2">添加新代理商</MenuItem>
					</SubMenu>
					<SubMenu key="sub2" title={<span><Icon type="pay-circle" /><span>结算管理</span></span>}>
						<MenuItem key="3">结算状态</MenuItem>
					</SubMenu>
				</Menu>
			</div>
		);
	}
}


LeftMenu.propTypes = {
	title: React.PropTypes.string,
};
