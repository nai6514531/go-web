import React from 'react';
import { Menu } from 'antd';
import Sider from './sider.jsx';
import './application.less';

const Application = React.createClass({
	render() {
		const { location, children } = this.props;
		return (<div className="application">
			<Sider location={location} />
			<div className="application-main">
				{children}
			</div>
		</div>);
	}
});

export default Application;
