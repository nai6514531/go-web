import React from 'react';
import './app.less';
import { Table,Input, Breadcrumb, Form, Select, Button } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';


function mapStateToProps(state) {
  const { user: { school, schoolDevice, device, allSchool } } = state;
  return { school, schoolDevice, device, allSchool };
}

function mapDispatchToProps(dispatch) {
  const {
    getUserSchool,
    getUserDevice,
    getAllSchool,
  } = bindActionCreators(UserActions, dispatch);
  return {
    getUserSchool,
    getUserDevice,
    getAllSchool,
  };
}

const columns = [{
  title: '序号',
  dataIndex: 'id',
  key: 'id',
}, {
  title: '学校',
  dataIndex: 'school',
  key: 'school',
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
  render: (text, record) => <Link to={"/user/device/school/" + record.id}>查看模块</Link>,
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
    this.props.getUserSchool(USER.id, schoolId, pager);
    this.props.getAllSchool(USER.id, schoolId);
  }
  componentWillReceiveProps(nextProps) {
    if(this.getSchool == 1 && nextProps.school) {
      this.loading = false;
      this.getSchool = 0;
    }
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
        self.props.getUserSchool(USER.id, schoolId, pager);
        self.getSchool = 1;
      },
      onChange(current) {
        const pager = { page: current, perPage: self.state.perPage};
        self.setState(pager);
        self.loading = true;
        self.props.getUserSchool(USER.id, schoolId, pager);
        self.getSchool = 1;
      },
    }
  }
  changeSchoolId(schoolId) {
    this.setState({schoolId:schoolId})
  }
  render() {
    const self = this;
    const pagination = this.initializePagination();
    pagination.current = this.state.page;
    const school = this.props.school;
    let dataSource = [];
    let list = [];
    if(school){
      if(school.fetch == true){
        list = school.result.data;
        dataSource = list.map(function (item,key) {
          return {
            id: item.id,
            key: item.id,
            school: item.name,
            number: item.deviceTotal,
          }
        });
        self.loading = false;
      }
    }
    return (
      <section className="view-user-list">
        <header>
          <Breadcrumb >
            <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
            <Breadcrumb.Item>设备管理</Breadcrumb.Item>
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
            />
          <Link to="/user/device/school/-1/edit" className="ant-btn ant-btn-primary add-btn">
            添加新设备
          </Link>
        </div>
        <article>
          <Table
            scroll={{ x: 980 }}
            columns={columns}
               dataSource={dataSource}
               pagination={pagination}
               loading={this.loading}
               onChange={this.handleTableChange}
               bordered
          />
        </article>
      </section>
    );
  }
}
class SchoolFilter extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  removeDuplicates(arr) {
    var obj = {};
    var ret_arr = [];
    for (var i = 0; i < arr.length; i++) {
      obj[arr[i]] = true;
    }
    for (var key in obj) {
      ret_arr.push(key);
    }
    return ret_arr;
  }
  removeNull(arr){
    var pattern=new RegExp(/^\s*$/);
    for(var i = 0 ;i<arr.length;i++) {
      if(arr[i] == "" || typeof(arr[i]) == "undefined"
        || pattern.test(arr[i])) {
        arr.splice(i,1);
        i= i-1;
      }
    }
    return arr;
  }
  handleSubmit(e) {
    e.preventDefault();
    const schoolId = parseInt(this.props.form.getFieldsValue().school);
    let serialNumber = this.props.form.getFieldsValue().serialNumber;
    
    // 根据换行切割字符串
    if(serialNumber) {
      const splitted = serialNumber.split("\n");
      // 移除重复,空白,长度不为10,并且内部全为空格的字符串
      const numbers = this.removeNull(this.removeDuplicates(splitted));
      // 拼接成字符串
      serialNumber = numbers.join(",");
    }
    this.props.changeSchoolId(schoolId);
    const pager = {page: this.props.page, perPage: this.props.perPage};
    this.props.getUserSchool(USER.id, schoolId, pager, serialNumber);
    // if(schoolId == -1) {
    //   // 调所有学校的接口
    //   this.props.pagination.onChange(1);
    // }
  }
  render() {
    const allSchool = this.props.allSchool;
    let schoolNode = [];
    if(allSchool && allSchool.fetch == true){
      const firstNode = <Option key='-1' value="-1">所有学校</Option>;
      const schoolList = allSchool.result.data;
      schoolNode[0] = firstNode;
      for(let i = 0; i < schoolList.length; i++) {
        const id = schoolList[i].id.toString();
        const name = schoolList[i].name;
        const item = <Option style={{textOverflow: 'ellipsis'}} key={id} value={id}>{name}</Option>;
        schoolNode.push(item);
      }
    }
    const { getFieldDecorator } = this.props.form;
    const schoolFilter = {
      display: 'inline-block',
    };
    return (
      <div className="school-filter" style={schoolFilter}>
        <Form inline onSubmit={this.handleSubmit}
            className="filter-form"
          >
          <FormItem
            id="select"
            >
            {getFieldDecorator('school', {
              rules: [
                { required: true, message: '请选择学校' },
              ],
              initialValue: "-1",
            })(
              <Select id="school" style={{width:200}} dropdownClassName="test">
                {schoolNode}
              </Select>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('serialNumber', {})(
              <Input type="textarea" placeholder="请输入设备编号" autosize />
            )}
          </FormItem>
          <Button style={{verticalAlign:"baseline",height:32}} type="primary" htmlType="submit">筛选</Button>
        </Form>
      </div>
    );
  }
}
SchoolFilter = Form.create()(SchoolFilter);

SchoolTable.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SchoolTable);
