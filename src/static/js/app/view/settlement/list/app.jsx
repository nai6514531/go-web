import React from 'react';
import _ from 'underscore';
import {Button, Table, Icon, Popconfirm, Select, DatePicker, Breadcrumb, message, Modal} from 'antd';
const Option = Select.Option;
import './app.less';
import DailyBillService from '../../../service/daily_bill';
import FormDiv from './form.jsx';
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
				title: '运营商',
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
				render: (settled_at, record) => {
					return record.status == 2?settled_at:'/';
				}
			}, {
				title: '状态',
				dataIndex: 'status',
				key: 'status',
				render: (status, record) => {
					switch (status) {
						case 0:
							if(this.state.roleId == 3 || record.accountType == 1){
								return <div className="status">未结账</div>
							}else{
								return <div className="status">未结账</div>
							}
							break;
						case 1:
							if(this.state.roleId == 3 || record.accountType == 1){
								return <div className="status">未结账</div>
							}else{
								return <div className="status">已申请结账</div>
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
				width: 150,
				fixed: 'right',
				render: (id, record) => {
					const roleId = this.state.roleId;
					const status = record.status;
					const accountType = record.accountType;
					let data = {
						id: record.id,
						userId: record.userId,
						billAt: moment(record.billAt).format('YYYY-MM-DD'),
						willApplyStatus: status == 0 ? 1: 0 //即将结账改变的状态
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

							if(accountType == 1){
								spanDiv = (
									<span>
										<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
	          			</span>
								)
							}else{
								if(status == 0){
									spanDiv = (
										<span>
											<Popconfirm title="申请结账吗?" onConfirm={this.deposit.bind(this, data)}>
					              <a>申请结账</a>
					            </Popconfirm>
					            <span> | </span>
											<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
		          			</span>
									)
								}else if(status == 2 || status == 3){
									spanDiv = (
										<span>
											<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
		          			</span>
									)
								}else if(status == 4){
									spanDiv = (
										<span>
											<Popconfirm title="重新申请结账吗?" onConfirm={this.deposit.bind(this, data)}>
					              <a>重新申请</a>
					            </Popconfirm>
					            <span> | </span>
											<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
		          			</span>
									)
								}else{
									spanDiv = (
										<span>
											<Popconfirm title="取消结账申请吗?" onConfirm={this.deposit.bind(this, data)}>
					              <a>取消申请</a>
					            </Popconfirm>
					            <span> | </span>
											<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
		          			</span>
									)
								}
							}
							break;
						case 3:
							if( status==2||status==3 ){
								spanDiv = (
									<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
								)
							}else if( status == 4){
								spanDiv = (
									<span>
										<Popconfirm title="确认重新结账吗?" onConfirm={this.settle.bind(this, data)}>
				              <a>重新结账</a>
				            </Popconfirm>
				            <span> | </span>
										<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
	          			</span>
								)
							}else{
								spanDiv = (
									<span>
										<Popconfirm title="确认结账吗?" onConfirm={this.settle.bind(this, data)}>
				              <a>结账</a>
				            </Popconfirm>
				            <span> | </span>
										<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
	          			</span>
								)
							}
							/*spanDiv = (accountType == 1&&status!=4)? (
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
							)*/
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
			selectedList: [],   						//勾选的账单
			nowAliPayingOrderNum: 0,        //有多少笔支付宝的账单正在支付
			clickLock: false,   						//重复点击的锁
			roleId: window.USER.role.id,
			nowAjaxStatus: {},  						//保存ajax请求字段状态
			currentPage: 1,									//当前页码
			payModalVisible: false,  				//支付modal的状态 false:hide true:show
			payList: {},  									//支付宝数据
			nowSettlement: {}, 							//只在结账的数据
			selectedRowKeys: [], 						//已勾选的列表[key1, key2...]
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
				if (data && data.status == "00") {
					this.clearSelectRows(); //清空结账勾选
					this.setState({
						total: data.data.total,
						list: data.data.list.map((item) => {
							item.key = item.id;
							return item;
						})
					});
				} else {
					message.info(data.msg);
				}
			})
			.catch((e)=> {
				self.setState({
					loading: false,
				});
			})
	},
	setPayModalVisible(status) {
    this.setState({ payModalVisible: status });
  },
  closePayModalVisible() {	//二次支付框取消按钮触发函数
  	const self = this;
  	const data = this.state.payList;
  	DailyBillService.billCancel(data).then((res)=>{
  		if(res.status == "00"){
  			this.refuseSettlementStatus(this.state.nowSettlement);
  			this.setState({ payModalVisible: false });
  			self.clearSelectRows();
  		}else{
  			message.info(res.msg)
  		}
  	}).catch((e)=>{
  		message.info(e)
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
			if(res.status == "00"){
				let msg = data.willApplyStatus==1?"已成功申请结账":"已取消结账"
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
	refuseSettlementStatus(data) { //反转支付状态
		let list = this.state.list;
		for(var i=0; i<data.length; i++){
			for(var j=0; j<list.length; j++){
				if(data[i].idArr.indexOf(list[j].id) >= 0){
					if(list[j].accountType == 1){
						list[j].status = 1;
					}
				}
			}
		}
		this.setState({list: list});
		this.clearSelectRows();
		//this.list(this.state.nowAjaxStatus)
	},
	changeSettlementStatus(data, resStatus) { //resStatus 0:成功  2：银行OK，支付宝失败
		let aliPayNum = 0;
		let list = this.state.list;
		console.log(data)
		console.log(list)
		for(var i=0; i<data.length; i++){
			for(var j=0; j<list.length; j++){
				if(data[i].idArr.indexOf(list[j].id) >= 0){
					if(list[j].accountType == 1 && resStatus == 0 && list[j].status != 3){
						list[j].status = 3;
						aliPayNum++
					}else if(list[j].accountType == 3){
						list[j].status = 2;
					}
				}
			}
		}
		console.log(aliPayNum)
		this.setState({
			list: list,
			getAliPayOrderNum: aliPayNum
		});
		this.clearSelectRows();
		//this.list(this.state.nowAjaxStatus)
	},
	settle(data) {
		let params = [];
		let idArr = [];
		idArr.push(data.id)
		let paramsObj = {
			"idArr": idArr,
			"userId": data.userId+"",
			"billAt": data.billAt,
		};
		params.push(paramsObj);
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
		let idArr = [];
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
				userIdArr.push(billAtObj[i][j].userId);
				idArr.push(billAtObj[i][j].id)
			}
			paramsObj.userId = userIdArr.join(',');
			paramsObj.idArr = idArr;
			params.push(paramsObj);
		}
		this.settleAjax(params);
	},
	settleAjax(data) {
		let self = this;
		/*var res = {"status":"00","data":{"_input_charset":"utf-8","account_name":"深圳市华策网络科技有限公司","batch_fee":"0.02","batch_no":"20161104151149","batch_num":"1","detail_data":"963^13631283955pp^余跃群^0.02^无","email":"laura@maizuo.com","notify_url":"http://a4bff7d7.ngrok.io/api/daily-bill/alipay/notification","partner":"","pay_date":"20161104","request_url":"https://mapi.alipay.com/gateway.do","service":"batch_trans_notify","sign":"e553969dd81c1f3504111045ae1da4d3","sign_type":"MD5"},"msg":"日账单结账成功"};
		if(res.status == "00"){
			if(res.data != undefined){
				self.setState({ payList: res.data, nowSettlement: data });
				self.setPayModalVisible(true);
			}
			self.changeSettlementStatus(data, res.status);
		}else if(res.status == "01"){
			message.info("结账操作失败，请稍后重试！")
		}else if(res.status == "02"){
			self.changeSettlementStatus(data, res.status);
			message.info("银行结账成功，支付宝结账失败")
		}else(
      message.info(res.msg)
    )
    return;*/
		if(this.state.clickLock){ return; } //是否存在点击锁
		this.setState({clickLock: true});
		DailyBillService.updateSettlement(data).then((res)=>{
			this.setState({clickLock: false});
			if(res.status == "00"){
				if(res.data != undefined){
					self.setState({ payList: res.data, nowSettlement: data });
					self.setPayModalVisible(true);
				}
				self.changeSettlementStatus(data, res.status);
			}else if(res.status == "01"){
				message.info("结账操作失败，请稍后重试！")
			}else if(res.status == "02"){
				self.changeSettlementStatus(data, res.status);
				message.info("银行结账成功，支付宝结账失败")
			}else(
	      message.info(res.msg)
	    )

		}).catch((err)=>{
			message.info(err)
			this.setState({clickLock: false});
			message.info(err)
		})
	},
	handleFilter(){
		const {cashAccountType, status, hasApplied, billAt}=this.state;
		this.setState({currentPage: 1})
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
			size: "small",
			total: total,
			showSizeChanger: true,
			onShowSizeChange(page, perPage) {
				let listObj = self.state.nowAjaxStatus;
				listObj.page = page;
				listObj.perPage = perPage;
				self.list(listObj);
			},
			onChange(page) {
				self.setState({currentPage: this.current})
				let listObj = self.state.nowAjaxStatus;
				listObj.page = this.current;
				listObj.perPage = this.pageSize;
				self.list(listObj);
			},
		};
	},
	clearSelectRows() { //清空勾选
		this.setState({
			selectedRowKeys: [],
			selectedList: []
		})
	},
	getAliPayOrderNum() {//获取支付宝的订单
		return 123
	},
	render(){
		const self = this;
		const {list, columns} = this.state;
		const pagination = this.initializePagination();
		pagination.current = this.state.currentPage;

		const selectedRowKeys = this.state.selectedRowKeys;
		const rowSelection = {
			selectedRowKeys: selectedRowKeys,
		  onChange(selectedRowKeys, selectedRows) {
		  	let newSelectedRows = [];
		  	let newSelectedRowKeys = [];
		  	for(var i=0; i<selectedRows.length; i++){
		  		let status = selectedRows[i].status;
		  		if( status!=2 && status!=3 ){
		  			newSelectedRows.push(selectedRows[i]);
		  			newSelectedRowKeys.push(selectedRows[i].key);
		  		}
		  	}
		  	self.setState({
		  		selectedList: newSelectedRows,
		  		selectedRowKeys: newSelectedRowKeys
		  	})
		    //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
		  },
		  onSelect(record, selected, selectedRows) {
		    //console.log(record, selected, selectedRows);
		  },
		  onSelectAll(selected, selectedRows, changeRows) {
		  	var len = self.state.list.length;
		  	if(changeRows.length < len){
		  		self.setState({
			  		selectedList: [],
			  		selectedRowKeys: []
			  	})
		  	}

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
					style={{width: 120, display: "none"}}
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
					style={{width: 120, display: "none"}}
					onChange={this.handleStatusChange}>
					<Option value="">请选择账单状态</Option>
					<Option value="0">未申请结账</Option>
					<Option value="1">已申请结账</Option>
					<Option value="2">已结账</Option>
					<Option value="3">结账中</Option>
					<Option value="4">结账失败</Option>
				</Select>
    	)
    }

    const payList = this.state.payList;

    const tableDiv = this.state.roleId == 3?(
    	<Table scroll={{ x: 980 }} className="table" rowSelection={rowSelection} dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading} footer={() => footer} />
    ):(
    	<Table scroll={{ x: 980 }} className="table" dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading} />
    )

		return (<section className="view-settlement-list">
			<header>
				<Breadcrumb>
					<Breadcrumb.Item>结算管理</Breadcrumb.Item>
				</Breadcrumb>
			</header>
			<div className="filter">
				<Select className="item"
						defaultValue="0"
						style={{width: 120, display: "none"}}
						onChange={this.handleCashAccountTypeChange}>
					<Option value="0">请选择收款方式</Option>
					<Option value="1">支付宝</Option>
					<Option value="2">微信</Option>
					<Option value="3">银行</Option>
				</Select>
				{orderSelectOption}
				<DatePicker onChange={this.handleBillAtChange} className="item"/>
				<Button className="item" type="primary" icon="search" onClick={this.handleFilter}>筛选</Button>
			</div>
			{tableDiv}
			<Modal
        title={'你有'+ self.state.getAliPayOrderNum +'笔支付宝账单需要二次确认'}
        wrapClassName="playModal"
        closable={false}
        visible={this.state.payModalVisible}
        onOk={() => this.setPayModalVisible(false)}
        onCancel={() => this.closePayModalVisible()}
      >
        <FormDiv closePayModalVisible={this.closePayModalVisible} setPayModalVisible={_.bind(self.setPayModalVisible, self, false)} payList={payList} />
      </Modal>
		</section>);
	}
});

export default App;
