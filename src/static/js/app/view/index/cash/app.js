import React from 'react';
// import './app.less';

export default class Cash extends React.Component {
	render() {
		return (
			<div className="detail">
				this is cash
			</div>
		);
	}
}


Cash.propTypes = {
	title: React.PropTypes.string,
};
