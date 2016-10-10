import React from 'react';
import './app.less';
import { LeftMenu } from '../menu/app';
import { Detail } from '../detail/app';

export class BodyPanel extends React.Component {
	render() {
		return (
			<div className="body-panel">
				<LeftMenu/>
				<Detail/>
			</div>
		);
	}
}


BodyPanel.propTypes = {
	title: React.PropTypes.string,
};
