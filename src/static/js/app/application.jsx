import React from 'react';
import { Menu } from 'antd';
import Sider from './sider.jsx';
import './application.less';
import Head from './head';
import Header from './header.jsx';

const Application = React.createClass({
	render() {
		const { location, children } = this.props;
		return (<div className="application">
			{/*<Head/>*/}
			<Sider location={location} />
			<div className="application-main">
				<Header/>
				{children}
			</div>
		</div>);
	}
});

export default Application;
