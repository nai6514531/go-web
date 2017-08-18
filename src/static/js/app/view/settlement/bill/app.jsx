import React from 'react';
import Promise from 'bluebird'
import _ from 'underscore';
import moment from 'moment';
import op from 'object-path';

import { hashHistory } from 'react-router';

import { Button, Input, Table, Icon, Breadcrumb, message, Modal, Row, Col, Form } from 'antd';
const confirm = Modal.confirm;
const FormItem = Form.Item;

import List from './list.jsx';
import AccountForm from './edit-account-form.jsx';
import DailyBillService from '../../../service/daily_bill';
import SettlementService from '../../../service/settlement';
import BillService from '../../../service/bill';
import UserService from '../../../service/user';
import './app.less';

const CONSTANT_PAY = {
	1: '支付宝',
	2: '微信',
	3: '银行卡',
}

const App = React.createClass({
	getInitialState() {
		return {
			totalAmount: 0,
			count: 0,
			cashAccount: {
				type: 0
			},
			ListLoading: false,
			bills: {
				list: [],
				loading: false
			},
			pagination: {
				page: 1,
				perPage: 10,
				total: 0
			},
			cashModalVisible: false
		};
	},
	settlementInfo() {
		Modal.info({
	    title: '结算时间',
	    content: (
	      <div>
	        <p>当日15:00前申请提现，可当日结算，否则顺延至第二天处理。</p>
	        <p>系统自动申请提现的订单于当日结算完毕</p>
	      </div>
	    ),
	    onOk() {},
	  });
	},
	castInfo() {
		Modal.info({
	    title: '手续费收取规则',
	    content: (
	      <div>
	        <p>微信：收取提现金额的1%作为手续费；</p>
	        <p>支付宝：200元以下每次提现收取2元手续费，200元及以上收取提现金额的1%作为手续费</p>
	      </div>
	    ),
	    onOk() {},
	  });
	},
	handleSettlement() {
		const self = this;
		let { totalAmount, count, cast } = this.state;
		let cashAccountType = this.state.cashAccount.type || 0;
		if (totalAmount <= 200) {
			return message.info("可结算金额必须超过2元才可提现")
		}
		if (cashAccountType === 3) {
			return message.info("你当前收款方式为银行卡，不支持提现，请修改收款方式再进行提现操作。")
		}
		if (!!~[1, 2, 3].indexOf(cashAccountType)) {
			return message.info("你当前未设定收款方式，请修改收款方式再进行提现操作。")
		}
		
		let confirmMessage = _.template([
			'共有<%- count %>天账单结算',
			'结算金额为<%- totalAmount %>元',
			'本次提现将收取<%- cast %>元手续费',
			'是否确认提现？'
			].join(','))({
				count: count,
				totalAmount: totalAmount/100,
				cast: cast/100
			})
		confirm({
	    title: '确认申请提现',
	    content: confirmMessage,
	    onOk() {
	    	self.setState({settlementLoading: true})
	      BillService.create().then((res) => {
	      	if (res.status !== 0) {
	      		throw new Error(res.msg)
	      	}
      		self.setState({totalAmount: 0, count: 0, cast:0, settlementLoading: false})
					message.info("申请提现成功！请等待结算");
					self.getSettlementAmount()
				}).catch((err) => {
					self.setState({ settlementLoading: false })
					message.error(err.message || '申请提现失败！请重试');
				})
	    },
	    onCancel() {
	      console.log('Cancel');
	    },
	  });
	},
	getSettlementAmount() {
		const self = this;
		SettlementService.getAmount().then((res) => {
			const data = res.data
			self.setState({totalAmount: data.totalAmount || 0, count: data.count || 0, cast: data.cast || 0})
			self.getBillsList()
		}).catch(() => {
		})
	},
	getUserDetail() {
		const self = this;
		UserService.detail(window.USER.id).then((res) => {
			if (res.status === 0) {
				const user = res.data
				self.setState({ cashAccount: user.cashAccount || {}, user: user })
			}
		}).catch(() => {
		})
	},
	getBillsList({ ...options }) {
		const self = this;
    const pagination = _.extendOwn(this.state.pagination, options.pagination || {})
    const search = _.extendOwn({ status: '', createdAt: '' }, options.search || {})
		this.setState({ bills: { ...this.state.bills, loading: true }, pagination: pagination });
		BillService.list({
      status: search.status,
      createdAt: search.createdAt,
      page: pagination.page,
      perPage: pagination.perPage
		}).then((res) => {
			const data = res.data;
			if (res.status !== 0) {
				throw new Error(res.msg)
			}
			self.setState({
				bills: {
					list: data.list,
					loading: false
				},
				pagination: { ...pagination, total: data.total}
			});
		}).catch((e) => {
			self.setState({ bills: { ...this.state.bills, loading: false } });
		})
	},
	dailyBillDetail(e) {
		hashHistory.replace(`/settlement/bill/detail`)
	},
	handleCashModal(val) {
		const self = this;
		if (val === 'success') {
    	self.getUserDetail()
    	self.getSettlementAmount()
		}
    this.getUserDetail()
		this.setState({ cashModalVisible: false });
	},
  componentDidMount() {
    this.getSettlementAmount();
    this.getUserDetail()
  },
	render() {
		const { cashAccount, user } = this.state

		return (<section className="view-settlement-bill">
			<header>
        <Breadcrumb>
          <Breadcrumb.Item>提现管理</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <section className="info">
      	<h2>结算操作</h2>
      	<Row>
      		<Col xs={24} lg={{span: 8}} className="panel-left">
      			<p>可结算金额（元）</p>
      			<div>
      				<span className="amount">{(this.state.totalAmount/100).toFixed(2)}</span> 
      				<Button type="primary" onClick={this.handleSettlement} loading={this.state.settlementLoading}>申请提现</Button>
      				{this.state.totalAmount !== 0 ? <Button type="dashed" onClick={this.dailyBillDetail}>明细</Button> : null}
      			</div>
      			<p>申请提现才可进行结算，超过200元系统将自动帮你申请，详情请查看下方结算记录<span className="color-blue tip" onClick={this.settlementInfo}>结算时间</span></p>
      		</Col>
      		<Col xs={24} lg={{span: 10}} className='cash-account-info'>
      			<Row className={cashAccount.type === 3 ? '' : 'hidden'}>
      				<Col xs={8} lg={{span: 4}}  span={4}>收款方式：</Col>
      				<Col xs={16} lg={{span: 10}} span={10}>银行卡 <span className='color-red'>（不支持提现！）</span></Col>
      			</Row>
    				<Row className={cashAccount.type === 3 ? 'hidden' : ''}>
      				<Col xs={8} lg={{span: 4}}>收款方式：</Col>
      				<Col  xs={16} lg={{span: 10}}>{CONSTANT_PAY[cashAccount.type] || '无'}<span className="color-blue tip" onClick={this.castInfo}>手续费收取规则</span></Col>
      			</Row>
      			<Row className={cashAccount.type === 2 ? 'hidden' : ''}>
      				<Col xs={8} lg={{span: 4}}>帐号：</Col>
      				<Col  xs={16} lg={{span: 10}}>{cashAccount.account || '无'}</Col>
      			</Row>
      			<Row>
      				<Col xs={8} lg={{span: 4}}>姓名：</Col>
      				<Col  xs={16} lg={{span: 10}}>{cashAccount.realName || '无'}</Col>
      			</Row>
      			<Row className={cashAccount.type === 2 ? '' : 'hidden'}>
      				<Col xs={8} lg={{span: 4}}>微信昵称：</Col>
      				<Col  xs={16} lg={{span: 10}}>{op.get(user, 'nickName') || ''}</Col>
      			</Row>
      			<Row>
      				<Col span={24}><Button type="primary" onClick={() => {this.setState({ cashModalVisible:true })}}>修改收款方式</Button></Col>
      			</Row>
      		</Col>
      	</Row>
      </section>
      <List getBillsList={this.getBillsList} bills={this.state.bills} pagination={this.state.pagination} />
      { 
      	this.state.cashModalVisible ? <Modal
      		wrapClassName='view-settlement-modal'
        	footer={null}
          style={{ top: 20 }}
          visible={this.state.cashModalVisible}
          onCancel={() => {this.setState({ cashModalVisible:false })}}
        >
        	<AccountForm cashAccount={cashAccount} handleCashModal={this.handleCashModal} user={this.state.user} />
        </Modal> : null
      }
      
		</section>);
	}
});

export default App;
