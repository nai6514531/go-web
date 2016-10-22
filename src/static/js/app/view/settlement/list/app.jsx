import React from 'react';
import {Button, Table, Icon, Popconfirm, Select, DatePicker, Breadcrumb, message} from 'antd';
const Option = Select.Option;
import './app.less';
import DailyBillService from '../../../service/daily_bill';
import moment from 'moment';
const App = React.createClass({
	getInitialState() {
		return {
			columns: [{
				title: '账单ID',
				dataIndex: 'id',
				key: 'id',
				sorter: (a, b) => +a.id - +b.id
			}, {
				title: '代理商',
				dataIndex: 'userName',
				key: 'userName'
			}, {
				title: '金额',
				dataIndex: 'totalAmount',
				key: 'totalAmount',
				render: (total_amount) => {
					return total_amount / 100;
				}
			}, {
				title: '订单量',
				dataIndex: 'orderCount',
				key: 'orderCount'
			}, {
				title: '收款方式',
				dataIndex: 'accountName',
				key: 'accountName'
			}, {
				title: '账期',
				dataIndex: 'billAt',
				key: 'billAt',
				render: (bill_at) => {
					return moment(bill_at).format('YYYY-MM-DD')
				}
			}, {
				title: '结账时期',
				dataIndex: 'settledAt',
				key: 'settledAt',
				render: (settled_at) => {
					return settled_at == '' ? '' : settled_at;
				}
			}, {
				title: '状态',
				dataIndex: 'status',
				key: 'status',
				render: (status) => {
					if (status == 0) {
						return <div className="status highlight">未结账</div>
					} else {
						return <div className="status">已结账</div>
					}
				}
			}, {
				title: '操作',
				dataIndex: 'id',
				key: 'method',
				render: (id, record) => {
					return <span>
                            <Popconfirm title="申请提现吗?" onConfirm={this.deposit.bind(this, id)}>
                              <a>申请提现</a>
                            </Popconfirm>
							<span> | </span>
							<Popconfirm title="确认结账吗?" onConfirm={this.settle.bind(this, id)}>
                              <a>结账</a>
                            </Popconfirm>
							<span> | </span>
							<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
                          </span>
				}
			}],
			list: [],
			total: 0,
			loading: false,
			cashAccountType: 0,
			status: 0,
			hasApplied: 0,
			billAt: '',
			selectedList: [],   //勾选的账单
		};
	},
	list(data) {
		var self = this;
		this.setState({
			loading: true,
		});
		DailyBillService.list(data)
			.then((data) => {
				self.setState({
					loading: false,
				});
				if (data && data.status == 0) {
					this.setState({
						total: data.data.total,
						list: data.data.list.map((item) => {
							item.key = item.id;
							return item;
						})
					});
				} else {
					alert(data.msg);
				}
			})
			.catch((e)=> {
				self.setState({
					loading: false,
				});
			})
	},
	deposit(id) {
		alert("提现"+id)
	},
	settle(id) {
		alert("settle"+id)
	},
	multiSettle() {

		if(this.state.selectedList.length == 0){
			message.info('请勾选您需要结账的账单');
		}

		let selectedListId = "";
		let selectedListIdArr = [];
		this.state.selectedList.map((item, i)=>{
			selectedListIdArr.push(item.id);
		})
		selectedListId = selectedListIdArr.join(',');
		console.log(selectedListId)
	},
	handleFilter(){
		const {cashAccountType, status, hasApplied, billAt}=this.state;
		this.list({
			cashAccountType: cashAccountType,
			status: status,
			hasApplied: hasApplied,
			billAt: billAt
		});
	},
	componentWillMount() {
		const {cashAccountType, status, hasApplied, billAt}=this.state;
		this.list({
			cashAccountType: cashAccountType,
			status: status,
			hasApplied: hasApplied,
			billAt: billAt
		});
	},
	handleCashAccountTypeChange(value){
		this.setState({
			cashAccountType: value
		})
	},
	handleStatusChange(value){
		this.setState({
			status: value
		})
	},
	handleHasAppliedChange(value){
		this.setState({
			hasApplied: value
		})
	},
	handleBillAtChange(date, dateString){
		this.setState({
			billAt: dateString
		})
	},
	initializePagination(){
		var self = this;
		const {cashAccountType, status, hasApplied, billAt,total}=this.state;
		return {
			total: total,
			showSizeChanger: true,
			onShowSizeChange(page, perPage) {
				self.list({
					cashAccountType: cashAccountType,
					status: status,
					hasApplied: hasApplied,
					billAt: billAt,
					page: page,
					perPage: perPage
				});
			},
			onChange(page) {
				self.list({
					cashAccountType: cashAccountType,
					status: status,
					hasApplied: hasApplied,
					billAt: billAt,
					page: this.current,
					perPage: this.pageSize
				});
			},
		};
	},
	render(){
		const self = this;
		const {list, columns} = this.state;
		const pagination = this.initializePagination();

		const rowSelection = {
		  onChange(selectedRowKeys, selectedRows) {
		  	self.setState({selectedList: selectedRows})
		    //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
		  },
		  onSelect(record, selected, selectedRows) {
		    //console.log(record, selected, selectedRows);
		  },
		  onSelectAll(selected, selectedRows, changeRows) {
		    //console.log(selected, selectedRows, changeRows);
		  },
		};

		return (<section className="view-settlement-list">
			<header>
				<Breadcrumb>
					<Breadcrumb.Item>账单列表</Breadcrumb.Item>
				</Breadcrumb>
			</header>
			<div className="filter">
				<Select className="item"
						defaultValue="0"
						style={{width: 120}}
						onChange={this.handleCashAccountTypeChange}>
					<Option value="0">请选择提现方式</Option>
					<Option value="1">支付宝</Option>
					<Option value="2">微信</Option>
					<Option value="3">银行</Option>
				</Select>
				<Select
					className="item"
					defaultValue="0"
					style={{width: 120}}
					onChange={this.handleStatusChange}>
					<Option value="0">请选择结算状态</Option>
					<Option value="1">已结算</Option>
					<Option value="2">未结算</Option>
				</Select>
				<Select className="item"
						defaultValue="0"
						style={{width: 140}}
						onChange={this.handleHasAppliedChange}>
					<Option value="0">请选择提现状态</Option>
					<Option value="1">已申请提现</Option>
					<Option value="2">未申请提现</Option>
				</Select>
				<DatePicker onChange={this.handleBillAtChange} className="item"/>
				<Button className="item" type="primary" icon="search" onClick={this.handleFilter}>过滤</Button>
			</div>
			<Table rowSelection={rowSelection} dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading} footer={() => {
				return (<Button className="multiSettleBtn" onClick={this.multiSettle} type="primary" size="large">结账</Button>)
			}}/>
		</section>);
	}
});

export default App;
