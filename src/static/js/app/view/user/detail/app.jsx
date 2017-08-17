import React from 'react';
import { Table, Button,Input, Breadcrumb,message } from 'antd';
import { Link } from 'react-router';
import './app.less';
import UserService from '../../../service/user';
import SodaBreadcrumb from '../../common/breadcrumb/breadcrumb.jsx'

const columns = [{
  title: '用户编号',
  dataIndex: 'id',
  width: 50,
}, {
  title: '运营商名称',
  dataIndex: 'name',
  width: 100,
  className: 'table-col',
}, {
  title: '联系人',
  dataIndex: 'contact',
  className: 'table-col',
  width:100,
}, {
  title: '登录账号',
  dataIndex: 'account',
  width:120,
}, {
  title: '地址',
  dataIndex: 'address',
  className: 'table-col',
  width:200,
}, {
  title: '模块数量',
  dataIndex: 'deviceTotal',
  width:60,
  render: (deviceTotal) => {
    return deviceTotal || '0';
  }
}, {
  title: '操作',
  dataIndex: 'action',
  width: 120,
  render: (text, record) => (
    <div>
      <p><Link to={'/user/edit/' + record.id}>修改</Link></p>
    </div>
  ),
}];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
      permission: false,
      breadItems: [{title:'运营商管理',url:''},]
    };
    this.detailTotal = this.detailTotal.bind(this);
  }
  componentWillMount() {
    this.getOperateIcPermission();
    this.detailTotal(USER.id);
  }
  getOperateIcPermission() {
    UserService.icCardPermission()
      .then((data) => {
        if( data.status == 0 ) {
          this.setState({
            permission: data.data
          })
        }
      },(error)=>{
        message.error(error.msg,3);
      })
  }
  detailTotal(id) {
    this.setState({
      loading: true,
    });
    UserService.detailTotal(id)
      .then((data) => {
        let list = data.data;
        this.setState({
          loading: false,
          list: [list]
        });
      },(error)=>{
        this.setState({
          loading: false,
        });
        message.error(error.msg,3);
      })
  }
  render() {
    let renduerButton = this.state.permission ? (
      <Link to={"/user/ic-card/recharge"} className="ant-btn ant-btn-primary item" style={{backgroundColor:"#ED9D51",borderColor:"#ED9D51"}}>
        IC卡金额转移
      </Link>
    ) : "";
    return (
      <section className="view-user-detailTotal">
        <header>
          <SodaBreadcrumb items={this.state.breadItems}/>
        </header>
        <div className="toolbar">
          <Link to={"/user/" + USER.id} className="ant-btn ant-btn-primary item">
            下级运营商
          </Link>
          {renduerButton}
        </div>
        <article>
          <Table
            scroll={{ x: 700 }}
            columns={columns}
            rowKey={record => record.id}
            dataSource={this.state.list}
            pagination={false}
            loading={this.state.loading}
            bordered
          />
        </article>
      </section>
    );
  }
}

App.propTypes = {};

export default App;
