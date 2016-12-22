import React from 'react';
import './app.less';
import { Table,Input, Breadcrumb, Form, Select, Button } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

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
    const {id} = this.props;
    // this.props.getUserSchool(USER.id, schoolId, pager, serialNumber);
    this.props.getUserSchool(id, schoolId, pager, serialNumber);

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

SchoolFilter.propTypes = {
  handleTableChange: React.PropTypes.func,
};

export default SchoolFilter;
