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
const { RangePicker } = DatePicker;
const BILLS_STATUS = {0: '未申请结算', 1:'等待结算', 2:'结算成功', 3:'结算中', 4:'结算失败'}

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
				title: '收款账号',
				dataIndex: 'accountType',
				width: 60,
				render: (type, record) => {
					if (!!~[1].indexOf(type)) {
            return _.template([
            	'支付宝 | ',
              '<%- realName %>',
              '账号：<%- account %>'
              ].join(''))({
                realName: record.realName ? record.realName + ' | ' : '',
                account: record.account || '-'
              })
          } 
          if (!!~[2].indexOf(type)) {
            return _.template([
            	'微信 | ',
              '<%- realName %>',
              ].join(''))({
                realName: record.realName || ''
              })
          } 
          return '-'
				}
			}, {
				title: '结算金额',
				dataIndex: 'totalAmount',
				width: 90,
				render: (total_amount) => {
					return (total_amount / 100).toFixed(2)
				}
			}, {
				title: '手续费',
				dataIndex: 'cast',
				width: 60,
				render: (cast) => {
					return (cast / 100).toFixed(2)
				}
			},{
				title: '入账金额',
				dataIndex: 'amount',
				width: 90,
				render: (amount) => {
					return (amount / 100).toFixed(2)
				}
			}, {
				title: '状态',
				dataIndex: 'status',
				width: 80,
				render: (status, record) => {
					if (status === 4) {
            return <p className='fail'><span>{BILLS_STATUS[status]}</span><Icon type='question-circle' onClick={this.showFailInfo} /></p>
          }
					return BILLS_STATUS[status]
				}
			}, {
				title: '结算时间',
				dataIndex: 'settledAt',
				width: 60,
				render: (date, record) => {
					return date && record.status === 2 ? moment(date).format('YYYY-MM-DD HH:mm') : '-'
				}
			}, {
				title: '是否自动结算',
				dataIndex: 'mode',
				width: 60,
				render: (mode) => {
					return mode === 0 ? '自动结算' : '手动结算'
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
	            <a onClick={this.handleSettlemenet.bind(this, billId)}>重新申请</a>
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
				startAt: '',
				endAt: ''
			}
		};
	},
	handleTableChange(pagination) {
    this.props.getBillsList({pagination: pagination, search: { ...this.state.search}});
  },
  search() {
    this.props.getBillsList({search: {...this.state.search}});
  },
	disabledDate(current) {
		return current && current.valueOf() > Date.now();
	},
	showFailInfo() {
    Modal.info({
      content: (
        <div>
          <p>有结账失败记录很有可能是收款账号和姓名不匹配，请检查后修改收款方式。</p>
        </div>
      ),
      onOk() {},
    });
  },
	handleSettlemenet(id) {
		const self = this;
		let cashAccountType = this.props.cashAccount.type || 0;
		const bill = _.findWhere(this.props.bills.list, {billId: id}); 
		if (cashAccountType === 3) {
			return message.info("你当前收款方式为银行卡，不支持结算，请修改收款方式再进行结算操作。")
		}
		if (!~[1, 2, 3].indexOf(cashAccountType)) {
			return message.info("你当前未设定收款方式，请修改收款方式再进行结算操作。")
		}
		confirm({
	    title: '确认重新申请结算',
	    content: <p>共有<span className='color-red'>{bill.count}</span>天账单结算，结算金额为<span className='color-red'>{bill.totalAmount/100}</span>元，本次结算将收取<span className='color-red'>{bill.cast/100}</span>元手续费，是否确认结算？</p>,
	    onOk() {
	    	BillService.create(id).then((res) => {
					if (res.status !== 0) {
						throw new Error(res.msg)
		    	}
					message.info("申请成功！财务将在1日内结算");
		    	self.props.getBillsList({search: {...self.state.search}});
				}).catch((err) => {
					message.error(err.message || "申请结算失败！请重试");
				})
	    },
	    onCancel() {
	    },
	  });
		
	},
  changeDate(value) {
  	const startAt = moment(value[0]).format('YYYY-MM-DD') || ''
  	const endAt = moment(value[1]).format('YYYY-MM-DD') || ''
  	this.setState({ search: { ...this.state.search, startAt: startAt, endAt: endAt}})
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
        <RangePicker
        	disabledDate={this.disabledDate}
		      format="YYYY-MM-DD"
		      placeholder={['开始时间', '结束时间']}
		      onChange={this.changeDate}
		    />
      	<Select
					className="item"
					defaultValue={this.state.search.status}
					style={{width: 120 }}
					onChange={(value) => { this.setState({search: {...this.state.search, status: value}})}}>
					<Option value="">请选择结算状态</Option>
					<Option value="1">等待结算</Option>
					<Option value="3">结算中</Option>
					<Option value="2">结算成功</Option>
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
      <p className='tip-bottom'>注意：1. 入账金额=结算金额-手续费；2. 若有结账失败记录很有可能是收款账号和姓名不匹配，请检查后修改收款方式；</p>
		</section>);
	}
});

export default App;