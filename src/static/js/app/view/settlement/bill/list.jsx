import React from 'react';
import Promise from 'bluebird'
import _ from 'underscore';
import moment from 'moment';
import {
	Affix,
	Button,
	Input,
	Table,
	Icon,
	Popconfirm,
	Select,
	DatePicker,
	Breadcrumb,
	message,
	Modal
} from 'antd';
const Option = Select.Option;
import zhCN from 'antd/lib/date-picker/locale/zh_CN';

import './app.less';
import DailyBillService from '../../../service/daily_bill';
import BillService from '../../../service/bill';
const confirm = Modal.confirm;

const BILLS_STATUS = {0: '未结算', 1:'等待结算', 2:'结算成功', 3:'结算中', 4:'结算失败'}

const App = React.createClass({
	getInitialState() {
		return {
			columns: [{
				title: '申请时间',
				dataIndex: 'createdAt',
				width: 80,
				render: (date) => {
					return moment(date).format('YYYY-MM-DD HH:mm')
				}
			}, {
				title: '结算单号',
				dataIndex: 'billId',
				width: 80,
			}, {
				title: '账单天数',
				dataIndex: 'count',
				width: 50,
			}, {
				title: '收款方式',
				dataIndex: 'accountType',
				width: 60,
				render: (type) => {
					return type === 1 ? '支付宝' : type === 2 ? '微信' : '-'
				}
			}, {
				title: '结算金额',
				dataIndex: 'totalAmount',
				width: 90,
				render: (total_amount) => {
					return <p className="bigger">{(total_amount / 100).toFixed(2)}</p>;
				}
			}, {
				title: '手续费',
				dataIndex: 'cast',
				width: 60,
				render: (cast) => {
					return <p className="bigger">{(cast / 100).toFixed(2)}</p>;
				}
			},{
				title: '入账金额',
				dataIndex: 'amount',
				width: 90,
				render: (amount) => {
					return <p className="bigger">{(amount / 100).toFixed(2)}</p>;
				}
			}, {
				title: '状态',
				dataIndex: 'status',
				width: 80,
				render: (status, record) => {
					return <div className="status">{BILLS_STATUS[status]}</div>
				}
			}, {
				title: '结算时间',
				dataIndex: 'billAt',
				width: 60,
				render: (date) => {
					return date ? moment(date).format('YYYY-MM-DD HH:mm') : '-'
				}
			}, {
				title: '操作',
				dataIndex: 'id',
				key: 'method',
				width: 100,
				render: (id, record) => {
					const billId = record.billId;
					const status = record.status;
					if (!!~[4].indexOf(status)) {
						return <span>
							<a onClick={this.handleSettlemenet.bind(this, billId)}>重新结算</a>
		          <span className="ant-divider" />
		          <a href={`#settlement/bill/${billId}`}>明细</a>
		        </span>
					} else {
						return <span>
		          <a href={`#settlement/bill/${billId}`}>明细</a>
		        </span> 
					}
				}
			}],
			roleId: window.USER.role.id,
			search: {
				status: '', //搜索账单状态
				createdAt: ''	
			}
		};
	},
	handleTableChange(pagination) {
    this.props.getBillsList({pagination: pagination, search: { ...this.state.search}});
  },
  search() {
    this.props.getBillsList({search: {...this.state.search}});
  },
	disabledStartDate(startAt) {
		const endAt = new Date(this.state.endAt ? this.state.endAt : null).getTime();
    let dateRange = startAt && startAt.valueOf() > Date.now();
		if (!startAt || !endAt) {
			return dateRange;
		}
		return dateRange;
	},
	handleSettlemenet(id) {
		const self = this;
		BillService.create(id).then((res) => {
			if (res.status !== 0) {
    		return new Promise.reject()
    	}
			message.info("申请提现成功！请等待结算");
    	self.props.getBillsList({search: {...this.state.search}});
		}).catch((e) => {
			message.error("申请重新提现失败！请重试");
		})
	},
  changeDate(value) {
  	const date = value ? moment(value).format('YYYY-MM-DD') : ''
  	this.setState({ search: { ...this.state.search, createdAt:  date}})
  },
	render() {
		const self = this;
		const pagination = {
      total: this.props.pagination.total,
      showSizeChanger: true,
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pager = {page:current, perPage: pageSize}
        self.handleTableChange(pager);
      },
      onChange(current, pageSize) {
        const pager = {page: current, perPage: pageSize};
        self.handleTableChange(pager);
      }
    };
		return (<section className="bill-list">
      <h2>结算记录</h2>
      <div className="search-panel">
      	<DatePicker
          style={{width:120,marginLeft:4}}
          disabledDate={this.disabledStartDate}
          placeholder="申请时间"
          onChange={this.changeDate}
          className="item"
          locale={zhCN}
        />
      	<Select
					className="item"
					defaultValue={this.state.search.status}
					style={{width: 120 }}
					onChange={(value) => { this.setState({search: {...this.state.search, status: value}})}}>
					<Option value="">请选择结算状态</Option>
					<Option value="1">等待结算</Option>
					<Option value="2">结算成功</Option>
					<Option value="3">结算中</Option>
					<Option value="4">结算失败</Option>
				</Select>
      	<Button type="primary" onClick={this.search}>查询</Button>
      </div>
      <Table columns={this.state.columns}
      	scroll={{ x: 500 }}
        rowKey={record => record.id}
        dataSource={this.props.bills.list}
        pagination={pagination}
        loading={this.props.bills.loading}
      />
		</section>);
	}
});

export default App;
