import React from 'react';
import {Menu, Button, Icon} from 'antd';

import Menus from './menus.jsx'

const Navbar = React.createClass({
	getInitialState() {
		return {
			current: '',
			icons:[
				{'title':'代理商管理','icon':'user'},
				{'title':'结算管理','icon':'pay-circle-o'},
				{'title':'设备管理','icon':'calculator'}]
		};
	},
	logout() {
		let boo = confirm('确认退出登录吗?');
		if (!boo) {
			return false;
		}
		fetch('/api/signout', {
			method: 'get',
			credentials: 'same-origin'
		}).then(response=>response.json())
			.then(function (data) {
				if (data && data.status == 0) {
					window.location.reload();
				} else {
					alert(data.msg || '系统异常,请重试!')
				}
			});
	},
	onClick(item) {
		if (item.key.includes('logout')) {
			return this.logout();
		}
		if (/^#|\//.test(item.key)) {
			window.location.href = item.key;
		}
		this.setState({current: item.key})
	},
	changeSelect() {
		this.setState({current: ''})
	},
	render() {
		const {location} = this.props;
		const menus = USER.menu || [];
		const self = this;
		return (<aside>
			<h2 onClick={this.changeSelect}><a href="#/"><img src={require('./logo.png')}/></a></h2>
			<nav>
				<Menu mode="inline"
					  theme="dark"
					  selectedKeys={[this.state.current]}
					  onClick={this.onClick}>
					{menus.map(function (item) {
						return <Menu.Item key={item.url}>
							<Icon type={self.state.icons.filter(function (icon) {
								return icon.title == item.name
							})[0].icon}
							/>
							{item.name}
						</Menu.Item>
					})}
				</Menu>
				<footer>
					<p> - &#10084; - </p>
				</footer>
			</nav>
		</aside>)
	}
});

export default Navbar;
