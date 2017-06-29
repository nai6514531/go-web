import React from 'react';
import { Table, Button, Input, Breadcrumb, message, Modal, Form } from 'antd';
import { Link } from 'react-router';

import UserService from '../../../service/user';
import SodaBreadcrumb from '../../common/breadcrumb/breadcrumb.jsx'
import moment from 'moment';
import './app.less'
const FormItem = Form.Item;
const confirm = Modal.confirm;
const columns = [{
  title: '序号',
  dataIndex: 'id',
  width: 50,
}, {
  title: '学生登录手机号',
  dataIndex: 'mobile',
  width: 100,
  className: 'table-col',
  render(text, record, index) {
    return <Link to={"/user/ic-card/recharge/" + record.mobile}>{text}</Link>;
  }
}, {
  title: '充值金额(元)',
  dataIndex: 'value',
  className: 'table-col',
  width:100,
}
// ,
//  {
//   title: '适用商家',
//   dataIndex: 'applyProviders',
//   width:120,
// }
, {
  title: '充值时间',
  dataIndex: 'createdAt',
  className: 'table-col',
  width:200,
}];
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      modalVisible: false,
      list:[],
      newKey: 0,
      btnLoading: false,
      pagination: {
        showSizeChanger:true,
        current:1,
        pageSize: 10,
        showTotal: total => `共 ${total} 条`
      },
    };
    this.searchString = "";
    this.breadItems = [
      {
        title:'运营商管理',
        url:'/user'
      },
      {
        title:'IC卡金额转移'
        ,url:''
      }
    ];
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleRecharge = this.handleRecharge.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.disMissModal = this.disMissModal.bind(this);
    this.showConfirm = this.showConfirm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    this.fetchData();
  }
  handleInputChange(e) {
    this.searchString = e.target.value
  }
  handleSearch(e) {
    let pager = { ...this.state.pagination };
    pager.current = 0;
    this.fetchData(pager);
  }
  handleRecharge() {
    this.setState({
      modalVisible: true,
    });
  }
  fetchData(pageInfo) {
    let pager = { ...this.state.pagination };
    if(pageInfo) {
      pager.current = pageInfo.current;
      pager.pageSize = pageInfo.pageSize;
    }
    this.setState({
      loading: true,
    });
    UserService.icCardList(this.searchString,pager)
      .then((result) => {
        let list = result.data.list;
        // 处理适用商家
        list.map((item) => {
          let applyProvidersName = "";
          let applyProvidersList = JSON.parse(item.snapshot);
          applyProvidersList.map((value,index) => {
            let addComma = applyProvidersList.length - 1 == index ? '' : ',';
            applyProvidersName = applyProvidersName + value.name + addComma;
          });
          item.applyProviders = applyProvidersName;
          item.value = item.value / 100;
          item.createdAt = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')
        })
        pager.total = result.data.total;
        this.setState({
          loading: false,
          pagination: pager,
          list: list
        });
      },(error)=>{
        this.setState({
          loading: false,
        });
        message.error(error.msg,3);
      })
  }
  handleTableChange(pagination) {
    this.fetchData(pagination);
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values = this.formatParams(values);
        this.showConfirm(values);
      }
    });
  }
  disMissModal() {
    this.setState({
      modalVisible: false,
      newKey: this.state.newKey+=1
    });
  }
  showConfirm(params) {
    let self = this;
    confirm({
      content: '请仔细检查手机号与金额是否正确，确认充值吗?',
      onOk() {
        self.recharge(params);
      },
      onCancel() {
        // self.disMissModal();
      },
    });
  }
  recharge(params) {
    this.setState({
      btnLoading: true,
    });
    UserService.icCardRecharge(params)
      .then((result) => {
        if( result.status == 0 ) {
            this.fetchData();
            this.disMissModal();
        }
        this.setState({
          btnLoading: false
        });
        message.info(result.msg);
      },(error)=>{
        this.setState({
          btnLoading: false,
        });
        message.error(error.msg,3);
      })
  }
  formatParams(params) {
    let data = params.applyProviders.replace(/，/g,",").split(",");
    let formatData = [];
    data.map((value) => {
      (value !== "") && formatData.push(value);
    })
    params.applyProviders = formatData;
    params.amount = Number(params.amount) * 100;
    return params;
  }
  checkAmount = (rule, value, callback) => {
    if(value === '' || typeof value === 'undefined') {
      callback();
    } else {
      let pointPart = value.split(".")[1];
      value = Number(value);
      if ( value > 500 ) {
        callback('不可超过500元');
      } else if ( Object.is(value,NaN) || value <= 0 ) {
        callback('请输入正确的金额');
      } else if( pointPart && pointPart.length > 2 ){
        callback('金额不允许超过小数点后两位');
      } else {
        callback();
      }
    }
  }
  checkNumber = (rule, value, callback) => {
    if(typeof value === "undefined" || value === "") {
      callback();
    } else if( Object.is(Number(value),NaN) || value.length !== 11) {
      callback('请输入正确的手机号');
    } else {
      callback();
    }
  }
  onBlurHandler = (e) => {
    let number = e.target.value;
    if( Object.is(Number(number),NaN) || number.length !== 11) {
      return;
    }
    UserService.icCardBasicInfo(number)
      .then((result) => {
        let applyProvidersName = "";
        let applyProvidersList = result.data.applyProviders;
        applyProvidersList.map((value,index) => {
          let addComma = applyProvidersList.length - 1 == index ? '' : ',';
          applyProvidersName = applyProvidersName + value.account + addComma;
        });
        this.props.form.setFieldsValue({
           applyProviders: applyProvidersName,
         });
      },(error)=>{
        // message.error(error.msg);
      })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { modalVisible, pagination, list, loading, newKey, btnLoading } = this.state;
    console.log("pagination",pagination)
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    return (
      <section className="view-user-list">
        <header>
          <SodaBreadcrumb items={this.breadItems}/>
        </header>
        <div className="toolbar">
          <Input
            style={{width:160}}
            placeholder="请输入手机号"
            onChange={this.handleInputChange}
            onPressEnter={this.handleSearch}
          />
          <Button type="primary item" onClick={this.handleSearch}>查询</Button>
          <Button type="primary item" style={{backgroundColor:"#ED9D51",borderColor:"#ED9D51"}} onClick={this.handleRecharge}>充值</Button>
        </div>
        <article>
          <Table
            scroll={{ x: 980 }}
            className="table"
            columns={columns}
            rowKey={record => record.id}
            dataSource={list}
            loading={loading}
            bordered
            pagination={pagination}
            onChange={this.handleTableChange}
          />
        </article>
        <Modal
          visible={modalVisible}
          footer={null}
          onCancel={this.disMissModal}
          key={newKey}
          >
          <div style={{
            paddingTop: "50px",
            paddingBottom: "10px",
            paddingLeft: "10px"
          }}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label="学生登录手机号"
            >
              {getFieldDecorator("mobile", {
                rules: [{
                  required: true, message: "手机号不可为空",
                }, {
                  validator: this.checkNumber
                }],
              })(
                <Input placeholder="请输入手机号" onBlur={this.onBlurHandler}/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="充值金额(元)"
            >
              {getFieldDecorator("amount", {
                rules: [{
                  required: true, message: "金额不可为空",
                }, {
                  validator: this.checkAmount
                }],
              })(
                <Input placeholder="请输入充值金额"/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="适用商家账号"
            >
              {getFieldDecorator("applyProviders", {
                rules: [{
                  required: true, message: "账号不可为空",
                }],
              })(
                <Input placeholder="如有多个账号，需用英文逗号隔开"/>
              )}
            </FormItem>
            <p className="describe-text">充值金额只可用于适用商家名下的设备</p>
            <FormItem style={{textAlign: "center"}}>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={btnLoading}
                >
                充值
              </Button>
            </FormItem>
          </Form>
          </div>
        </Modal>
      </section>
    )
  }
}
const WrappedApp = Form.create()(App);
export default WrappedApp;
