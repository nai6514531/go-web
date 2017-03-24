import React from "react";
import {Input, Button, Table, Popconfirm, Breadcrumb, message, Modal, Form} from "antd";
import StatisWashService from "../../../service/consume_search";
import RefundService from "../../../service/refund";
import DeviceService from "../../../service/device";
import {hashHistory} from "react-router";
import moment from "moment";
// import "./app.less";
const _ = require('lodash');
const FormItem = Form.Item;


class FormInModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false
    }
  }
  showModal = () => {
    this.setState({
      visible: true
    });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({loading: true});
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let data = this.props.form.getFieldsValue();
        if (data.hasOwnProperty('step'))data.step = parseInt(data.step);
        this.showConfirm(data);
        //
        //
        //
        //
      }
    });
  }
  handleCancel = () => {
    this.setState({visible: false});
  }
  render() {
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 7},
      wrapperCol: {span: 12},
    };
    const tailFormItemLayout = {
      wrapperCol: {
        span: 12,
        offset: 7,
      },
    };
    return (
      <div>
        <Modal
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          <Form horizontal onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label="模块编号"
            >
              {getFieldDecorator('serialNumber', {
                rules: [{
                  required: true, message: '模块编号不可为空'
                }]
              })(
                <Input type="text" placeholder="请输入模块编号"/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="密码计数"
            >
              {getFieldDecorator('step', {
                rules: [{
                  required: true, type: 'number', message: '密码计数不可为空'
                }]
              })(
                <Input type="text" placeholder="请输入密码计数"/>
              )}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit" loading={this.state.loading}
                      size="large">
                确认重置
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}

const SetDevStepModal = Form.create({})(FormInModal);

const App = React.createClass({
  propTypes: {
    user_id: React.PropTypes.string,
    bill_at: React.PropTypes.string
  },
  getInitialState() {
    const self = this;
    return {
      page: 1,
      perPage: 10,
      account: '',
      serialNumber: '',
      list: [],
      total: 0,
      columns: [{
        title: '序号',
        dataIndex: 'key',
        key: 'key',
        width: 10,
      }, {
        title: '运营商',
        dataIndex: 'user',
        key: 'user',
        width: 50,
      }, {
        title: '服务电话',
        dataIndex: 'telephone',
        key: 'telephone',
        width: 100,
      },
        {
          title: '模块编号',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          width: 50,
        },
        {
          title: '楼道信息',
          dataIndex: 'address',
          key: 'address',
          width: 50,
        },
        {
          title: '洗衣手机号',
          dataIndex: 'account',
          key: 'account',
          width: 100,
        }, {
          title: '洗衣密码',
          dataIndex: 'token',
          key: 'token',
          width: 40,
        }, {
          title: '洗衣金额',
          dataIndex: 'amount',
          key: 'amount',
          width: 50,
          render: (amount) => {
            return Math.round(amount * 100) / 100 + "元";
          }
        }, {
          title: '洗衣类型',
          dataIndex: 'pulseType',
          key: 'pulseType',
          width: 30,
          render: (pulseType) => {
            if (pulseType == 601) {
              return "单脱";
            } else if (pulseType == 602) {
              return "快洗";
            } else if (pulseType == 603) {
              return "标准洗";
            } else if (pulseType == 604) {
              return "大物洗";
            }
          },
        }, {
          title: '下单时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 80,
          render: (createdAt) => {
            return moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
          },
        }, {
          title: '操作',
          dataIndex: 'ticketId',
          key: 'ticketId',
          width: 40,
          render: (text, record) => {
            if (USER.role.id == 4) {
              if (record.status == 7) {
                return <div>
                  <Popconfirm title="确认退款吗?" onConfirm={self.refund.bind(this, record.account ,text)}>
                    <p><a href="#">退款</a></p>
                  </Popconfirm>
                </div>
              } else if (record.status == 4) {
                return <span>已退款</span>
              } else {
                return '/'
              }
            } else {
              return '/'
            }
          },
        }],
      loading: false
    };
  },
  componentWillMount() {
    const query = this.props.location.query;
    const pager = {};
    if (!_.isEmpty(query)) {
      pager.serialNumber = query.serialNumber;
      pager.page = +query.page || 1;
      pager.perPage = +query.perPage || 10;
      pager.account = +query.account || 0;
      this.setState({
        serialNumber: query.serialNumber,
        account: query.account,
        page: +query.page || 1,
        perPage: +query.perPage || 10,
      })
      // 只有有参数时才拉数据
      this.list(pager.account, pager.serialNumber, {page: pager.page, perPage: pager.perPage})
    }
  },
  list(account, serialNumber, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    StatisWashService.list(account, serialNumber, pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          const total = data.data.total;
          this.setState({
            total: total,
            list: data.data.list.map((item, key) => {
              item.key = key + 1 + (self.state.page - 1) * self.state.perPage;
              return item;
            })
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  refund(account, washId) {
    // 退款操作
    var self = this;
    const pager = {page: this.state.page, perPage: this.state.perPage}
    RefundService.refund(account, washId)
      .then((data) => {
        if (data && data.status == '00') {
          message.success('退款成功', 3);
          // 成功后重新拉取数据,退款情况下可能搜索的是 serialNumber
          self.list(this.state.account, this.state.serialNumber, pager);
        } else {
          message.info(data.msg);
        }
      })
  },
  status(serialNumber, status) {
    // 解除占用
    DeviceService.statusBySN(serialNumber, status)
      .then((data) => {
        message.success(data.msg, 3);
      }, (error)=> {
        message.error(error.msg, 3);
      })
  },
  changeStatus() {
    const serialNumber = this.state.serialNumber.replace(/[\r\n\s]/g, "");
    if (serialNumber) {
      this.status(serialNumber, {status: 0});
    }
  },
  handleInputChange(item, e) {
    switch (item) {
      case 'serialNumber':
        this.setState({serialNumber: e.target.value});
        break;
      case 'account':
        this.setState({account: e.target.value});
        break;
    }
  },
  handleSearch(searchItem) {
    const pager = {page: 1, perPage: this.state.perPage};
    if (searchItem == 'account') {
      const account = this.state.account.replace(/[\r\n\s]/g, "");
      if (account) {
        this.refs.serialNumberInput.refs.input.value = '';
        this.replaceLocation(account, '', 1, this.state.perPage);
        this.setState({serialNumber: ''});
        this.list(account, "", pager);
      } else {
        message.info('请输入洗衣手机号', 3);
      }
    } else {
      const serialNumber = this.state.serialNumber.replace(/[\r\n\s]/g, "");
      if (serialNumber) {
        this.refs.accountInput.refs.input.value = '';
        this.replaceLocation('', serialNumber, 1, this.state.perPage);
        this.setState({account: ''});
        this.list("", serialNumber, pager);
      } else {
        message.info('请输入模块编号', 3);
      }
    }
    this.setState(pager);
  },
  replaceLocation(account, serialNumber, page, perPage) {
    const query = {
      account: account,
      serialNumber: serialNumber,
      page: page,
      perPage: perPage,
    }
    this.props.location.query = query;
    hashHistory.replace(this.props.location);
  },
  showModal(){
    "use strict";
    return true;
  },
  initializePagination() {
    const account = this.state.account;
    const serialNumber = this.state.serialNumber;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size: 'small',
      defaultPageSize: this.state.perPage,
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pager = {page: current, perPage: pageSize};
        self.setState(pager);
        self.list(account, serialNumber, pager);
        //重置 URL
        self.replaceLocation(account, serialNumber, current, pageSize);
      },
      onChange(current) {
        const pager = {page: current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(account, serialNumber, pager);
        //重置 URL
        self.replaceLocation(account, serialNumber, current, self.state.perPage);
      },
      showModal(){

      }
    }
  },
  render() {
    const query = this.props.location.query;
    // 给 input 设置初始值
    let serialNumber = '';
    let account = '';
    let current = this.state.page;
    if (!_.isEmpty(query)) {
      serialNumber = query.serialNumber;
      account = query.account;
      current = +query.page;
    }
    var self = this;
    const {list, total, columns} = this.state;
    const pagination = this.initializePagination();
    pagination.current = current;
    return (
      <section className="view-statis-consume-search">
        <SetDevStepModal visiable = {this.showModal}/>
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>消费查询</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <div className="toolbar">
          <span> 洗衣手机号：</span>
          <Input style={{width:120}}
                 ref="accountInput"
                 placeholder="请输入洗衣手机号" defaultValue={account}
                 onChange={this.handleInputChange.bind(this,'account')}
                 onPressEnter={this.handleSearch.bind(this,'account')}
          />
          <Button type="primary item" onClick={this.handleSearch.bind(this,'account')}>查询</Button>
          <span> 模块编号：</span>
          <Input style={{width:120}}
                 ref="serialNumberInput"
                 placeholder="请输入模块编号" defaultValue={serialNumber}
                 onChange={this.handleInputChange.bind(this,'serialNumber')}
                 onPressEnter={this.handleSearch.bind(this,'serialNumber')}
          />
          <Button type="primary item" onClick={this.handleSearch.bind(this,'serialNumber')}>查询</Button>
          { USER.id == 4 || USER.id == 5 || USER.id == 368 || USER.id == 465 || USER.id == 1140 || USER.id == 1631 ?
            <Button type="primary item" onClick={this.changeStatus}>解除占用</Button> :
            ""
          }
          { USER.id == 368 ?
            <Button type="primary item" onClick={this.showModal}>重置模块计数</Button> :
            ""
          }
        </div>
        <article>
          <Table scroll={{ x: 650 }} dataSource={list}
                 columns={columns} pagination={pagination}
                 bordered loading={this.state.loading}
          />
        </article>
      </section>
    );
  }
});

export default App;
