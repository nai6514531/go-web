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
				title: 'API_KEY',
				dataIndex: 'api_key',
				key: 'api_key'
			}, {
				title: 'TOKEN',
				dataIndex: 'token',
				key: 'token'
			}, {
				title: '操作',
				dataIndex: 'id',
				key: 'method',
				render: (id) => {
					return <span>
                            <a href={'#/trello/' + id}>修改</a>
                            <span> | </span>
                            <Popconfirm title="确定删除吗?" onConfirm={this.remove.bind(this, id)}>
                              <a>删除</a>
                            </Popconfirm>
                          </span>
				}
			}],
			list: []
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
		const {list, columns} = this.state;
		return (<section className="view-settlement-list">
			<header>
				账单列表
			</header>
			<div className="control">
				<a href="#/trello/create"><Button type="solid"><Icon type="plus"/> 添加</Button></a>
			</div>
			<Table dataSource={list} columns={columns} bordered/>
		</section>);
	}
});

export default App;
