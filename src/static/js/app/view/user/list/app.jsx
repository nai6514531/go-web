import React from 'react';
import './app.less';
import { Table, Button, Breadcrumb } from 'antd';
import { Link } from 'react-router';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';


function mapStateToProps(state) {
  const { user: { list, detail, detailTotal } } = state;
  return { list, detail, detailTotal };
}

function mapDispatchToProps(dispatch) {
  const {
    getUserList,
    getDetailTotal,
  } = bindActionCreators(UserActions, dispatch);
  return {
    getUserList,
    getDetailTotal,
  };
}

const columns = [{
  title: 'ID',
  dataIndex: 'index',
  key: 'index',
}, {
  title: '代理商名称',
  dataIndex: 'user',
  key: 'user',
  className: 'table-col',
}, {
  title: '联系人',
  dataIndex: 'contact',
  key: 'contact',
  className: 'table-col',
}, {
  title: '手机',
  dataIndex: 'mobile',
  key: 'mobile',
}, {
  title: '地址',
  dataIndex: 'address',
  key: 'address',
  className: 'table-col',
}, {
  title: '模块数量',
  dataIndex: 'number',
  key: 'number',
}, {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 100,
  fixed: 'right',
  render: (text, record) => (
    <div>
      <p><Link to={'/user/edit/' + record.key}>修改</Link></p>
      {record.showAction?
        <div>
          <p><Link to={'/user/' + record.key} onClick={record.action}>下级代理商</Link></p>
          {USER.role.id == 1 ? "" :
              <p><Link to='/user/device/list'>设备管理</Link></p>
          }
        </div>
      :''}
    </div>
  ),
}];

class AgentTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      page: 1,
      perPage: 10,
      pagination: {},
      child: false,
      list: [],
      pager: {},
      total: 1,
    };
    this.showChild = this.showChild.bind(this);
  }
  componentWillMount() {
    const pager = { page : this.state.page, perPage: this.state.perPage};
    this.loading = true;
    if(this.props.params.id) {
      this.showChild();
      this.props.getUserList(pager);
    } else {
      this.props.getDetailTotal(USER.id);
    }
  }
  showChild() {
    this.setState({
      child: true,
    })
  }
  hideChild() {
    this.setState({
      child: false,
    })
  }
  componentWillUpdate(nextProps, nextState) {
    const self = this;
    const pager = { page : this.state.page, perPage: this.state.perPage};
    // 加载子用户列表
    if(nextState.child == true && this.state.child == false) {
      self.loading = true;
      this.props.getUserList(pager);
    }
    // 首次加载子代理商列表,首次从子用户列表跳转到父用户列表
    if(this.props.list == undefined && nextProps.list) {
      this.first = 1;
    }
    // 首次加载父代理商列表
    if(nextProps.routeParams.id == undefined && this.props.detailTotal == undefined){
      if(this.first) {
        this.setState({child:false});
        this.first = 0;
      }
      if(this.state.child == true && nextState.child == false) {
        self.hideChild();
        self.loading = true;
        this.props.getDetailTotal(USER.id);
      }
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.list !== this.props.list
      || nextProps.detailTotal !== this.props.detailTotal
      || nextState.child == true || nextState.child == false) {
      return true;
    } else {
      return false;
    }

  }
  initializePagination(total) {
    const self = this;
    return {
      total: total,
      showSizeChanger: true,
      size:'small',
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.loading = true;
        self.props.getUserList(pager);
      },
      onChange(current) {
        const pager = { page : current, perPage: self.state.perPage};
        self.loading = true;
        self.setState(pager);
        self.props.getUserList(pager);
      },
    }
  }
  childPagination() {
    let total = 1;
    if(this.state.child){
      if (this.props.list && this.props.list.fetch == true) {
        total = this.props.list.result.data.total;
      }
    }
    return this.initializePagination(total);
  }
  parentPagination() {
    return this.initializePagination(1);
  }
  render() {
    const { list, detailTotal, params: {id} } = this.props;
    let data = '';
    let dataSource = [];
    const self = this;
    if(id) {
      if(list){
        if(list.fetch == true){
          data = list.result.data.list;
          dataSource = data.map(function (item, key) {
            return (
            {
              key: item.id,
              index: item.id,
              user: item.name,
              contact: item.contact,
              mobile: item.mobile,
              address: item.address,
              number: item.deviceTotal ? item.deviceTotal : 0,
              action: self.showChild,
              showAction: false,
            }
            )
          })
          self.loading = false;
        }

      }
    } else {
      if(detailTotal) {
        if(detailTotal.fetch == true) {
          data = detailTotal.result.data;
          dataSource = [{
            key: data.id,
            index: data.id,
            user: data.name,
            contact: data.contact,
            mobile: data.mobile,
            address: data.address,
            number: data.deviceTotal ? data.deviceTotal : 0,
            action: self.showChild,
            showAction: true,
          }
          ];
          self.loading = false;
        }
      }
    }
    const pagination =id? {'pagination':this.childPagination()}:{'pagination':false}
    // const pagination = {};
    return (
      <section className="view-user-list">
        <header>
          {id?
            <Breadcrumb>
              <Breadcrumb.Item><Link to="/user" onClick={this.hideChild.bind(this)}>代理商管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item>下级代理商</Breadcrumb.Item>
            </Breadcrumb>
            :
            <Breadcrumb>
              <Breadcrumb.Item>代理商管理</Breadcrumb.Item>
            </Breadcrumb>
          }
        </header>
        {id?
          <div className="toolbar">
            <Link to='/user/edit/new' className="ant-btn ant-btn-primary item">
              添加新代理商
            </Link>
          </div>:
          ''
        }
        <article>
          <Table
            scroll={{ x: 980 }}
            className="table"
                 columns={columns}
               rowKey={record => record.key}
               dataSource={dataSource}
              {...pagination}
               loading={this.loading ? this.loading : false}
               bordered
          />
        </article>
      </section>
    );
  }
}


AgentTable.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(AgentTable);
