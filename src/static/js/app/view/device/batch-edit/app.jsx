import React from 'react';
import './app.less';
import { Button, Form, Row, Col, Input, Radio, Select, Cascader, Modal, Breadcrumb, message, Tooltip, Icon, Checkbox,Table } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const confirm = Modal.confirm;

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as DeviceActions from '../../../actions/device';
import * as RegionActions from '../../../actions/region';
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
const key = ['first','second','third','fourth'];
const nameList = ['单脱','快洗','标准洗','大物洗'];

class DeviceForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      provinceId: '',
      schoolId: '',
      refDeviceType: 1,
      addNew: false,
      currentPulse: 1,
      firstPulseName: '',
      secondPulseName: '',
      thirdPulseName: '',
      fourthPulseName: '',
      visible: false,
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

    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.changePulseName = this.changePulseName.bind(this);
    this.checkNumber = this.checkNumber.bind(this);
    this.checkPrice = this.checkPrice.bind(this);
    this.provinceChange = this.provinceChange.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object
  }
  componentWillMount() {
    const deviceId = this.props.params.id;
    if(deviceId) {
      this.props.getDeviceDetail(deviceId);
    } else {
      this.setState({addNew: true});
    }
    this.props.getRefDevice();
    // 默认北京市所有学校
    this.props.getProvinceList();
    this.props.getProvinceSchoolList(110000);
  }
  componentWillReceiveProps(nextProps) {
    const self = this;
    const pulseName = nextProps.pulseName;
    if(this.theName == 1 && this.state.addNew == false){
      if(pulseName && pulseName.fetch == true) {
        message.success('服务名修改成功',3);
        const pulseNameKey = key[this.state.currentPulse-1] + 'PulseName';
        this[pulseNameKey] = self.pulseName;
      } else if (pulseName && pulseName.fetch == false) {
        message.error('服务名修改失败,请重试.',3);
      }
      self.theName = 0;
    }
    // 修改详情时 设置初始省市 ID
    const deviceId = this.props.params.id;
    if(deviceId) {
      if(this.props.provinceList !== nextProps.provinceList) {
        if(nextProps.detail) {
          if(nextProps.provinceList.fetch == true) {
            const provinceId = nextProps.detail.result.data.provinceId;
            if(provinceId!==0){
              this.props.getProvinceSchoolList(provinceId);
            } else {
              // message.error('无省份信息',3);
            }
          } else if(nextProps.provinceList.fetch == false) {
            message.error('获取省份列表失败,请重试',3);
          }
        }
      }
      if(self.saveDetail == 1){
        const resultPutDetail = this.props.resultPutDetail;
        if(resultPutDetail !== nextProps.resultPutDetail) {
          if(nextProps.resultPutDetail.fetch == true) {
            message.success('修改设备成功',3);
            self.context.router.goBack();
          } else {
            message.error(nextProps.resultPutDetail.result.msg,3);
          }
          self.saveDetail = -1;
        }
      }
    }

		if(this.props.detail !== nextProps.detail && nextProps.detail.fetch == true){
			const device = nextProps.detail.result.data;
			self.firstPulseName = device.firstPulseName;
			self.secondPulseName = device.secondPulseName;
			self.thirdPulseName = device.thirdPulseName;
			self.fourthPulseName = device.fourthPulseName;
		}
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
        firstPulseName: nameList[0],
        secondPulseName: nameList[1],
        thirdPulseName: nameList[2],
        fourthPulseName: nameList[3]
      });
    }
  }
  onWashName(e) {
    this.setState({changeWashName: e.target.checked});
    if(!e.target.checked) {
      this.props.form.setFieldsValue({
        firstPulsePrice: '',
        secondPulsePrice: '',
        thirdPulsePrice: '',
        fourthPulsePrice: ''
      });
    }
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
        || pattern.test(arr[i]) || arr[i].length !== 10) {
        arr.splice(i,1);
        i= i-1;
      }
    }
    return arr;
  }
  preview() {
    this.props.form.validateFields((errors, values) => {
      console.log(values);
      if (errors) {
        return;
      }
      this.setState({values: values, changeTable: true});
    });
  }
  hasChangedTable() {
    this.setState({changeTable: false});
  }
  handleSubmit(e) {
		e.preventDefault();
		const self = this;
		this.props.form.validateFields((errors, values) => {
      console.log('values',values);
      let schoolId = values.schoolId;
      if(schoolId == -1 || !schoolId || schoolId=="请选择学校") {
        schoolId = 0;
        self.schoolIdHelp = {'help':'必选','className':'has-error'};
        return false;
      }
      let provinceId = values.provinceId;
      if(!provinceId || provinceId=="请选择省份" ) {
        provinceId = 0;
      }
			if (errors) {
				return;
			}
      // 根据换行切割字符串
      // const splitted = values.serialNumber.split("\n");
      // // 移除重复,空白,长度不为10,并且内部全为空格的字符串
      // const numbers = self.removeNull(self.removeDuplicates(splitted));
      // // 拼接成字符串
      // const serialNumber = numbers.join(",");

			// const deviceValue = {
			// 	"serialNumber": serialNumber,
        // "provinceId": parseInt(provinceId),
        // "schoolId": parseInt(schoolId),
			// 	// 'label': values.label,
			// 	"address": values.address,
			// 	"referenceDeviceId": values.referenceDevice,
        // // 乘 1000 在除以 10 是为了解决19.99出现的精度问题
        // "firstPulsePrice": parseInt((+values.firstPulsePrice)*1000/10),
			// 	"secondPulsePrice": parseInt((+values.secondPulsePrice)*1000/10),
			// 	"thirdPulsePrice": parseInt((+values.thirdPulsePrice)*1000/10),
			// 	"fourthPulsePrice": parseInt((+values.fourthPulsePrice)*1000/10),
			// 	"firstPulseName": self.firstPulseName ? self.firstPulseName : "",
			// 	"secondPulseName": self.secondPulseName ? self.secondPulseName : "",
			// 	"thirdPulseName": self.thirdPulseName ? self.thirdPulseName : "",
			// 	"fourthPulseName": self.fourthPulseName ? self.fourthPulseName : "",
			// }
			// const deviceId = this.props.params.id;
			// // 新增设备
			// if(deviceId) {
			// 	this.props.putDeviceDetail(deviceId,deviceValue);
			// } else {
			// 	this.props.postDeviceDetail(deviceValue);
			// }
			// self.saveDetail = 1;
		});
	}
	handleSelect(provinceId, schoolId) {
		this.provinceId = provinceId;
		this.schoolId = schoolId;
		this.setState({tips:''});
	}
	changeName(currentPulse,e) {
		e.preventDefault();
		this.setState({
			currentPulse: currentPulse,
		});
		this.showModal();
	}
	changePulseName(pulseName) {
		const deviceId = this.props.params.id;
		// 被修改脉冲的 key
		const pulseNameKey = key[this.state.currentPulse-1] + 'PulseName';
		const thePulseName = {};
		// 被修改的脉冲 key-value
		thePulseName[pulseNameKey] = pulseName;
		const addNew = this.state.addNew;
		this.pulseName = pulseName;
		if(addNew) {
			this[pulseNameKey] = pulseName;
		} else {
			const device = { deviceId: deviceId };
			let data = Object.assign({}, device, thePulseName);
      // 当不是新增设备时,则直接发请求修改服务名
			this.props.patchPulseName(deviceId, data);
      this.theName = 1;
    }
	}
	showModal() {
		this.setState({ visible: true });
	}
	hideModal() {
		this.setState({ visible: false });
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
	// 待优化
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
				title: '确定取消?',
				onOk() {
					self.context.router.goBack();
				},
			});
		}
	}
  provinceChange(event) {
    this.props.getProvinceSchoolList(event);
    const { setFieldsValue } = this.props.form;
    setFieldsValue({'schoolId':'-1'});
  }
  schoolChange(event) {
    this.schoolIdHelp = {};
  }
	render() {
    const query = this.props.location.query;
    // console.log(query);
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
		// 关联设备列表
		const refDevice = this.props.refDevice;
		let refDeviceNode = [];
		if(refDevice) {
			if(refDevice.fetch == true){
				refDeviceNode = refDevice.result.data.map(function (item, key) {
					return (
						<Radio key={key} value={item.id}>{item.name}</Radio>
					)
				})
			}
		}
		// 初始化参数
		const self = this;
		const detail = this.props.detail;
		const { id } = this.props.params;
		let initialValue = {};
		if(detail && id) {
			if(detail.fetch == true){
				const device = detail.result.data;
				initialValue = {
					'serialNumber': device.serialNumber,
					'schoolId': device.schoolId.toString(),
					'provinceId': device.provinceId.toString(),
					// 'label': device.label,
					'address': device.address,
					'referenceDevice': device.referenceDeviceId,
					'firstPulsePrice': (device.firstPulsePrice/100).toString(),
					'secondPulsePrice': (device.secondPulsePrice/100).toString(),
					'thirdPulsePrice': (device.thirdPulsePrice/100).toString(),
					'fourthPulsePrice': (device.fourthPulsePrice/100).toString(),
					'firstPulseName': device.firstPulseName,
					'secondPulseName': device.secondPulseName,
					'thirdPulseName': device.thirdPulseName,
					'fourthPulseName': device.fourthPulseName,

				}
			}
		}
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
		};

    if(!this.cityIdHelp){
      this.cityIdHelp = {};
    }
		const serialNumberHelp = this.state.serialNumberHelp?{'help':this.state.serialNumberHelp,'className':'has-error'}:{};
		return (
			<section className="view-device-list" >
				<header>
					<Breadcrumb>
            <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/device">设备管理</Link></Breadcrumb.Item>
						<Breadcrumb.Item>批量修改</Breadcrumb.Item>
					</Breadcrumb>
				</header>
        <div>
          <p>你将对XX个设备进行修改,请选择需要修改的项目:</p>
          <Checkbox onChange={this.onSchoolCheck.bind(this)}>学校</Checkbox>
          <Checkbox onChange={this.onAddressCheck.bind(this)}>楼层信息</Checkbox>
          <Checkbox onChange={this.onPriceCheck.bind(this)}>洗衣价格</Checkbox>
          <Checkbox onChange={this.onWashName.bind(this)}>洗衣服务名称</Checkbox>
        </div>
				<section className="view-content">
          <h1>修改</h1>
					<Form horizontal>
            {1==2?
						<FormItem
							{...formItemLayout}
							{...serialNumberHelp}
              label={(
                <span>
                  设备编号
                </span>
              )}
						>
							{getFieldDecorator('serialNumber', {
								rules: [
									{ required: true, message: '必填' },
								],
								initialValue: initialValue.serialNumber,
							})( id ?
								<Input disabled placeholder="请输入10位设备编号" />
								:
                <div>
                  <Input type="textarea" placeholder="请输入一个或者多个10位设备编号，以回车分隔，每行一个编号" autosize={{ minRows: 2, maxRows: 6 }} />
                  <span>可直接复制 excel 表中设备编号列的数据来批量添加设备</span>
                </div>
              )}
						</FormItem>
              :""}
            {this.state.changeSchool?
            <Row>
              <Col span={4}>
                <span>省份&学校：</span>
              </Col>
              <Col span={5}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('provinceId', {
                    rules: [
                      { required: true, message: '必选' },
                    ],
                    initialValue: +initialValue.provinceId !== 0?initialValue.provinceId:'请选择省份',
                    // initialValue: initialValue.provinceId == "0"?'':initialValue.provinceId,
                  })(
                    <Select
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
              <Col span={5}>
                <FormItem {...formItemLayout} {...this.schoolIdHelp}>
                  {getFieldDecorator('schoolId', {
                    rules: [
                      { required: true, message: '必选' },
                    ],
                    initialValue: +initialValue.schoolId !==0?initialValue.schoolId:'请选择学校',
                    // initialValue: initialValue.schoolId,
                  })(
                    <Select
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
              <Col span={4}>
                <span>
                  楼道信息：
                </span>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('address', {
                    rules: [
                      { required: true, message: '必填' },
                      { max:30, message: '不超过三十个字' },
                    ],
                    initialValue: initialValue.address,
                  })(
                    <Input placeholder="请输入楼道信息" />
                  )}
                </FormItem>
              </Col>
            </Row> :""}
            {this.state.changePrice?
            <Row>
              <Col span={4}>
                <span>洗衣价格（无服务填0）：</span>
              </Col>
              <Col span={5}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('firstPulsePrice', {
                    rules: [
                      { required: true, message: '必填' },
                      { validator: this.checkOnePluse.bind(this) },
                    ],
                    initialValue: initialValue.firstPulsePrice,
                  })(
                    <Input placeholder="单脱（元）" />
                  )}
                </FormItem>
              </Col>
              <Col span={5} >
						    <FormItem {...formItemLayout} >
                  {getFieldDecorator('secondPulsePrice', {
                    rules: [
                      { required: true, message: '必填' },
                      { validator: this.checkTwoPluse.bind(this) },
                    ],
                    initialValue: initialValue.secondPulsePrice,
                  })(
                    <Input placeholder="快洗（元）"/>
                  )}
                </FormItem>
              </Col>
              <Col span={5}>
                <FormItem {...formItemLayout} >
                  {getFieldDecorator('thirdPulsePrice', {
                    rules: [
                      {  required: true, message: '必填'},
                      { validator: this.checkThreePluse.bind(this) },
                    ],
                    initialValue: initialValue.thirdPulsePrice,
                  })(
                    <Input placeholder="标准洗（元）"/>
                  )}
                </FormItem>
              </Col>
              <Col span={5}>
                <FormItem {...formItemLayout}>
                  {getFieldDecorator('fourthPulsePrice', {
                    rules: [
                      {  required: true, message: '必填'},
                      { validator: this.checkFourPluse.bind(this) },
                    ],
                    initialValue: initialValue.fourthPulsePrice,
                  })(
                    <Input placeholder="大物洗（元）"/>
                  )}
                </FormItem>
              </Col>
            </Row>:""}
            {this.state.changeWashName?
            <Row>
              <Col span={4}>
                <span>洗衣服务名称：</span>
              </Col>
              <Col span={5}>
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
              <Col span={5} >
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
              <Col span={5}>
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
              <Col span={5}>
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
              <Col span={10}>
                <FormItem wrapperCol={{ span: 12, offset: 7 }}>
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
          />
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
    this.state = {
      loading: false,
      columns: [{
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 10,
      },{
        title: '设备编号',
        dataIndex: 'serialNumber',
        key: 'serialNumber',
        width:100,
      }, {
        title: '学校',
        dataIndex: 'school',
        key: 'school',
        width:55,
      },{
        title: '楼层',
        dataIndex: 'address',
        key: 'address',
        width:55,
      }, {
        title: '服务名称1',
        dataIndex: 'firstPulseName',
        key: 'firstPulseName',
        width:50,
      },
        {
          title: '价格',
          dataIndex: 'firstPulsePrice',
          key: 'firstPulsePrice',
          width:50,
          render: (firstPulsePrice) => {
            return Math.round(firstPulsePrice*100)/10000 + "元";
          }
        },{
        title: '服务名称2',
        dataIndex: 'secondPulseName',
        key: 'secondPulseName',
        width:50,
      }, {
          title: '价格',
          dataIndex: 'secondPulsePrice',
          key: 'secondPulsePrice',
          width:50,
          render: (secondPulsePrice) => {
            return Math.round(secondPulsePrice*100)/10000 + "元";
          }
        },{
        title: '服务名称3',
        dataIndex: 'thirdPulseName',
        key: 'thirdPulseName',
        width:50,
      },
        {
          title: '价格',
          dataIndex: 'thirdPulsePrice',
          key: 'thirdPulsePrice',
          width:50,
          render: (thirdPulsePrice) => {
            return Math.round(thirdPulsePrice*100)/10000 + "元"
          }
        },{
        title: '服务名称4',
        dataIndex: 'fourthPulseName',
        key: 'fourthPulseName',
        width:50,
      }, {
          title: '价格',
          dataIndex: 'fourthPulsePrice',
          key: 'fourthPulsePrice',
          width:50,
          render: (fourthPulsePrice) => {
            return Math.round(fourthPulsePrice*100)/10000 + "元"
          }
        }],
      dataSource: [],
      baseDataSource: [],
    }
  }
  componentWillMount() {
    this.props.getDeviceList({page:1,perPage:10});
  }
  componentWillReceiveProps(nextProps) {
    // 换了接口以后,这边就不再需要了,直接在回调里设置 baseDataSource
    if(!this.props.list && nextProps.list) {
      const baseDataSource = this.baseDataSource(nextProps.list);
      console.log('baseDataSource',baseDataSource);
      this.setState({baseDataSource: baseDataSource});
    }
    // 检查是否需要重新渲染 table
    if(!this.props.changeTable && nextProps.changeTable) {
      this.changeDataSource(nextProps.values);
      console.log('changevalues');
    }
    // if(_.isEmpty(this.props.values) && !_.isEmpty(nextProps.values)) {
    // }

  }
  changeDataSource(values) {
    console.log('base',this.state.baseDataSource);
    const baseDataSource = this.state.baseDataSource;
    let newDataSource = [];
    for(let i = 0;i < baseDataSource.length;i++) {
      const item = baseDataSource[i];
      if(values.schoolId) {
        // 此处学校相关信息需要拉取学校详情
      }
      newDataSource[i] = {
        index: item.index,
        serialNumber: item.serialNumber,
        address: values.address?values.address:item.address,
        firstPulseName: values.firstPulseName?values.firstPulseName:nameList[0],
        secondPulseName: values.secondPulseName?values.secondPulseName:nameList[1],
        thirdPulseName: values.thirdPulseName?values.thirdPulseName:nameList[2],
        fourthPulseName: values.fourthPulseName?values.fourthPulseName:nameList[3],
        firstPulsePrice: values.firstPulsePrice?values.firstPulsePrice*100:item.firstPulsePrice,
        secondPulsePrice: values.secondPulsePrice?values.secondPulsePrice*100:item.secondPulsePrice,
        thirdPulsePrice: values.thirdPulsePrice?values.thirdPulsePrice*100:item.thirdPulsePrice,
        fourthPulsePrice: values.fourthPulsePrice?values.fourthPulsePrice*100:item.fourthPulsePrice,
      }
    }
    this.setState({dataSource: newDataSource});
    this.props.hasChangedTable();
  }
  baseDataSource(list) {
    const theList = list?list:this.props.list;
    let baseDataSource = [];
    if(theList) {
      if(theList.fetch == true){
        const data = theList.result.data.list;
        // self.dataLen = data.length;
        // let rowColor = {};
        baseDataSource = data.map(function (item, key) {
          // rowColor[item.serialNumber] = item.hasAssigned?'lock':'';
          // self.rowColor = rowColor;
          item.index = key + 1;
          item.key = item.serialNumber;
          return item;
        })
      }
    }
    return baseDataSource;
  }
  render() {
    const dataSource = this.baseDataSource();
      return (
      <div>
        <Table
          scroll={{ x: 450 }}
          dataSource={this.state.dataSource.length==0?dataSource:this.state.dataSource}
          columns={this.state.columns}
          pagination={false}
          bordered
          loading={this.state.loading}/>
      </div>
    );
  }

}


export default connect(mapStateToProps, mapDispatchToProps)(DeviceForm);
