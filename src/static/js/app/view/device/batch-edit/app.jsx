import React from 'react';
import './app.less';
import { Button, Form, Row, Col, Input, Radio, Select, Cascader, Modal, Breadcrumb, message, Tooltip, Icon, Checkbox,Table} from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const confirm = Modal.confirm;

import AllocateModal from '../list/allocate-modal.jsx';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as RegionActions from '../../../actions/region';
import DeviceService from "../../../service/device";
import { Link } from 'react-router';
import _ from 'lodash';


function mapStateToProps(state) {
  const { device: { list, detail, status, result, refDevice, pulseName, resultPutDetail, resultPostDetail },
    region: {provinceList, provinceSchool} } = state;
  return { list, detail, status, result, refDevice, pulseName,
    resultPutDetail, resultPostDetail, provinceList, provinceSchool };
}

function mapDispatchToProps(dispatch) {
	const {
		getDeviceDetail,
		putDeviceDetail,
		postDeviceDetail,
		patchPulseName,
		getRefDevice,
    getDeviceList,
	} = bindActionCreators(DeviceActions, dispatch);
	const {
		getProvinceList,
		getProvinceSchoolList,
	} = bindActionCreators(RegionActions, dispatch);
	return {
		getDeviceDetail,
		putDeviceDetail,
		postDeviceDetail,
		patchPulseName,
		getRefDevice,
    getDeviceList,
		getProvinceList,
		getProvinceSchoolList,
	};
}
const nameList = ['单脱','快洗','标准洗','大物洗'];

class DeviceForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      provinceId: '',
      schoolId: '',
      refDeviceType: 1,
      unsaved: true,
      tips:'',
      serialNumberHelp:'',
      // 选择需要修改的项目
      changeSchool: false,
      changeAddress: false,
      changePrice: false,
      changeWashName: false,
      // 修改后的值以及是否需要修改
      changeTable: false,
      values: {},
      // 从设备列表页面传来的 serialNumbers
      serialNumbers: '',
      serialNumberSum: 0,
      // 设备分配列表
      visible: false,
      resetCurrent: false,
      //样式标红,默认为空,红色为 red
      className: {
        index: '',
        serialNumber: '',
        schoolName: '',
        address: '',
        firstPulseName: '',
        secondPulseName: '',
        thirdPulseName: '',
        fourthPulseName: '',
        firstPulsePrice: '',
        secondPulsePrice: '',
        thirdPulsePrice: '',
        fourthPulsePrice: '',
      },
      // 修改成功后展示的 modal
      successEditVisible: false,
      // 是否需要重新拉表格数据
      getList: false,
      // 是否直接跳转到设备列表页
      goBackDirect: false,
      firstGoBack: false,
      // 是否是分配出去的设备,默认为自己的设备
      isAssigned:"0",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.showModal = this.showModal.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.checkNumber = this.checkNumber.bind(this);
    this.checkPrice = this.checkPrice.bind(this);
    this.provinceChange = this.provinceChange.bind(this);
    this.editSuccess = this.editSuccess.bind(this);
    this.handleAllocate = this.handleAllocate.bind(this);
    this.EditConfirm = this.EditConfirm.bind(this);
    this.resetColor = this.resetColor.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object
  }
  componentWillMount() {
    // 默认北京市所有学校
    this.props.getProvinceList();
    this.props.getProvinceSchoolList(110000);
    // 将 query 的内容放到 state 里
    const serialNumbers = this.props.location.query.serialNumbers;
    const isAssigned = this.props.location.query.isAssigned;
    this.setState({
      serialNumbers: serialNumbers,
      serialNumberSum: serialNumbers.split(",").length,
      isAssigned: isAssigned,
    });
  }
  componentWillReceiveProps(nextProps) {

	}
  componentDidUpdate(prevProps, prevState) {
    if(!this.state.successEditVisible && prevState.successEditVisible && this.state.firstGoBack) {
      setTimeout(function() { this.context.router.goBack(); }.bind(this), 500);
    }

    if(this.state.visible && prevState.visible && this.state.goBackDirect) {
      setTimeout(function() { this.context.router.goBack(); }.bind(this), 500);
    }
  }
  closeSucEditVisible() {
    this.setState({successEditVisible:false, firstGoBack:true});
    // this.goBack();
  }
  editSuccess() {
    this.setState({successEditVisible:true});
  }
  // 选择需要修改的项目
  onSchoolCheck(e) {
    this.setState({changeSchool: e.target.checked});
    if(!e.target.checked) {
      this.props.form.setFieldsValue({schoolId: 0});
    }
  }
  onAddressCheck(e) {
    this.setState({changeAddress: e.target.checked});
    if(!e.target.checked) {
      this.props.form.setFieldsValue({address: ''});
    }
  }
  onPriceCheck(e) {
    this.setState({changePrice: e.target.checked});
    if(!e.target.checked) {
      this.props.form.setFieldsValue({
        firstPulsePrice: '',
        secondPulsePrice: '',
        thirdPulsePrice: '',
        fourthPulsePrice: ''
      });
    }
  }
  onWashName(e) {
    this.setState({changeWashName: e.target.checked});
    if(!e.target.checked) {
      this.props.form.setFieldsValue({
        firstPulseName: nameList[0],
        secondPulseName: nameList[1],
        thirdPulseName: nameList[2],
        fourthPulseName: nameList[3]
      });
    }
  }
  // 预览
  preview() {
    this.props.form.validateFields((errors, values) => {
      // 检查学校是否有值
      let schoolId = values.schoolId;
      if(schoolId) {
        if(schoolId.key == -1 || schoolId == "undefined") {
          this.schoolIdHelp = {'help':'必选','className':'has-error'};
          return false;
        }
      }
      if (errors) {
        return;
      }
      // 此处需要设置样式
      const className = {
        address: values.address?'red':'',
        schoolName: values.schoolId?'red':'',
        firstPulseName: values.firstPulseName?'red':'',
        secondPulseName: values.secondPulseName?'red':'',
        thirdPulseName: values.thirdPulseName?'red':'',
        fourthPulseName: values.fourthPulseName?'red':'',
        firstPulsePrice: values.firstPulsePrice?'red':'',
        secondPulsePrice: values.secondPulsePrice?'red':'',
        thirdPulsePrice: values.thirdPulsePrice?'red':'',
        fourthPulsePrice: values.fourthPulsePrice?'red':'',
      }
      if(values.firstPulsePrice){
        values.firstPulsePrice = parseInt((+values.firstPulsePrice)*1000/10);
      }
      if(values.secondPulsePrice){
        values.secondPulsePrice = parseInt((+values.secondPulsePrice)*1000/10);
      }
      if(values.thirdPulsePrice){
        values.thirdPulsePrice = parseInt((+values.thirdPulsePrice)*1000/10);
      }
      if(values.fourthPulsePrice){
        values.fourthPulsePrice = parseInt((+values.fourthPulsePrice)*1000/10);
      }
      this.setState({values: values, changeTable: true, className: className});
    });
  }
  resetColor() {
    const className = {
      address: '',
      schoolName: '',
      firstPulseName: '',
      secondPulseName: '',
      thirdPulseName: '',
      fourthPulseName: '',
      firstPulsePrice: '',
      secondPulsePrice: '',
      thirdPulsePrice: '',
      fourthPulsePrice: '',
    }
    this.setState({className:className});
  }
  batchEdit(device) {
    // 批量修改
  var self = this;
  this.setState({
    loading: true,
  });
  DeviceService.batchEdit(device)
    .then((data) => {
      if (data && data.status == '00') {
        // 修改成功后要重新拉数据
        this.setState({getList: true});
        // 如果是用户自己的设备,需要确认是否要批量分配,如果是已经分配出去的设备,需要提示,并且跳转回去
        if(+this.state.isAssigned) {
          message.success(data.msg,3);
          // 直接返回
          setTimeout(function() { this.context.router.goBack(); }.bind(this), 500);
        } else {
          this.editSuccess();
        }
        // 且将标红样式还原
        this.resetColor();
      } else {
        message.info(data.msg,3);
      }
    },(error) =>{
      message.error(error.msg,3);
    })
  }
  hasGetList() {
    this.setState({getList: false})
  }
  hasChangedTable() {
    this.setState({changeTable: false});
  }
  handleSubmit(e) {
		e.preventDefault();
		const self = this;
		this.props.form.validateFields((errors, values) => {
      let schoolId = values.schoolId;
      if(schoolId) {
        if(schoolId.key == -1 || schoolId == "undefined") {
          self.schoolIdHelp = {'help':'必选','className':'has-error'};
          return false;
        }
      }
			if (errors) {
				return;
			}
      if(_.isEmpty(values)) {
        message.info('请勾选需要修改的项目',3);
        return;
      }
      const serialNumber = this.state.serialNumbers;
			const deviceValue = {
				"serialNumber": serialNumber,
        "provinceId": values.provinceId?parseInt(values.provinceId.key):-1,
        "schoolId": schoolId?parseInt(schoolId.key):-1,
				"address": values.address,
        "firstPulsePrice": values.firstPulsePrice?parseInt((+values.firstPulsePrice)*1000/10):-1,
				"secondPulsePrice": values.secondPulsePrice?parseInt((+values.secondPulsePrice)*1000/10):-1,
				"thirdPulsePrice": values.thirdPulsePrice?parseInt((+values.thirdPulsePrice)*1000/10):-1,
				"fourthPulsePrice": values.fourthPulsePrice?parseInt((+values.fourthPulsePrice)*1000/10):-1,
				"firstPulseName": values.firstPulseName ? values.firstPulseName : nameList[0],
				"secondPulseName": values.secondPulseName ? values.secondPulseName : nameList[1],
				"thirdPulseName": values.thirdPulseName ? values.thirdPulseName : nameList[2],
				"fourthPulseName": values.fourthPulseName ? values.fourthPulseName : nameList[3],
			}
      // 再次确认是否修改
      this.EditConfirm(deviceValue);
		});
	}
	// Modal 相关
  showModal() {
		this.setState({ visible: true });
	}
  handleCancel(e) {
    // 完成,直接跳转回去
    this.setState({visible: false,});
    this.goBack();
  }
  resetList() {}
  changeResetCurrent() {
    this.setState({
      resetCurrent: false,
    });
  }
  handleAllocate() {
    // 修改成功后调用,先关掉原来的对话框
    this.setState({successEditVisible:false});
    if(this.state.serialNumberSum > 0) {
      this.setState({
        // 分配完成后,首次打开分配页面,需要重置current
        resetCurrent: true,
      });
      this.showModal();
    } else {
      message.info('请至少选择一个设备',3);
    }
  }
  EditConfirm(deviceValue) {
    const self = this;
    confirm({
      content: '确认要修改吗？',
      onOk() {
        // 确认批量修改设备
        self.batchEdit(deviceValue);
      },
      onCancel() {},
    });
  }
  setGoBackDirect() {
    this.setState({goBackDirect: true});
  }
  checkNumber(rule, value, callback) {
		var pattern=new RegExp(/^\d+$/);
		if(value && !pattern.test(value)){
			callback('只能为数字');
		} else {
			callback();
		}
	}
	checkPrice(rule, value, callback) {
		// 只要大于零的数字
		var pattern=new RegExp(/^(0|[1-9][0-9]*)(\.[0-9]*)?$/g);
		if(value && !pattern.test(value)){
			callback('请输入正确价格');
		} else if(value > 20){
			callback('不超过20元');
		} else {
			callback();
		}
	}
	checkOnePluse(rule,value,callback) {
		this.checkPrice(rule,value,callback);
	}
	checkTwoPluse(rule,value,callback) {
		this.checkPrice(rule,value,callback);
	}
	checkThreePluse(rule,value,callback) {
		this.checkPrice(rule,value,callback);
	}
	checkFourPluse(rule,value,callback) {
		this.checkPrice(rule,value,callback);
	}
	goBack() {
		const self = this;
		if(this.state.unsaved) {
			confirm({
				title: '确认返回设备管理?',
				onOk() {
					self.context.router.goBack();
				},
			});
		}
	}
  provinceChange(event) {
    this.props.getProvinceSchoolList(event.key);
    const { setFieldsValue } = this.props.form;
    setFieldsValue({'schoolId':{label:'请选择学校',key:'-1'}});
  }
  schoolChange(event) {
    this.schoolIdHelp = {};
  }
	render() {
    // 省份列表
    let ProvinceNode = [];
    if(this.props.provinceList && this.props.provinceList.fetch == true){
      ProvinceNode = this.props.provinceList.result.data.filter(function(item, key){
        return item.id !== 820000 && item.id !== 810000 && item.id !== 710000;
      }).map(function (item, key) {
        return <Option key={key} value={item.id.toString()}>{item.name}</Option>
      })
    }
    // 学校列表
    let schoolNode = [];
    if(this.props.provinceSchool && this.props.provinceSchool.fetch == true){
      const firstNode = <Option key="-1" value="-1">请选择学校</Option>;
      schoolNode.push(firstNode);
      const list = this.props.provinceSchool.result.data;
      for(let i = 0;i<list.length; i++) {
        const item = <Option key={i+1} value={list[i].id.toString()}>{list[i].name}</Option>;
        schoolNode.push(item);
      }
      const lastItem = <Option key="0" value="0">其它</Option>;
      schoolNode.push(lastItem);
    }
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
		};

    if(!this.cityIdHelp){
      this.cityIdHelp = {};
    }
		const serialNumberSum = this.state.serialNumberSum;
    return (
			<section className="view-device-list" >
				<header>
					<Breadcrumb>
            <Breadcrumb.Item><Link to="/device">设备管理</Link></Breadcrumb.Item>
						<Breadcrumb.Item>批量修改</Breadcrumb.Item>
					</Breadcrumb>
				</header>
        <div className="select-view">
          <p>你将对<span style={{color:'red'}}>{serialNumberSum}</span>个设备进行修改,请选择需要修改的项目:</p>
          <Checkbox onChange={this.onSchoolCheck.bind(this)}>学校</Checkbox>
          <Checkbox onChange={this.onAddressCheck.bind(this)}>楼层信息</Checkbox>
          <Checkbox onChange={this.onPriceCheck.bind(this)}>洗衣价格</Checkbox>
          <Checkbox onChange={this.onWashName.bind(this)}>洗衣服务名称</Checkbox>
        </div>
				<section className="view-content">
          <h3>修改</h3>
					<Form horizontal>
            {this.state.changeSchool?
            <Row>
              <Col span={4} offset={1}>
                <span>省份&学校：</span>
              </Col>
              <Col span={4}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('provinceId', {
                    rules: [
                      { required: true, message: '必选', type:'object' },
                    ],
                  })(
                    <Select
                      labelInValue
                      showSearch
                      optionFilterProp="children"
                      placeholder="请选择省份"
                      notFoundContent="搜索无结果"
                      onChange={this.provinceChange.bind(this)}>
                      {ProvinceNode}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem {...formItemLayout} {...this.schoolIdHelp}>
                  {getFieldDecorator('schoolId', {
                    rules: [
                      { required: true, message: '必选', type:'object' },
                    ],
                  })(
                    <Select
                      labelInValue
                      showSearch
                      optionFilterProp="children"
                      placeholder="请选择学校"
                      notFoundContent="搜索无结果"
                      onChange={this.schoolChange.bind(this)}>
                      {schoolNode}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>:""}
            {this.state.changeAddress?
            <Row>
              <Col span={4} offset={1}>
                <span>
                  楼道信息：
                </span>
              </Col>
              <Col span={9}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('address', {
                    rules: [
                      { required: true, message: '必填' },
                      { max:30, message: '不超过三十个字' },
                    ],
                  })(
                    <Input placeholder="请输入楼道信息" />
                  )}
                </FormItem>
              </Col>
            </Row> :""}
            {this.state.changePrice?
            <Row>
              <Col span={4} offset={1}>
                <span>洗衣价格（无服务填0）：</span>
              </Col>
              <Col span={4}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('firstPulsePrice', {
                    rules: [
                      { required: true, message: '必填' },
                      { validator: this.checkOnePluse.bind(this) },
                    ],
                  })(
                    <Input placeholder="单脱（元）" />
                  )}
                </FormItem>
              </Col>
              <Col span={4} >
						    <FormItem {...formItemLayout} >
                  {getFieldDecorator('secondPulsePrice', {
                    rules: [
                      { required: true, message: '必填' },
                      { validator: this.checkTwoPluse.bind(this) },
                    ],
                  })(
                    <Input placeholder="快洗（元）"/>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('thirdPulsePrice', {
                    rules: [
                      {  required: true, message: '必填'},
                      { validator: this.checkThreePluse.bind(this) },
                    ],
                  })(
                    <Input placeholder="标准洗（元）"/>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem {...formItemLayout}>
                  {getFieldDecorator('fourthPulsePrice', {
                    rules: [
                      {  required: true, message: '必填'},
                      { validator: this.checkFourPluse.bind(this) },
                    ],
                  })(
                    <Input placeholder="大物洗（元）"/>
                  )}
                </FormItem>
              </Col>
            </Row>:""}
            {this.state.changeWashName?
            <Row>
              <Col span={4} offset={1}>
                <span>洗衣服务名称：</span>
              </Col>
              <Col span={4}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('firstPulseName', {
                    rules: [
                      { required: true, message: '必填' },
                    ],
                    initialValue: nameList[0],
                  })(
                    <Input placeholder="对应单脱" />
                  )}
                </FormItem>
              </Col>
              <Col span={4} >
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('secondPulseName', {
                    rules: [
                      { required: true, message: '必填' },
                    ],
                    initialValue: nameList[1],
                  })(
                    <Input placeholder="对应快洗"/>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('thirdPulseName', {
                    rules: [
                      {  required: true, message: '必填'},
                    ],
                    initialValue: nameList[2],
                  })(
                    <Input placeholder="对应标准洗"/>
                  )}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem {...formItemLayout}>
                  {getFieldDecorator('fourthPulseName', {
                    rules: [
                      {  required: true, message: '必填'},
                    ],
                    initialValue: nameList[3],
                  })(
                    <Input placeholder="对应大物洗"/>
                  )}
                </FormItem>
              </Col>
            </Row>:""}
            <Row>
              <Col span={10} offset={1}>
                <FormItem wrapperCol={{ span: 12}}>
                  <Button className="button" type="ghost" onClick={this.preview.bind(this)}>预览</Button>
                  <Button className="button" type="primary" onClick={this.handleSubmit}>确认修改</Button>
                </FormItem>
              </Col>
            </Row>
					</Form>
          <DeviceTable
            getDeviceList={this.props.getDeviceList}
            list={this.props.list}
            values={this.state.values}
            changeTable={this.state.changeTable}
            hasChangedTable={this.hasChangedTable.bind(this)}
            serialNumbers={this.state.serialNumbers}
            className={this.state.className}
            getList={this.state.getList}
            hasGetList={this.hasGetList.bind(this)}
            isAssigned={this.state.isAssigned}
          />
          <AllocateModal
            visible={this.state.visible}
            selectedRowKeys={this.state.serialNumbers.split(",")}
            showModal={this.showModal.bind(this)}
            handleCancel={this.handleCancel.bind(this)}
            resetList={this.resetList.bind(this)}
            resetCurrent={this.state.resetCurrent}
            changeResetCurrent={this.changeResetCurrent.bind(this)}
            goBack={this.goBack.bind(this)}
            goBackDirect={true}
            setGoBackDirect={this.setGoBackDirect.bind(this)}
          />
          <Modal visible={this.state.successEditVisible}
                 onOk={this.handleAllocate.bind(this)}
                 onCancel={this.closeSucEditVisible.bind(this)}
                 okText="是"
                 cancelText="否,返回设备列表"
          >
            <h2 style={{textAlign: 'center'}}><Icon type="check-circle" style={{color:'green'}}/> 修改成功!</h2>
            <p style={{textAlign: 'center'}}>是否要将这{serialNumberSum}个设备分配给他人？</p>
          </Modal>
        </section>
			</section>
    );
  }
}

DeviceForm = createForm()(DeviceForm);

DeviceForm.propTypes = {
  title: React.PropTypes.string,
};

class DeviceTable extends React.Component {
  constructor(props) {
    super(props);
    this.getTableList = this.getTableList.bind(this);
    this.state = {
      loading: false,
      columns: [{
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 30,
        render(text, record, index) {
          return <span className="">{text}</span>
        },
      },{
        title: '设备编号',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width:100,
        render(text, record, index) {
          return <span className="">{text}</span>
        },
      }, {
        title: '学校',
        dataIndex: 'schoolName',
        key: 'schoolName',
        width:55,
        render(text, record, index) {
          return <span className={record.className.schoolName}>{text}</span>
        },
      },{
        title: '楼层',
        dataIndex: 'address',
        key: 'address',
        width:55,
        render(text, record, index) {
          return <span className={record.className.address}>{text}</span>
        },
      }, {
        title: '服务名称1',
        dataIndex: 'firstPulseName',
        key: 'firstPulseName',
        width:50,
        render(text, record, index) {
          return <span className={record.className.firstPulseName}>{text}</span>
        },
      },
        {
          title: '价格',
          dataIndex: 'firstPulsePrice',
          key: 'firstPulsePrice',
          width:50,
          render(text, record, index) {
            return <span className={record.className.firstPulsePrice}>{Math.round(text*100)/100}元</span>
          },
        },{
          title: '服务名称2',
          dataIndex: 'secondPulseName',
          key: 'secondPulseName',
          width:50,
          render(text, record, index) {
            return <span className={record.className.secondPulseName}>{text}</span>
          },
        }, {
          title: '价格',
          dataIndex: 'secondPulsePrice',
          key: 'secondPulsePrice',
          width:50,
          render(text, record, index) {
            return <span className={record.className.secondPulsePrice}>{Math.round(text*100)/100}元</span>
          },
        },{
          title: '服务名称3',
          dataIndex: 'thirdPulseName',
          key: 'thirdPulseName',
          width:50,
          render(text, record, index) {
            return <span className={record.className.thirdPulseName}>{text}</span>
          },
        },
        {
          title: '价格',
          dataIndex: 'thirdPulsePrice',
          key: 'thirdPulsePrice',
          width:50,
          render(text, record, index) {
            return <span className={record.className.thirdPulsePrice}>{Math.round(text*100)/100}元</span>
          },
        },{
          title: '服务名称4',
          dataIndex: 'fourthPulseName',
          key: 'fourthPulseName',
          width:50,
          render(text, record, index) {
            return <span className={record.className.fourthPulseName}>{text}</span>
          },
      }, {
          title: '价格',
          dataIndex: 'fourthPulsePrice',
          key: 'fourthPulsePrice',
          width:50,
          render(text, record, index) {
            return <span className={record.className.fourthPulsePrice}>{Math.round(text*100)/100}元</span>
          },
        }],
      // 预览数据,以原始数据为基础产生不同变化
      dataSource: [],
      // 原始数据,需要一直保留
      baseDataSource: [],
    }
  }
  componentWillMount() {
    this.getTableList();
  }
  rowClassName(record, index) {
    return this.rowColor[record.key];
  }
  getTableList(){
    const serialNumbers = this.props.serialNumbers;
    const pager = {page:0,perPage:0,serialNumber:serialNumbers,isEqual:1,isAssigned:this.props.isAssigned};
    this.list(pager);
  }
  componentWillReceiveProps(nextProps) {
    // 检查是否需要重新渲染 table
    if(!this.props.changeTable && nextProps.changeTable) {
      this.setState({loading: true});
      this.changeDataSource(nextProps.values,nextProps.className);
    }
    if(!this.props.getList && nextProps.getList) {
      // 重新拉数据
      this.getTableList();
    }
  }
  list(pager) {
    var self = this;
    this.setState({
      loading: true,
    });
    DeviceService.list(pager)
      .then((data) => {
        self.setState({
          loading: false,
        });
        if (data && data.status == '00') {
          const total = data.data.length;
          let rowColor = {};
          this.setState({
            total: total,
            baseDataSource: data.data.map((item, key) => {
              item.index = key + 1;
              item.key = item.serialNumber;
              item.className = this.props.className;
              item.firstPulsePrice = (+item.firstPulsePrice)/100;
              item.secondPulsePrice = (+item.secondPulsePrice)/100;
              item.thirdPulsePrice = (+item.thirdPulsePrice)/100;
              item.fourthPulsePrice = (+item.fourthPulsePrice)/100;
              rowColor[item.key] = key%2==0?'white':'gray';
              self.rowColor = rowColor;
              return item;
            })
          });
          // 重置父组件拉数据的请求
          this.props.hasGetList();
        } else {
          message.info(data.msg);
        }
      })
  }
  changeDataSource(values,className) {
    const baseDataSource = this.state.baseDataSource;
    let newDataSource = [];
    let rowColor = {};
    for(let i = 0;i < baseDataSource.length;i++) {
      const item = baseDataSource[i];
      newDataSource[i] = {
        index: item.index,
        key: item.serialNumber,
        serialNumber: item.serialNumber,
        schoolName: values.schoolId?values.schoolId.label:item.schoolName,
        address: values.address?values.address:item.address,
        firstPulseName: values.firstPulseName?values.firstPulseName:item.firstPulseName,
        secondPulseName: values.secondPulseName?values.secondPulseName:item.secondPulseName,
        thirdPulseName: values.thirdPulseName?values.thirdPulseName:item.thirdPulseName,
        fourthPulseName: values.fourthPulseName?values.fourthPulseName:item.fourthPulseName,
        firstPulsePrice: values.firstPulsePrice!==undefined?values.firstPulsePrice/100:item.firstPulsePrice,
        secondPulsePrice: values.secondPulsePrice!==undefined?values.secondPulsePrice/100:item.secondPulsePrice,
        thirdPulsePrice: values.thirdPulsePrice!==undefined?values.thirdPulsePrice/100:item.thirdPulsePrice,
        fourthPulsePrice: values.fourthPulsePrice!==undefined?values.fourthPulsePrice/100:item.fourthPulsePrice,
        className: className,
      }
      rowColor[item.serialNumber] = i%2==0?'white':'gray';
    }
    this.rowColor = rowColor;
    this.setState({dataSource: newDataSource});
    this.props.hasChangedTable();
    setTimeout(function() { this.setState({loading: false}); }.bind(this), 100);
  }
  render() {
    return (
      <div>
        <Table
          scroll={{ x: 700, y: 300 }}
          dataSource={this.state.dataSource.length==0?this.state.baseDataSource:this.state.dataSource}
          columns={this.state.columns}
          pagination={false}
          bordered
          loading={this.state.loading}
          rowClassName={this.rowClassName.bind(this)}
        />
      </div>
    );
  }

}


export default connect(mapStateToProps, mapDispatchToProps)(DeviceForm);
