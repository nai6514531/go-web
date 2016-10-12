import React from 'react';
import {Button, Table, Icon, Popconfirm} from 'antd';
import './app.less';
const App = React.createClass({
	getInitialState() {
		return {
			columns: [{
				title: 'ID',
				dataIndex: 'id',
				key: 'id',
				sorter: (a, b) => +a.id - +b.id
			}, {
				title: '昵称',
				dataIndex: 'name',
				key: 'name'
			}, {
				title: '账号',
				dataIndex: 'account',
				key: 'account'
			}, {
				title: '操作',
				dataIndex: 'id',
				key: 'method',
				render: (id) => {
					return <span>
                            <a href={'#/user/' + id}>修改</a>
                            <span> | </span>
                            <Popconfirm title="确定删除吗?" onConfirm={this.remove.bind(this, id)}>
                              <a>删除</a>
                            </Popconfirm>
                          </span>
				}
			}],
			users: []
		};
	},
	list() {

	},
	remove(id) {

	},
	componentWillMount() {
		this.list();
	},
	render() {
		const {users, columns} = this.state;
		return (<section className="view-user-list">
			<header>
				代理商列表
			</header>
			<div className="control">
				<a href="#/user/create"><Button type="solid"><Icon type="plus"/> 添加</Button></a>
			</div>
			<Table dataSource={users} columns={columns} bordered/>
		</section>);
	}
});

export default App;
