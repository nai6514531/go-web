import React from 'react';
import {Menu, Button, Icon} from 'antd';

import Menus from './menus.jsx'

const Header = React.createClass({
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
	},
	render() {
		const {location} = this.props;
		const menus = USER.menu || [];
		return (<div className="header">
header
		</div>)
	}
});

export default Header;
