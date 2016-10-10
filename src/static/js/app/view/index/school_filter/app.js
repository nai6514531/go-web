import React from 'react';
import './app.less';
import { Cascader, Button } from 'antd';

const options = [{
	value: 'zhejiang',
	label: 'Zhejiang',
	children: [{
		value: 'hangzhou',
		label: 'Hangzhou',
		children: [{
			value: 'xihu',
			label: 'West Lake',
		}],
	}],
}, {
	value: 'jiangsu',
	label: 'Jiangsu',
	children: [{
		value: 'nanjing',
		label: 'Nanjing',
		children: [{
			value: 'zhonghuamen',
			label: 'Zhong Hua Men',
		}],
	}],
}];

export class SchoolFilter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: '',
		};
		this.onChange = this.onChange.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
	}
	handleFilter() {
		console.log(this.state.value);
	}
	onChange(value) {
		this.setState({value: value})
	}
	render() {
		return (
			<div className="filter">
				<Cascader className="city" options={options} onChange={this.onChange} placeholder="选择城市" />
				<Button type="primary" onClick={this.handleFilter}>Primary</Button>
			</div>
		);
	}
}


SchoolFilter.propTypes = {
	title: React.PropTypes.string,
};
