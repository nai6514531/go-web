import React from 'react';
import {Button} from 'antd';

const FormList = React.createClass({
	getInitialState() {
		return {

		};
	},
	componentWillMount() {
	},
	inputChange() {

	},
	render(){
		const payList = this.props.payList;
		console.log(payList)
		return (
			<form name="alipayment" action={payList.request_url+"?_input_charset="+payList._input_charset} method="post" target="_blank">
      	<div id="body">
					<input onChange={this.inputChange} value={payList.service} name="service" />
					<input onChange={this.inputChange} value={payList.partner} name="partner" />
					<input onChange={this.inputChange} value={payList._input_charset} name="_input_charset" />
					<input onChange={this.inputChange} value={payList.notify_url} name="notify_url" />
					<input onChange={this.inputChange} value={payList.account_name} name="account_name" />
					<input onChange={this.inputChange} value={payList.detail_data} name="detail_data" />
					<input onChange={this.inputChange} value={payList.batch_no} name="batch_no" />
					<input onChange={this.inputChange} value={payList.batch_num} name="batch_num" />
					<input onChange={this.inputChange} value={payList.batch_fee} name="batch_fee" />
					<input onChange={this.inputChange} value={payList.email} name="email" />
					<input onChange={this.inputChange} value={payList.pay_date} name="pay_date" />
					<input onChange={this.inputChange} value={payList.sign} name="sign" />
					<input onChange={this.inputChange} value={payList.sign_type} name="sign_type" />
        </div>
        <button type="submit" id="submit">确认支付</button>
      </form>
		);
	}
});

export default FormList;
