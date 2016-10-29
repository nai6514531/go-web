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
				title: '结账日期',
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
					switch (status) {
						case 0:
							return <div className="status">未申请提现</div>
							break;
						case 1:
							if(this.state.roleId == 3){
								return <div className="status">未结账</div>
							}else{
								return <div className="status">已申请提现</div>
							}
							break;
						case 2:
							return <div className="status">已结账</div>
							break;
						case 3:
							return <div className="status">结账中</div>
							break;
						case 4:
							return <div className="status">结账失败</div>
							break;
					}
				}
			}, {
				title: '操作',
				dataIndex: 'id',
				key: 'method',
				render: (id, record) => {
					const roleId = this.state.roleId;
					const status = record.status;
					const accountType = record.accountType;
					let data = {
						id: record.id,
						userId: record.userId,
						billAt: moment(record.billAt).format('YYYY-MM-DD'),
						willApplyStatus: status == 0 ? 1: 0 //即将提现改变的状态
					}
					let spanDiv = "";
					switch (roleId) {
						case 1:
							spanDiv = (
								<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
							)
							break;
						case 2:
						case 5: 
							spanDiv = (
								accountType == 1? (
									<span>
										<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
	          			</span>
								): status==0?(	
									<span>	
										<Popconfirm title="申请提现吗?" onConfirm={this.deposit.bind(this, data)}>
				              <a>申请提现</a>
				            </Popconfirm>
				            <span> | </span>
										<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
	          			</span>
								): (
									<span>
										<Popconfirm title="取消申请提现吗?" onConfirm={this.deposit.bind(this, data)}>
				              <a>已申请提现</a>
				            </Popconfirm>
				            <span> | </span>
										<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
	          			</span>
								)
								/*status == 0?(		
									<Popconfirm title="申请提现吗?" onConfirm={this.deposit.bind(this, data)}>
			              <a>申请提现</a>
			            </Popconfirm>
								):(
									<Popconfirm title="取消申请提现吗?" onConfirm={this.deposit.bind(this, data)}>
			              <a>已申请提现</a>
			            </Popconfirm>
								)*/
							)
							break;
						case 3: 
							spanDiv = (accountType == 1&&status!=4)? (
								<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
							) : (status == 1||status == 4)?(
								<span>
									<Popconfirm title="确认结账吗?" onConfirm={this.settle.bind(this, data)}>
			              <a>结账</a>
			            </Popconfirm>
			            <span> | </span>
									<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
          			</span>
							):(
								<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
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
			roleId: window.USER.role.id,
			nowAjaxStatus: {}   //保存ajax请求字段状态
		};
	},
	list(data) {
		var self = this;
		this.setState({
			loading: true,
			nowAjaxStatus: data
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
	changeSettlementStatus(data) {
		this.list(this.state.nowAjaxStatus)
	},
	deposit(data) {
		const self = this;
		if(this.state.clickLock){ return; } //是否存在点击锁

		this.setState({clickLock: true});

		DailyBillService.apply(data).then((res)=>{
			this.setState({clickLock: false});
			if(res.status == "0"){
				let msg = data.willApplyStatus==1?"已成功申请提现":"已成功取消提现"
				message.info(msg)
				self.changeApplyStatus(data.id, data.willApplyStatus);
			}else{
				message.info(res.msg)
			}
		}).catch((err)=>{
			this.setState({clickLock: false});
			message.info(err)
		})
	},
	settle(data) {
		let params = [];
		let paramsObj = {
			"userId": data.userId+"",
			"billAt": data.billAt,
		};
		params.push(paramsObj)

		this.settleAjax(params);
	},
	multiSettle() {

		if(this.state.selectedList.length == 0){
			return message.info('请勾选您需要结账的账单');
		}

		let params = [];
		let paramsObj = {};

		let billAtObj = {};
		let userIdArr = [];
		this.state.selectedList.map((item, i)=>{
			let billAt = moment(item.billAt).format('YYYY-MM-DD')
			if(!billAtObj[billAt]){
				billAtObj[billAt] = [];
			}
			billAtObj[billAt].push(item);
		})
		for(var i in billAtObj){
			paramsObj = {};
			paramsObj.billAt = i;
			userIdArr = [];
			for(var j=0; j<billAtObj[i].length; j++){
				console.log(billAtObj[i][j].userId);
				userIdArr.push(billAtObj[i][j].userId);
			}
			paramsObj.userId = userIdArr.join(',');
			params.push(paramsObj);
		}
		console.log(params);
		this.settleAjax(params);
	},
	settleAjax(data) {
		let self = this;
		if(this.state.clickLock){ return; } //是否存在点击锁
		this.setState({clickLock: true});
		console.log()
		DailyBillService.updateSettlement(data).then((res)=>{
			this.setState({clickLock: false});
			if(res.status == "0"){
				//message.info(res.msg)
				self.changeSettlementStatus(data);
			}else{
				message.info(res.msg)
			}
		}).catch((err)=>{
			message.info(err)
			this.setState({clickLock: false});
			message.info(err)
		})
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
				let listObj = self.state.nowAjaxStatus;
				listObj.page = page;
				listObj.perPage = perPage;
				self.list(listObj);
			},
			onChange(page) {
				let listObj = self.state.nowAjaxStatus;
				listObj.page = this.current;
				listObj.perPage = this.pageSize;
				self.list(listObj);
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

    let footer = ""; //底部结账按钮，第一期先保留 @！#不要删掉我哦
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

    let orderSelectOption = "";
    if(this.state.roleId == 3){
    	orderSelectOption = (
    		<Select
					className="item"
					defaultValue=""
					style={{width: 120}}
					onChange={this.handleStatusChange}>
					<Option value="">请选择账单状态</Option>
					<Option value="1">未结账</Option>
					<Option value="2">已结账</Option>
					<Option value="3">结账中</Option>
					<Option value="4">结账失败</Option>
				</Select>
    	)
    }else{
    	orderSelectOption = (
    		<Select
					className="item"
					defaultValue=""
					style={{width: 120}}
					onChange={this.handleStatusChange}>
					<Option value="">请选择账单状态</Option>
					<Option value="0">未申请提现</Option>
					<Option value="1">已申请提现</Option>
					<Option value="2">已结账</Option>
					<Option value="4">结账失败</Option>
				</Select>
    	)
    }

		return (<section className="view-settlement-list">
			<header>
				<Breadcrumb>
					<Breadcrumb.Item>结算管理</Breadcrumb.Item>
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
				{orderSelectOption}
				<DatePicker onChange={this.handleBillAtChange} className="item"/>
				<Button className="item" type="primary" icon="search" onClick={this.handleFilter}>筛选</Button>
			</div>
			<Table dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading} />
		</section>);
	}
});

export default App;
