import React from "react";
import {Button, Table, Icon, Popconfirm,Breadcrumb} from "antd";
import "./app.less";
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
        sorter: (a, b) => +a.id - +b.id
      }, {
        title: '设备编号/楼道信息',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        render: (serialNumber,record)=>{
          return <span>{serialNumber} {record.address?' / '+record.address:""}</span>
        }
      }, {
        title: '服务类型',
        dataIndex: 'pulseType',
        key: 'pulseType',
        render: (data) => {
          if (data == 601) {
            return <div>单脱</div>
          } else if (data == 602) {
            return <div>快洗</div>
          } else if (data == 603) {
            return <div>标准</div>
          } else if (data == 604) {
            return <div>大物洗</div>
          }
        }
      }, {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        render: (total_amount) => {
          return total_amount / 100 + "元";
        }
      },{
        title: '洗衣手机号',
        dataIndex: 'mobile',
        key: 'mobile',
      }, {
        title: '下单时间',
        dataIndex: 'billAt',
        key: 'billAt'
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          if (status == 0) {
            return <div className="status">正常</div>
          } else if (status == 1) {
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
  list(userId, billAt, page, perPage) {
    var self = this;
    this.setState({
      loading: true,
    });
    DailyBillDetailService.list(userId, billAt, page, perPage)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          this.setState({
            total: data.data.total,
            list: data.data.list.map((item) => {
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
    this.list(user_id, bill_at);
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
        self.list(user_id, bill_at, current, pageSize);
      },
      onChange(current) {
        self.list(user_id, bill_at, this.current, this.pageSize);
      }
    };
    return (<section className="view-daily-bill-detail">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><a href="/#/settlement/">结算管理</a></Breadcrumb.Item>
          <Breadcrumb.Item>明细</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 980 }} dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading}/>
    </section>);
  }
});

export default App;
