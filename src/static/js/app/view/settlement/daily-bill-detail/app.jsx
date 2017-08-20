import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb} from "antd";
import "./app.less";
import moment from 'moment';
import DailyBillDetailService from "../../../service/daily_bill_detail";
const filter = {
  "0": "-",
  "1": "微信",
  "2": "支付宝",
  "3": "账户余额",
  "4": "IC卡余额"
}
const App = React.createClass({
  propTypes: {
    userId: React.PropTypes.string,
    billAt: React.PropTypes.string
  },
  getInitialState() {
    return {
      columns: [{
        title: '账单号',
        dataIndex: 'id',
        key: 'id',
        width:50,
        sorter: (a, b) => +a.id - +b.id
      }, {
        title: '设备编号/楼道信息',
        dataIndex: 'deviceSerial',
        key: 'deviceSerial',
        width:100,
        render: (deviceSerial,record)=>{
          return <span>{deviceSerial} {record.address?' / '+record.address:""}</span>
        }
      }, {
        title: '服务类型',
        dataIndex: 'deviceMode',
        key: 'deviceMode',
        width:20,
        render: (data) => {
          if (data == 1) {
            return <div>单脱</div>
          } else if (data == 2) {
            return <div>快洗</div>
          } else if (data == 3) {
            return <div>标准</div>
          } else if (data == 4) {
            return <div>大物洗</div>
          }
        }
      }, {
        title: '金额',
        dataIndex: 'value',
        key: 'value',
        width:60,
        render: (value) => {
          return value / 100 + "元";
        }
      },{
        title: '支付方式',
        dataIndex: 'paymentId',
        key: 'paymentId',
        width:60,
      },{
        title: '洗衣手机号',
        dataIndex: 'mobile',
        key: 'mobile',
        width:60,
      }, {
        title: '下单时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width:70,
        render:(createdAt)=>{
          return moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
        }
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width:50,
        render: (status) => {
          if (status == 7) {
            return <div className="status">正常</div>
          } else if (status == 4) {
            return <div className="status highlight">已退款</div>
          } else {
            return <div className="status"> / </div>
          }
        }
      },{
        title: '是否结算',
        dataIndex: 'settle',
        key: 'settle',
        width:60,
      }],
      list: [],
      total: 0,
      loading: false
    };
  },
  rowClassName(record, index) {
    return this.rowColor[record.id];
  },
  list(userId, billAt, serialNumber, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    DailyBillDetailService.list(userId, billAt, serialNumber, pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          let rowColor = {};
          this.setState({
            total: data.data.total,
            list: data.data.list.map((item, key) => {
              item.paymentId = filter[item.paymentId];
              item.settle = item.settle ? "是" : "否";
              rowColor[item.id] = key%2==0?'white':'gray';
              self.rowColor = rowColor;
              return item;
            })
          });
        } else {
          message.info(data.msg);
        }
      })
  },
  remove(id) {

  },
  toBillDetail(e) {
    e.preventDefault();
    history.go(-1);
  },
  componentWillMount() {
    const {userId, billAt, billId} = this.props.params;
    const pager = {page:1, perPage:10}
    this.list(userId, billAt, '', pager);
  },
  render() {
    var self = this;
    const {list, total, columns} = this.state;
    const {userId, billAt, billId} = this.props.params;
    const isDetailByBills = !!billId
    const pagination = {
      total: total,
      showSizeChanger: true,
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pager = {page: current, perPage: pageSize}
        self.list(userId, billAt, '', pager);
      },
      onChange(current) {
        const pager = {page: current, perPage: this.pageSize};
        self.list(userId, billAt, '', pager);
      }
    };
    return (<section className="view-daily-bill-detail">
      <header>
        {
          isDetailByBills ? <Breadcrumb>
            <Breadcrumb.Item><a href="/#/settlement/bill">提现管理</a></Breadcrumb.Item>
            <Breadcrumb.Item><a href="#" onClick={this.toBillDetail}>账单明细</a></Breadcrumb.Item>
            <Breadcrumb.Item>明细</Breadcrumb.Item>
          </Breadcrumb> : <Breadcrumb>
            <Breadcrumb.Item><a href="/#/settlement/">结算管理</a></Breadcrumb.Item>
            <Breadcrumb.Item>明细</Breadcrumb.Item>
          </Breadcrumb>
        }
      </header>
      <Table scroll={{ x: 500 }} dataSource={list}
             columns={columns} pagination={pagination}
             bordered loading={this.state.loading}
             rowClassName={this.rowClassName}
             rowKey={record => record.id}
      />
    </section>);
  }
});

export default App;
