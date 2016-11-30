import React from 'react';
import './app.less';
import { Table, Button,Input, Breadcrumb } from 'antd';
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
  title: '用户编号',
  dataIndex: 'id',
  key: 'id',
}, {
  title: '运营商名称',
  dataIndex: 'name',
  key: 'name',
  className: 'table-col',
}, {
  title: '联系人',
  dataIndex: 'contact',
  key: 'contact',
  className: 'table-col',
}, {
  title: '登录账号',
  dataIndex: 'account',
  key: 'account',
}, {
  title: '地址',
  dataIndex: 'address',
  key: 'address',
  className: 'table-col',
}, {
  title: '模块数量',
  dataIndex: 'deviceTotal',
  key: 'deviceTotal',
  render: (deviceTotal) => {
    return deviceTotal || '0';
  }
}, {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 100,
  fixed: 'right',
  render: (text, record) => (
    <div>
      <p><Link to={'/user/edit/' + record.id}>修改</Link></p>
      {record.showAction?
        <p><Link to={'/user/' + record.id}>下级运营商</Link></p>
      :''}
      {USER.role.id == 1 ? "" :
        <p><Link to={'/user/'+record.id+'/device/list'}>设备管理</Link></p>
      }
    </div>
  ),
}];

class AgentTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      perPage: 10,
      pager: {},
      total: 1,
      searchValue: '',
    };
  }
  componentWillMount() {
    const pager = { page : this.state.page, perPage: this.state.perPage};
    this.loading = true;
    if(this.props.params.id) {
      // this.showChild();
      this.props.getUserList(pager);
    } else {
      // this.props.getDetailTotal(USER.id);
    }
  }
  componentWillUpdate(nextProps, nextState) {
    // const pager = { page : this.state.page, perPage: this.state.perPage};
    // const id = nextProps.params.id;
    // // 首次加载子代理商
    // if(this.props.list == undefined && nextProps.list == undefined && id) {
    //   this.loading = true;
    //   this.props.getUserList(pager);
    // }
    // // 首次加载父代理商
    // if(this.props.detailTotal == undefined && nextProps.detailTotal == undefined && !id) {
    //   this.loading = true;
    //   this.props.getDetailTotal(USER.id);
    // }
    // 切换父子代理商页面,每次切换成子代理商要重新拉数据
    // console.log(this.params);
    // if(!this.params && nextProps.params.id) {
    //   this.props.getUserList(pager);
    // }

  }
  initializePagination(total) {
    const self = this;
    return {
      total: total,
      showSizeChanger: true,
      size:'small',
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
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
    const { id } = this.props.params;
    if(id){
      if (this.props.list && this.props.list.fetch == true) {
        total = this.props.list.result.data.total;
      }
    }
    return this.initializePagination(total);
  }
  handleInputChange(e) {
    this.setState({
      searchValue: e.target.value,
    });
  }
  handleSearch() {
    const user = this.state.searchValue.replace(/[\r\n\s]/g,"");
    const pager = { page: 1, perPage: this.state.perPage};
    this.setState({ page: 1 });
    this.props.getUserList(pager,user);
  }
  render() {
    const { list, detailTotal, params: {id} } = this.props;
    let dataSource = [];
    const self = this;
    if(id) {
      if(list){
        if(list.fetch == true){
          const data = list.result.data.list;
          dataSource = data.map(function (item, key) {
            item.key = item.id;
            // 子列表不能看到进一步的操作
            item.showAction = false;
            return item;
          })
        }
        self.loading = false;

      }
    } else {
      // if(detailTotal) {
      //   if(detailTotal.fetch == true) {
      //     const data = detailTotal.result.data;
      //     data.key = data.id;
      //     data.showAction = true;
      //     dataSource = [data];
      //   }
      //   self.loading = false;
      // }
    }
    const pagination =id? {'pagination':this.childPagination()}:{'pagination':false}
    pagination.current = this.state.page;
    return (
      <section className="view-user-list">
        <header>
            <Breadcrumb>
              <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item>下级运营商</Breadcrumb.Item>
            </Breadcrumb>
        </header>
          <div className="toolbar">
            <Link to='/user/edit/new' className="ant-btn ant-btn-primary item">
              添加新运营商
            </Link>
            <Input style={{width:160}} placeholder="请输入运营商或者联系人" onChange={this.handleInputChange.bind(this)}/>
            <Button type="primary item" onClick={this.handleSearch.bind(this)}>查询</Button>
          </div>
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
