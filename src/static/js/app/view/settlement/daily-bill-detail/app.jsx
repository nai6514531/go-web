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
				title: 'ID',
				dataIndex: 'id',
				key: 'id',
				sorter: (a, b) => +a.id - +b.id
			}, {
				title: '设备编号',
				dataIndex: 'serial_number',
				key: 'serial_number'
			}, {
				title: '账单日期',
				dataIndex: 'bill_at',
				key: 'bill_at'
			}, {
				title: '金额',
				dataIndex: 'amount',
				key: 'amount',
				render: (total_amount) => {
					return total_amount / 100;
				}
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
				if (data && data.status == '0') {
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
					<Breadcrumb.Item><a href="/#/settlement/">账单列表</a></Breadcrumb.Item>
					<Breadcrumb.Item>账单详情</Breadcrumb.Item>
				</Breadcrumb>
			</header>
			<Table dataSource={list} columns={columns} pagination={pagination} bordered loading={this.state.loading}/>
		</section>);
	}
});

export default App;
