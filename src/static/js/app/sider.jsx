import React from 'react';
import {Menu, Button, Icon} from 'antd';

import Menus from './menus.jsx'

const Navbar = React.createClass({
	logout() {
		let boo = confirm('确认退出登录吗?');
		if (!boo) {
			return false;
		}
		fetch('/api/logout', {
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
	},
	render() {
		const {location} = this.props;
		return (<aside>
			<h2><a href="#/"><img src={require('./logo.png')}/></a></h2>
			<nav>
				<Menu mode="inline"
					  theme="dark"
					  defaultOpenKeys={['data']}
					  selectedKeys={['#' + location.pathname]}
					  onClick={this.onClick}>

					{Menus.map(function (menu) {
						return <Menu.SubMenu key={menu.key} title={<div><Icon type={menu.icon} /> {menu.text}</div>}>
							{menu.items.map(function (item) {
								return <Menu.Item key={item.key}>{item.text}</Menu.Item>
							})}
						</Menu.SubMenu>
					})}

				</Menu>
			</nav>
			<footer>
				<p> - &#10084; - </p>
			</footer>
		</aside>)
	}
});

export default Navbar;
