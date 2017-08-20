import React from 'react';
import Promise from 'bluebird'
import _ from 'underscore';
import {
  Table,
  Popconfirm,
  Select,
  DatePicker,
  Breadcrumb,
  message,
  Modal
} from 'antd';
const Option = Select.Option;
import './app.less';
import DailyBillService from '../../../service/daily_bill';

import moment from 'moment';
const confirm = Modal.confirm;

const BILLS_STATUS = {0: '未申请结算', 1:'等待结算', 2:'结算成功', 3:'结算中', 4:'结算失败'}

const Detail = React.createClass({
  getInitialState() {
    return {
      columns: [{
        title: '账单号',
        dataIndex: 'id',
        key: 'id',
        width: 60,
        // sorter: (a, b) => +a.id - +b.id
      }, {
        title: '运营商',
        dataIndex: 'userName',
        key: 'userName',
        width: 80,
      }, {
        title: '金额',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: 90,
        render: (total_amount) => {
          return (total_amount / 100).toFixed(2)
        }
      }, {
        title: '账期',
        dataIndex: 'billAt',
        key: 'billAt',
        width: 95,
        render: (date) => {
          return moment(date).format('YYYY-MM-DD')
        }
      }, {
        title: '账户信息',
        dataIndex: 'mobile',
        key: 'mobile',
        width: 250,
        render: (mobile, record) => {
          if (!!~[1].indexOf(record.accountType)) {
            return _.template([
              '<%- realName %>',
              '账号：<%- account %>'
              ].join(' | '))({
                realName: record.realName,
                account: record.account || '-'
              })
          } 
          if (!!~[2].indexOf(record.accountType)) {
            return _.template([
              '<%- realName %>',
              ].join(' | '))({
                realName: record.realName,
                nickName: record.nickName || '-'
              })
          } 
          if (!!~[3].indexOf(record.accountType)) {
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
          return '-'
        }
      }, {
        title: '订单量',
        dataIndex: 'orderCount',
        key: 'orderCount',
        width: 60
      }, {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: (status, record) => {
          return <div className="status">{BILLS_STATUS[status]}</div>
        }
      }, {
        title: '操作',
        dataIndex: 'id',
        key: 'method',
        width: 100,
        render: (id, record) => {
          return <span>
            <a href={`#settlement/bill/detail/daily-bill-detail/${record.userId}/${moment(record.billAt).format('YYYY-MM-DD')}`}>明细</a>
          </span>
        }
      }],
      list: [],
      loading: false,
      pagination: {
        total: 0,
        perPage: 10,
        page:1
      }
    };
  },
  componentDidMount() {
    this.getDailyBill();
  },
  getDailyBill({ ...options }) {
    var self = this;
    const pagination = _.extendOwn(this.state.pagination, options || {});
    self.setState({ loading: true, pagination: pagination });
    const isBillsDetail = !!~this.props.location.pathname.indexOf('detail')
    DailyBillService.list({
      cashAccountType: "0",
      status: isBillsDetail ? 0 : '',
      startAt: "",
      endAt: "",
      searchStr: "",
      page: pagination.page,
      perPage: pagination.perPage,
      billId: self.props.params.id || ''
    }).then((res) => {
        self.setState({
          list: res.data.list || [],
          loading: false,
          pagination: {
            ...pagination,
            total: res.data.total
          }
        });
      })
      .catch((e) => {
        self.setState({
          loading: false,
        });
      })
  },
  handleTableChange(pagination) {
    this.getDailyBill(pagination)
  },
  render() {
    const self = this;
    const pagination = {
      total: this.state.pagination.total,
      showSizeChanger: true,
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pager = {page:current, perPage: pageSize}
        self.handleTableChange(pager);
      },
      onChange(current, pageSize) {
        const pager = {page: current, perPage:pageSize};
        self.handleTableChange(pager);
      }
    };
    return (<section className="view-settlement-list">
      <header>
        <Breadcrumb>
          <Breadcrumb.Item><a href="/#/settlement/bill">结算查询</a></Breadcrumb.Item>
          <Breadcrumb.Item>账单明细</Breadcrumb.Item>
        </Breadcrumb>
      </header>
      <Table scroll={{ x: 900 }}  
        dataSource={this.state.list} 
        columns={this.state.columns} 
        pagination={pagination} 
        loading={this.state.loading}
        rowKey={record => record.id}
      />
    </section>);
  }
});

export default Detail;
