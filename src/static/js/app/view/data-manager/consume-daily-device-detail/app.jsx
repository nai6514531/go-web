import React from "react";
import {Input, Button, Table, Icon, Popconfirm, Breadcrumb, message} from "antd";
// import "./app.less";
import DailyBillDetailService from "../../../service/daily_bill_detail";
import {Link} from 'react-router';

import moment from 'moment';


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
      searchValue: '',
      list: [],
      total: 0,
      columns: [
        {
          title: '序号',
          dataIndex: 'key',
          key: 'key',
          width: 40,
        },
        {
          title: '编号/楼道信息',
          dataIndex: 'serialNumber',
          key: 'serialNumber',
          width: 100,
          render: (serialNumber, record) => {
            return <span>{serialNumber} {record.address ? ' / ' + record.address : ""}</span>
          }
        },
        {
          title: '洗衣金额',
          dataIndex: 'price',
          key: 'price',
          width: 80,
          render: (amount) => {
            return Math.round(amount * 100) / 100 + "元";
          }
        },
        {
          title: '洗衣手机号',
          dataIndex: 'mobile',
          key: 'mobile',
          width: 100,
        },
        {
          title: '洗衣类型',
          dataIndex: 'washType',
          key: 'washType',
          width: 60,
          render: (washType) => {
            if (washType == 601) {
              return "单脱";
            } else if (washType == 602) {
              return "快洗";
            } else if (washType == 603) {
              return "标准洗";
            } else if (washType == 604) {
              return "大物洗";
            }
          }
        },
        {
          title: '下单时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 140,
          render: (time) => {
            return moment(time).format('YYYY-MM-DD HH:mm:ss')
          }
        }],
      loading: false
    };
  },
  componentWillMount() {
    const {id, date, serialNumber}= this.props.params;
    const pager = {page: this.state.page, perPage: this.state.perPage};
    this.list(USER.id, date, serialNumber, pager);
  },
  rowClassName(record, index) {
    return this.rowColor[record.key];
  },
  list(userId, billAt, serialNumber, pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    const {id} = this.props.params;
    const baseUrl = "/data/consume/month/" + id + "/" + billAt + "/";
    DailyBillDetailService.deviceBillList(userId, billAt, serialNumber, pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          let rowColor = {};
          this.setState({
            list: data.data.map((item, key) => {
              item.url = baseUrl + item.serialNumber;
              item.key = key + 1;
              rowColor[item.key] = key%2==0?'white':'gray';
              self.rowColor = rowColor;
              return item;
            })
          });
        } else {
          message.info(data.msg);
        }
      })
  },

  initializePagination() {
    const {id, date, serialNumber} = this.props.params;
    const self = this;
    return {
      total: self.state.total,
      showSizeChanger: true,
      size: 'small',
      onShowSizeChange(current, pageSize) {
        const pager = {page: current, perPage: pageSize};
        self.setState(pager);
        self.list(USER.id, date, serialNumber, pager);
      },
      onChange(current) {
        const pager = {page: current, perPage: self.state.perPage};
        self.setState(pager);
        self.list(USER.id, date, serialNumber, pager);
      },
    }
  },
  /*<Breadcrumb.Item><Link to={"/data/consume/month/"+id}>{id}</Link></Breadcrumb.Item>*/
  render() {
    const {list, total, columns} = this.state;
    const {id, date, serialNumber} = this.props.params;
    return (<section className="view-consume-daily-device">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><Link to="/data/consume">消费统计</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to={"/data/consume/month/" + id + "/" + date}>{date}</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{serialNumber}</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{x: 400}} dataSource={list} columns={columns} pagination={false} bordered
             loading={this.state.loading}              
             rowClassName={this.rowClassName}
      />
    </section>);
  }
});

export default App;
