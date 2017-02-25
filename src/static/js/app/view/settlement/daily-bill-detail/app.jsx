import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb} from "antd";
import "./app.less";
import moment from 'moment';
import DailyBillDetailService from "../../../service/daily_bill_detail";
const App = React.createClass({
  propTypes: {
    user_id: React.PropTypes.string,
    bill_at: React.PropTypes.string
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
  componentWillMount() {
    const {user_id, bill_at}=this.props.params;
    const pager = {page:1,perPage:10}
    this.list(user_id, bill_at,'',pager);
  },
  render() {
    var self = this;
    const {list, total, columns} = this.state;
    const {user_id, bill_at}=this.props.params;
    const pagination = {
      total: total,
      showSizeChanger: true,
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pager = {page:current,perPage: pageSize}
        self.list(user_id, bill_at, '',pager);
      },
      onChange(current) {
        const pager = {page: current, perPage:this.pageSize};
        self.list(user_id, bill_at, '', pager);
      }
    };
    return (<section className="view-daily-bill-detail">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><a href="/#/settlement/">结算管理</a></Breadcrumb.Item>
          <Breadcrumb.Item>明细</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 500 }} dataSource={list}
             columns={columns} pagination={pagination}
             bordered loading={this.state.loading}
             rowClassName={this.rowClassName}
      />
    </section>);
  }
});

export default App;
