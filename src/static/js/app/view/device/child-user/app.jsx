import React from 'react';
import { Table, Button,Input, Breadcrumb } from 'antd';
import { Link, hashHistory } from 'react-router';
import SodaTabs from '../tabs/app.jsx';

const columns = [{
  title: '用户编号',
  dataIndex: 'id',
  key: 'id',
  width: 50,
}, {
  title: '运营商名称',
  dataIndex: 'name',
  key: 'name',
  width: 100,
  className: 'table-col',
},   {
  title: '模块数量',
  dataIndex: 'deviceTotal',
  key: 'deviceTotal',
  width:60,
  render: (deviceTotal,record) => {
    const node = deviceTotal?<Link to={"/device/user/"+ record.key +"/list"} >
      {deviceTotal}
    </Link>:'0';
    return node;
  }
}, {
  title: '联系人',
  dataIndex: 'contact',
  key: 'contact',
  className: 'table-col',
  width:100,
},{
  title: '登录账号',
  dataIndex: 'account',
  key: 'account',
  width:120,
},{
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 120,
  render(text, record, index) {
    // 用户 ID 为 key
    const node = <Link to={"/device/user/"+ record.key +"/list"}>
      设备管理
    </Link>
    return node;
  },
}];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
    };
  }
  componentWillMount() {
  }
  handleInputChange(e) {
    this.setState({
      searchValue: e.target.value,
    });
  }
  handleSearch() {
    // 调用搜索方法
  }
  render() {
    const dataSource = [];
    return (
        <section className="view-device-list">
          <header>
            <Breadcrumb>
              <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item>设备管理</Breadcrumb.Item>
            </Breadcrumb>
          </header>
          <div className="toolbar">
            <Input style={{width:200}} placeholder="运营商名称/登陆账号/模块编号" onChange={this.handleInputChange.bind(this)}/>
            <Button type="primary item" onClick={this.handleSearch.bind(this)}>筛选</Button>
            <Table
              scroll={{ x: 700 }}
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              bordered
            />
          </div>
        </section>
    );
  }
}


App.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default App;
