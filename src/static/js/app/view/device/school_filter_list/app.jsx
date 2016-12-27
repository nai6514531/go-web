import React from 'react';
import './app.less';
import { Table,Input, Breadcrumb, Form, Select, Button } from 'antd';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';
import SchoolFilter from './school_filter.jsx'

function mapStateToProps(state) {
  const { user: { school, schoolDevice, device, allSchool, detail } } = state;
  return { school, schoolDevice, device, allSchool, detail };
}

function mapDispatchToProps(dispatch) {
  const {
    getUserSchool,
    getAllSchool,
    getUserDetail
  } = bindActionCreators(UserActions, dispatch);
  return {
    getUserSchool,
    getAllSchool,
    getUserDetail
  };
}

const columns = [{
  title: '序号',
  dataIndex: 'id',
  key: 'id',
  width:50,
}, {
  title: '学校',
  dataIndex: 'school',
  key: 'school',
  width:120,
}, {
  title: '模块数量',
  dataIndex: 'number',
  key: 'number',
  width:60,
}, {
  title: '操作',
  dataIndex: 'action',
  key: 'action',
  width: 80,
  //此处路由要换掉,不能用原来的,需要传 userid 和 schoolid
  //   /device/list
  render: (text, record) => <Link to={"/device/list?userId="+record.userId+"&schoolId=" + record.id}>查看模块</Link>,
}];


class SchoolTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pagination: {},
      pager: {},
      page: 1,
      perPage: 10,
      schoolList: [],
      schoolId:'',
    };
  }
  componentWillMount() {
    const pager = {page: this.state.page, perPage: this.state.perPage};
    const schoolId = -1;
    this.loading = true;
    // this.props.getUserSchool(USER.id, schoolId, pager);
    // this.props.getAllSchool(USER.id, schoolId);
    const { id } = this.props.params;
    this.props.getUserSchool(id, schoolId, pager);
    this.props.getAllSchool(id, schoolId);
    this.props.getUserDetail(id);
  }
  componentWillReceiveProps(nextProps) {
    if(this.getSchool == 1 && nextProps.school) {
      this.loading = false;
      this.getSchool = 0;
    }
  }
  rowClassName(record, index) {
    return this.rowColor[record.key];
  }
  initializePagination() {
    let total = 1;
    if (this.props.school && this.props.school.fetch == true) {
      total = this.props.school.result.data.length;
    }
    const self = this;
    let schoolId = -1;
    if(this.state.schoolId) {
      schoolId = this.state.schoolId;
    }
    const {id} = this.props.params;
    return {
      total: total,
      showSizeChanger: true,
      defaultCurrent: 1,
      size:'small',
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pager = { page : current, perPage: pageSize};
        self.setState(pager);
        self.loading = true;
        // self.props.getUserSchool(USER.id, schoolId, pager);
        self.props.getUserSchool(id, schoolId, pager);
        self.getSchool = 1;
      },
      onChange(current) {
        const pager = { page: current, perPage: self.state.perPage};
        self.setState(pager);
        self.loading = true;
        // self.props.getUserSchool(USER.id, schoolId, pager);
        self.props.getUserSchool(id, schoolId, pager);
        self.getSchool = 1;
      },
    }
  }
  changeSchoolId(schoolId) {
    this.setState({schoolId:schoolId})
  }
  render() {
    /* 当前设备管理所属用户,暂时保留
       let userName = '';
       if(this.props.detail && this.props.detail.fetch == true) {
         userName = this.props.detail.result.data.name;
       }*/
    const self = this;
    const { id } = this.props.params;
    const pagination = this.initializePagination();
    pagination.current = this.state.page;
    const school = this.props.school;
    let dataSource = [];
    let list = [];
    if(school){
      if(school.fetch == true){
        list = school.result.data;
        let rowColor = {};
        dataSource = list.map(function (item,key) {
          rowColor[item.id] = key%2==0?'white':'gray';
          self.rowColor = rowColor;
          return {
            id: item.id,
            key: item.id,
            userId: id,
            school: item.name,
            number: item.deviceTotal,
          }
        });
        self.loading = false;
      }
    }
    // <Link to={"/user/"+id+"/device/school/-1/edit"} className="ant-btn ant-btn-primary add-btn">
    //   添加新设备
    // </Link>
    return (
      <section className="view-user-list">
        <header>
            <Breadcrumb >
              <Breadcrumb.Item><Link to="/user">设备管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item>按学校分类</Breadcrumb.Item>
            </Breadcrumb>
        </header>
        <div className="toolbar">
          <SchoolFilter
            allSchool={this.props.allSchool}
            getUserSchool={this.props.getUserSchool}
            page={this.state.page}
            perPage={this.state.perPage}
            pagination={pagination}
            changeSchoolId={this.changeSchoolId.bind(this)}
            id={id}
            />
        </div>
        <article>
          <Table
            scroll={{ x:350 }}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            loading={this.loading}
            onChange={this.handleTableChange}
            bordered
            rowClassName={this.rowClassName.bind(this)}

          />
        </article>
      </section>
    );
  }
}

SchoolTable.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SchoolTable);
