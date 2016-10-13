import React from 'react';
import './app.less';
import { Menu, Icon } from 'antd';
const MenuItem = Menu.Item;
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../actions/user';


function mapStateToProps(state) {
	const { user: { menu } } = state;
	return { menu };
}

function mapDispatchToProps(dispatch) {
	const {
		userMenu,
	} = bindActionCreators(UserActions, dispatch);
	return {
		userMenu,
	};
}

class LeftMenu extends React.Component {
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
	componentDidMount() {
		this.props.userMenu(20);
	}
	showMe() {
		console.log(this.props.menu);
	}
	render() {
		const menu = this.props.menu;
		let menu_list = '';
		const data = [
			{
				url: '/agent',
				name: '代理商管理',
			},
			{
				url: '/cash',
				name: '结算管理',
			}
		];
		if(menu && menu.fetch == true){
			menu_list = data.map((item, key) => {
				return (
					<MenuItem key = {key}>
						<Link to= {item.url} >
							<span>{item.name}</span>
						</Link>
					</MenuItem>
				);
			})
		}
		return (
			<div className="menu">
				<button onClick={this.showMe.bind(this)}>Show me</button>
				<Menu
					mode="inline"
					selectedKeys={[this.state.current]}
					style={{ width: 240 }}
					onClick={this.handleClick}
				>
					{menu_list}
				</Menu>
			</div>
		);
	}
}


LeftMenu.propTypes = {
	title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(LeftMenu);
