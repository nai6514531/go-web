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
				title: 'ID',
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
					return settled_at == '' ? '/' : settled_at;
				}
			}, {
				title: '状态',
				dataIndex: 'status',
				key: 'status',
				render: (status) => {
					if (status == 2) {
						return <div className="status">已结账</div>
					} else {
						return <div className="status highlight">未结账</div>
					}
				}
			}, {
				title: '操作',
				dataIndex: 'id',
				key: 'method',
				render: (id, record) => {
					const roleId = this.state.roleId;
					const status = record.status;
					let data = {
						id: record.id,
						userId: record.userId,
						billAt: moment(record.billAt).format('YYYY-MM-DD'),
						willApplyStatus: status == 0 ? 1: 0 //即将提现改变的状态
					}

					let spanDiv = "";
					switch (roleId){
						case 1:
							spanDiv = (
								<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
							)
							break;
						case 2: 
							spanDiv = (
								<span>
									{
										status == 0?(		
											<Popconfirm title="申请提现吗?" onConfirm={this.deposit.bind(this, data)}>
					              <a>未申请提现</a>
					            </Popconfirm>
										):(

											<Popconfirm title="取消申请提现吗?" onConfirm={this.deposit.bind(this, data)}>
					              <a>已申请提现</a>
					            </Popconfirm>
										)
									}
									<span> | </span>
									<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
			          </span>
							)
							break;
						case 3: 
							spanDiv = (
								<span>
									<Popconfirm title="确认结账吗?" onConfirm={this.settle.bind(this, data)}>
			              <a>结账</a>
			            </Popconfirm>
									<span> | </span>
									<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
			          </span>
							)
							break;

					}
					return spanDiv
				}
			}],
			list: [],
			total: 0,
			loading: false,
			cashAccountType: 0,
			status: "",
			hasApplied: 0,
			billAt: '',
			selectedList: [],   //勾选的账单
			clickLock: false,   //重复点击的锁
			roleId: window.USER.role.id
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
	changeApplyStatus(orderId, willApplyStatus) {
		const self = this;
		let newList = this.state.list;
		newList.map((item, i)=>{
			if(item.id == orderId){
				newList[i].status = willApplyStatus;
			}
		})
		this.setState({list: newList});
	},
	deposit(data) {
		const self = this;
		if(this.state.clickLock){ return; } //是否存在点击锁

		this.setState({clickLock: true});

		DailyBillService.apply(data).then((res)=>{
			this.setState({clickLock: false});
			if(res.status == "0"){
				self.changeApplyStatus(data.id, data.willApplyStatus);
			}else{
				message.info(res.msg)
			}
		}).catch((err)=>{
			this.setState({clickLock: false});
			message.info(err)
		})
	},
	settle(id) {
		if(this.state.clickLock){ return; } //是否存在点击锁
		alert("settle"+id)
	},
	multiSettle() {
		if(this.state.clickLock){ return; } //是否存在点击锁

		if(this.state.selectedList.length == 0){
			return message.info('请勾选您需要结账的账单');
		}

		let selectedListId = "";
		let selectedListIdArr = [];
		this.state.selectedList.map((item, i)=>{
			selectedListIdArr.push(item.id);
		})
		selectedListId = selectedListIdArr.join(',');
		alert(selectedListId)
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

    let footer = "";
    if(this.state.roleId == 3){
    	if(this.state.selectedList.length == 0){
    		footer = (
    			<Button onClick={this.multiSettle} className="multiSettleBtn" size="large" type="primary">
    				结账
    			</Button>
    		)
    	}else{
    		footer = (
    			<Popconfirm title="确认结账吗?" onConfirm={this.multiSettle}>
				    <Button className="multiSettleBtn" size="large" type="primary">结账</Button>
				  </Popconfirm>
				 )
    	}
    }else{
    	footer = "";
    }

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
					defaultValue=""
					style={{width: 120}}
					onChange={this.handleStatusChange}>
					<Option value="">请选择账单状态</Option>
					<Option value="2">已结算</Option>
					<Option value="0,1,3">未结算</Option>
					<Option value="1">已申请提现</Option>
					<Option value="0">未申请提现</Option>
				</Select>
				<DatePicker onChange={this.handleBillAtChange} className="item"/>
				<Button className="item" type="primary" icon="search" onClick={this.handleFilter}>过滤</Button>
			</div>
			<Table rowSelection={rowSelection} dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading} footer={() => {return footer}}/>
		</section>);
	}
});

export default App;
