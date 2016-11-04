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
		console.log(this.props.payList)
		return (
			<form name="alipayment" action="http://192.168.1.93:8080/alipayapi.jsp" method="post" target="_blank">
      	<div id="body">
          <dl>
						<dt>付款账号：</dt>
						<dd>
							<input onChange={this.inputChange} value="123" name="WIDemail" />
							<span>必填</span>
						</dd>
						<dt>付款账户名：</dt>
						<dd>
							<input onChange={this.inputChange} name="WIDaccount_name" />
							<span>必填，个人支付宝账号是真实姓名公司支付宝账号是公司名称</span>
						</dd>
						<dt>付款当天日期：</dt>
						<dd>
							<input onChange={this.inputChange} name="WIDpay_date" />
							<span>必填，格式：年[4位]月[2位]日[2位]，如：20100801</span>
						</dd>
						<dt>批次号：</dt>
						<dd>
							<input onChange={this.inputChange} name="WIDbatch_no" />
							<span>必填，格式：当天日期[8位]+序列号[3至16位]，如：201008010000001</span>
						</dd>
						<dt>付款总金额：</dt>
						<dd>
							<input onChange={this.inputChange} name="WIDbatch_fee" />
							<span>必填，即参数detail_data的值中所有金额的总和</span>
						</dd>
						<dt>付款笔数：</dt>
						<dd>
							<input onChange={this.inputChange} name="WIDbatch_num" />
							<span>必填，即参数detail_data的值中，“|”字符出现的数量加1，最大支持1000笔（即“|”字符出现的数量999个）</span>
						</dd>
						<dt>付款详细数据：</dt>
						<dd>
							<input onChange={this.inputChange} name="WIDdetail_data" />
							<span>必填，格式：流水号1^收款方帐号1^真实姓名^付款金额1^备注说明1|流水号2^收款方帐号2^真实姓名^付款金额2^备注说明2....</span>
						</dd>
            <dt></dt>
            <dd>
            </dd>
          </dl>
        </div>
        <button type="submit" id="submit">确认支付</button>
      </form>
		);
	}
});

export default FormList;
