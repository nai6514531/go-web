import React from 'react';
import _ from 'underscore';
import {Affix, Button,Input, Table, Icon, Popconfirm, Select, DatePicker, Breadcrumb, message, Modal} from 'antd';
const Option = Select.Option;
import './app.less';
import DailyBillService from '../../../service/daily_bill';
import FormDiv from './form.jsx';
import ExportBillForm from './export-bill.jsx'
import moment from 'moment';
import zhCN from 'antd/lib/date-picker/locale/zh_CN';
const confirm = Modal.confirm;
import {hashHistory} from 'react-router';
const App = React.createClass({
	getInitialState() {
		return {
			columns: [
        {
				title: '账单号',
				dataIndex: 'id',
				key: 'id',
          width:60,
				// sorter: (a, b) => +a.id - +b.id
			},
        {
				  title: '运营商',
				  dataIndex: 'userName',
				  key: 'userName',
          width:80,
			}, {
				title: '金额',
				dataIndex: 'totalAmount',
				key: 'totalAmount',
          width:90,
				render: (total_amount) => {
					return <p className="bigger">{total_amount / 100}</p>;
				}
			},  {
				title: '收款方式',
				dataIndex: 'accountName',
				key: 'accountName',
          width:60
			}, {
				title: '账期',
				dataIndex: 'billAt',
				key: 'billAt',
          width:95,
				render: (bill_at) => {
					return moment(bill_at).format('YYYY-MM-DD')
				}
			}, {
				title: '账户信息',
				dataIndex: 'settledAt',
				key: 'settledAt',
        width: 250,
        render: (settled_at, record) => {
          if(record.accountType == 1) {
            return <div>
              {record.realName?<span>{record.realName}</span>:''}
              {record.realName && record.account ?' | ':''}
              {record.account?<span className="info">账号: {record.account}</span>:''}
              {record.account && record.mobile ?' | ':''}
              {record.mobile?<span className="info">手机号: {record.mobile}</span>:''}
            </div>
          } else if (record.accountType == 3) {
            return <div>
              {record.realName?<span>户名: {record.realName}</span>:''}
              {record.realName && record.bankName ?' | ':''}
              {record.bankName?<span className="info">{record.bankName}</span>:''}
              {record.bankName && record.account ?' | ':''}
              {record.account?<span className="info">{record.account}</span>:''}
              {record.account && record.mobile ?' | ':''}
              {record.mobile?<span className="info">{record.mobile}</span>:''}
            </div>
          }
        }
			},{
        title: '订单量',
        dataIndex: 'orderCount',
        key: 'orderCount',
          width:60
      }, {
				title: '状态',
				dataIndex: 'status',
				key: 'status',
          width:80,
				render: (status, record) => {
					switch (status) {
						case 0:
							if(this.state.roleId == 3 || record.accountType == 1){
								return <div className="status unfinished">未结账</div>
							}else{
								return <div className="status unfinished">未结账</div>
							}
							break;
						case 1:
							if(this.state.roleId == 3 || record.accountType == 1){
								return <div className="status unfinished">未结账</div>
							}else{
								return <div className="status">已申请结账</div>
							}
							break;
						case 2:
							return <div className="status done">已结账</div>
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
				width: 100,
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
          const mark = <a onClick={this.markRow.bind(this,record.key)}>{record.hasMarked? '取消标记' :'标记'}</a>;
					switch (roleId) {
						case 1:
							spanDiv = (
                <div>
                  <a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
                </div>
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
											{/*<Popconfirm title="取消结账申请吗?" onConfirm={this.deposit.bind(this, data)}>*/}
					              {/*<a>取消申请</a>*/}
					            {/*</Popconfirm>*/}
					            {/*<span> | </span>*/}
											<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
                    </span>
									)
								}
							}
							break;
						case 3:
							if( status==2){
								spanDiv = (
                  <div>
                    <a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
                    <span> | </span>
                    {mark}
                  </div>
								)
							}else if (status == 3) {
                spanDiv = (
                  <div>
                    <a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
                    <span> | </span>
                    {mark}
                  </div>
                )
              }else if( status == 4){
								spanDiv = (
									<span>
										<Popconfirm title="确认重新结账吗?" onConfirm={this.settle.bind(this, data)}>
				              <a>重新结账</a>
				            </Popconfirm>
				            <span> | </span>
										<a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
                     <span> | </span>
                    {mark}
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
                    <span> | </span>
                    {mark}
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
			cashAccountType: "0",           //搜索收款方式
			status: "",                     //搜索账单状态
			hasApplied: 0,                  //
      startAt: '',                     //搜索结账开始时间
      endAt: '',                  //搜索结账结束时间
      endOpen: false,
      userOrBank: '',                 //搜索代理商或银行名
      selectedList: [],   						//勾选的账单
      amount:0,                       //选中项的金额合计
      // amountVisible: false,
      rowColor:[],
			nowAliPayingOrderNum: 0,        //有多少笔支付宝的账单正在支付
			clickLock: false,   						//重复点击的锁
			roleId: window.USER.role.id,
			nowAjaxStatus: {},  						//保存ajax请求字段状态
			payModalVisible: false,  				//支付modal的状态 false:hide true:show
			payList: {},  									//支付宝数据
			nowSettlement: {}, 							//只在结账的数据
			selectedRowKeys: [], 						//已勾选的列表[key1, key2...]
      page: 1,									      //当前页码
      perPage: 10,
      exportModalVisible: false,
      exportUrl:'',
		};
	},
  componentWillMount() {
    let search = this.getSearchCondition();
    const query = this.props.location.query;
    if(!_.isEmpty(query)) {
      search = {
        cashAccountType: query.cashAccountType,
        status: query.status,
        startAt: query.startAt,
        endAt: query.endAt,
        userOrBank: query.userOrBank,
      }
      this.setState(search);
    }
    this.list(search);
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
				if (data && data.status == "00") {
					this.clearSelectRows(); //清空结账勾选
          const list = data.data.list;
          let rowColor = {};
          for (let i=0;i < list.length;i++) {
            rowColor[list[i].id] = list[i].hasMarked?'marked':'';
          }
					this.setState({
            rowColor: rowColor,
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
  mark(id) {
    var self = this;
    this.setState({
      loading: true,
    });
    DailyBillService.mark(id)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          message.success(data.msg,3);
          // 成功则需要重新拉数据,做保持搜索条件功能时此处需要再加上搜索的条件
          let search = this.getSearchCondition();
          this.setState({page: 1});
          search.page = 1;
          search.perPage = self.state.perPage;
          this.list(search);
        } else {
          message.error(data.msg,3);
        }
      })
  },
  markRow(id) {
    this.mark(id);
    this.setState({page: 1})
  },
  checkedRow(ids) {
    // 无论什么情况,先把所有的灰色置空,然后再把 ids 里的 ID 放进去
    const rowColor = this.state.rowColor;
    // 不管什么情况,勾选就变色,取消勾选就变会原来的颜色
    for (var id in rowColor) {
      if(rowColor[id] !== 'marked'){
        rowColor[id]='';
      }
    }
    for (let i=0;i < ids.length;i++) {
      if(!rowColor[ids[i]]){
        rowColor[ids[i]] = 'checked';
      }
    }
    this.setState({rowColor: rowColor});
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
      // 按照日期来存储当天所有需要结算的单
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
      // 具体某日的所有结算的用户的ID
			paramsObj.userId = userIdArr.join(',');
      // 具体某日的所有结算的账单号
			paramsObj.idArr = idArr;
      // 按照日期聚合的账单号以及用户ID数组
			params.push(paramsObj);
		}
		this.settleAjax(params);
    this.closeAmountVisible();
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
      // res 为结账状态,res.data 为返回的结账字段(支付宝),见上注释
			this.setState({clickLock: false});
			if(res.status == "00"){
        // 只有返回了支付宝相关字段才会出现支付宝二次确认框
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
  CalculateAmount() {
    const self = this;
    if(this.state.amount >0 && this.state.selectedList.length>0) {
      confirm({
        title:'确认结算?',
        content: '选中账单总笔数为'+this.state.selectedList.length+'笔，总金额为:'+this.state.amount +'元',
        onOk() {
          self.multiSettle();
        },
        onCancel() {
        },
      });
    } else if (this.state.selectedList.length<=0) {
      message.info('请勾选您需要计算金额的账单',3);
    } else if(this.state.amount <= 0 ){
      message.info('勾选项金额合计为0或者账单状态不是未结账',3);
    }

  },
  // 筛选相关
	handleFilter(){
    this.setState({page: 1});
    let search = this.getSearchCondition();
    search.page = 1;
    search.perPage = this.state.perPage;
    this.list(search);
    this.props.location.query = search;
    hashHistory.replace(this.props.location);
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
  handleBillAtChange (field, value) {
    // 此处需要对时间进行统一处理
    this.setState({
      [field]: value?moment(value).format('YYYY-MM-DD'):"",
    });
  },
  onStartChange (value) {
    this.handleBillAtChange('startAt', value);
  },
  onEndChange (value) {
    this.handleBillAtChange('endAt', value);
  },
  handleUserOrBankChange(e) {
    const userOrBank = e.target.value.replace(/[\r\n\s]/g,"");
    this.setState({
      userOrBank: userOrBank,
    });
  },
  disabledStartDate (startAt) {
    const endAt = new Date(this.state.endAt?this.state.endAt:null).getTime();
    if (!startAt || !endAt) {
      return false;
    }
    return startAt.valueOf() > endAt.valueOf();
  },
  disabledEndDate (endAt){
    const startAt = new Date(this.state.startAt?this.state.startAt:null).getTime();
    if (!endAt || !startAt) {
      return false;
    }
    return endAt.valueOf() <= startAt.valueOf();
  },
  handleStartOpenChange (open) {
    if (!open) {
      this.setState({ endOpen: true });
    }
  },
  handleEndOpenChange (open) {
    this.setState({ endOpen: open });
  },
  getSearchCondition() {
    const {cashAccountType, status, startAt, endAt, userOrBank, page, perPage}=this.state;
    const searchCondition = {
      cashAccountType: cashAccountType,
      status: status,
      startAt: startAt,
      endAt: endAt,
      userOrBank: userOrBank,
      // page: page,
      // perPage: perPage,
    }
    return searchCondition;
  },
  // 导出 excel
  exportBill(){
    const search = this.getSearchCondition();
    DailyBillService.export(search).then((data)=>{
      if(data.status == "00"){
        message.info(data.msg,3);
        this.setState({exportUrl: data.data});
        this.openExportModal();
      }else{
        message.info(data.msg)
      }
    }).catch((err)=>{
      message.info(err,3);
    })
  },
  openExportModal() {
    this.setState({exportModalVisible: true});
  },
  closeExportModal() {
    this.setState({exportModalVisible: false});
  },
	initializePagination(){
		var self = this;
    let search = this.getSearchCondition();
		return {
			size: "small",
			total: self.state.total,
			showSizeChanger: true,
      pageSizeOptions: ['10','20','30','40','300'],
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
			onShowSizeChange(page, perPage) {
        self.setState({page: page, perPage: perPage});
        search.page = page;
        search.perPage = perPage;
				self.list(search);
			},
			onChange(page) {
				self.setState({page: page});
        search.page = page;
        search.perPage = self.state.perPage;
				self.list(search);
			},
		};
	},
	clearSelectRows() { //清空勾选
		this.setState({
			selectedRowKeys: [],
			selectedList: []
		})
    // 清空选中颜色
    this.checkedRow([]);
	},
	getAliPayOrderNum() {//获取支付宝的订单
		return 123
	},
  rowClassName(record, index) {
    return this.state.rowColor[record.key];
  },
  closeAmountVisible() {
    this.setState({
      amountVisible: false,
    });
  },
  render(){
    let defaultValue = this.getSearchCondition();
    const query = this.props.location.query;
    if(!_.isEmpty(query)) {
      defaultValue = {
        cashAccountType: query.cashAccountType,
        status: query.status,
        startAt: query.startAt,
        endAt: query.endAt,
        userOrBank:query.userOrBank,
      };
    }
		const self = this;
		const {list, columns, endOpen, selectedRowKeys} = this.state;
		const pagination = this.initializePagination();
		pagination.current = this.state.page;
		// const selectedRowKeys = this.state.selectedRowKeys;
		const rowSelection = {
			selectedRowKeys: selectedRowKeys,
		  onChange(selectedRowKeys, selectedRows) {
        // 被勾选的行
        let newSelectedRows = [];
		  	let newSelectedRowKeys = [];
		  	for(var i=0; i<selectedRows.length; i++){
		  		let status = selectedRows[i].status;
          let hasMarked = selectedRows[i].hasMarked;
          // 已结账,结账中,被标记均不可选
		  		if( status!=2 && status!=3 && !hasMarked){
		  			newSelectedRows.push(selectedRows[i]);
		  			newSelectedRowKeys.push(selectedRows[i].key);
		  		}
		  	}
        const amountList = selectedRows.filter(function (item) {
          return item.status == 1;
        })
        const amount = Math.round(amountList.reduce((total,item)=>{return total+item.totalAmount/100},0)*100)/100;
		  	self.setState({
		  		selectedList: newSelectedRows,
		  		selectedRowKeys: newSelectedRowKeys,
          amount:amount,
		  	})
		    //console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        let ids = [];
        for(var i=0; i< newSelectedRowKeys.length; i++){
          ids.push(newSelectedRowKeys[i]);
        }
        // 改变背景色,取消的时候,获取不到选中的ID
        self.checkedRow(ids);
      },
		  onSelect(record, selected, selectedRows) {

		  },
		  onSelectAll(selected, selectedRows, changeRows) {
		  	var len = self.state.list.length;
		  	if(changeRows.length < len){
		  		self.setState({
			  		selectedList: [],
			  		selectedRowKeys: []
			  	})
          self.checkedRow([]);
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
					defaultValue={defaultValue.status}
					style={{width: 120 }}
					onChange={this.handleStatusChange}>
					<Option value="">请选择结账状态</Option>
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
          defaultValue={defaultValue.status}
          style={{width: 120 }}
					onChange={this.handleStatusChange}>
					<Option value="">请选择结账状态</Option>
					<Option value="1">未结账</Option>
					{/*<Option value="1">已申请结账</Option>*/}
					<Option value="2">已结账</Option>
					<Option value="3">结账中</Option>
					<Option value="4">结账失败</Option>
				</Select>
    	)
    }
    const defaultStartDate = defaultValue.startAt?{defaultValue: moment(defaultValue.startAt, 'YYYY-MM-DD')}:{}
    const defaultEndDate = defaultValue.endAt?{defaultValue: moment(defaultValue.endAt, 'YYYY-MM-DD')}:{}
    const payList = this.state.payList;

    const tableDiv = this.state.roleId == 3?(
    	<Table scroll={{ x: 900  }} className="table" rowClassName={this.rowClassName} rowSelection={rowSelection} dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading} footer={() => footer} />
    ):(
    	<Table scroll={{ x: 900  }} className="table"rowClassName={this.rowClassName} dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading} />
    )
		return (<section className="view-settlement-list">
			<div className="top-fix">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>结算管理</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="filter">
          <Select className="item filter-select"
                  defaultValue={defaultValue.cashAccountType}
                  style={{width: 120 }}
                  onChange={this.handleCashAccountTypeChange}>
            <Option value="0">请选择收款方式</Option>
            <Option value="1">支付宝</Option>
            <Option value="2">微信</Option>
            <Option value="3">银行</Option>
          </Select>
          {orderSelectOption}
          <DatePicker
            style={{width:120,marginLeft:4}}
            {...defaultStartDate}
            disabledDate={this.disabledStartDate}
            placeholder="开始日期"
            onChange={this.onStartChange}
            onOpenChange={this.handleStartOpenChange}
            className="item"
            locale={zhCN}
          />
          -
          <DatePicker
            style={{width:120,marginRight:4}}
            {...defaultEndDate}
            disabledDate={this.disabledEndDate}
            placeholder="结束日期"
            onChange={this.onEndChange}
            open={endOpen}
            onOpenChange={this.handleEndOpenChange}
            className="item"
            locale={zhCN}
          />
          <Input defaultValue={defaultValue.userOrBank} style={{width: 160}} className="item" placeholder="输入运营商名称或者银行名称或户名" onChange={this.handleUserOrBankChange}/>
          <Button className="item" type="primary" icon="search" onClick={this.handleFilter}>筛选</Button>
          <Button className="item" type="primary" icon="download" onClick={this.exportBill}>导出</Button>
          {USER.role.id == 3 ?
            <Button className="calculate item" onClick={this.CalculateAmount} type="primary">计算金额</Button>
            :""}
        </div>
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
      <Modal title="账单导出"
             wrapClassName="playModal"
             visible={this.state.exportModalVisible}
             onOk={this.openExportModal}
             onCancel={this.closeExportModal}
      >
        <ExportBillForm closeExportModal={this.closeExportModal} openExportModal={_.bind(self.openExportModal, self, false)} exportUrl={this.state.exportUrl} />
      </Modal>
		</section>);
	}
});

export default App;
