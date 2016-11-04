import React from 'react';
import {Button, Table, Icon, Popconfirm, Select, DatePicker, Breadcrumb, message, Modal} from 'antd';
import './app.less';
import DailyBillService from '../../../service/daily_bill';
import FormDiv from './form.jsx';
import moment from 'moment';

const Option = Select.Option;

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
                      <Popconfirm title="申请提现吗?" onConfirm={this.deposit.bind(this, data)}>
                        <a>申请提现</a>
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
                }else{
                  spanDiv = (
                    <span>
                      <Popconfirm title="取消提现申请吗?" onConfirm={this.deposit.bind(this, data)}>
                        <a>取消提现申请</a>
                      </Popconfirm>
                      <span> | </span>
                      <a href={`#settlement/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
                    </span>
                  )
                }
              }
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
      nowAjaxStatus: {},   //保存ajax请求字段状态
      currentPage: 1,
      payModalVisible: false,  //支付modal的状态 false:hide true:show
      payList: {},  //支付宝数据
      selectedRowKeys: [],
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
          this.clearSelectRows(); //清空结账勾选
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
  setPayModalVisible(status) {
    this.setState({ payModalVisible: status });
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
      if(res.status == 0){
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
  changeSettlementStatus(data) {
    let list = this.state.list;
    for(var i=0; i<data.length; i++){
      for(var j=0; j<list.length; j++){
        if(data[i].idArr.indexOf(list[j].id) >= 0){
          if(list[j].accountType == 1){
            list[j].status = 3;
          }else if(list[j].accountType == 3){
            list[j].status = 2;
          }
        }
      }
    }
    this.setState({list: list});
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
        console.log(billAtObj[i][j].userId);
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
    /*this.setState({
      payList: {
        service: "batch_trans_notify",
        partner: "ALIPAYID",
        _input_charset: "utf-8",
        notify_url: "http://a4bff7d7.ngrok.io/api/daily-bill/alipay/notification",
        account_name: "深圳市华策网络科技有限公司",
        detail_data: "aliPayDetailDataStr",
        batch_no: "batch_no",
        batch_num: "batch_num",
        batch_fee: "batch_fee",
        email: "email",
        pay_date: "pay_date",
        sign: "sign",
        sign_type: "sign_type",
        request_url: "request_url",
        billAt: data[0].billAt
      }
    })
    this.setPayModalVisible(true);
    this.changeSettlementStatus(data);
    return*/

    let self = this;
    if(this.state.clickLock){ return; } //是否存在点击锁
    this.setState({clickLock: true});
    DailyBillService.updateSettlement(data).then((res)=>{
      this.setState({clickLock: false});
      if(res.status == 0){
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
    this.setState({selectedRowKeys: []})
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
        console.log(3)
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

        if(changeRows.length < 10){
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
          <Option value="0">未申请提现</Option>
          <Option value="1">已申请提现</Option>
          <Option value="2">已结账</Option>
          <Option value="3">结账中</Option>
          <Option value="4">结账失败</Option>
        </Select>
      )
    }

    const payList = this.state.payList;

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
      <Table rowSelection={rowSelection} dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading} footer={() => footer} />
      <Modal
        title="支付二次确认"
        wrapClassName="playModal"
        visible={this.state.payModalVisible}
        onOk={() => this.setPayModalVisible(false)}
        onCancel={() => this.setPayModalVisible(false)}
        >
        <FormDiv payList={payList} />
      </Modal>
    </section>);
  }
});

export default App;
