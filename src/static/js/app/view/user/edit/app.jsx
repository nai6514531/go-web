import React from 'react';
import './app.less';
import {
  Button,
  Form,
  Input,
  Radio,
  Select,
  Cascader,
  Breadcrumb,
  message,
  Modal,
  Tooltip,
  Icon
} from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const confirm = Modal.confirm;
import {
  Link
} from 'react-router';
import md5 from 'md5';



import {
  connect
} from 'react-redux';
import {
  bindActionCreators
} from 'redux';
import * as UserActions from '../../../actions/user';
import * as regionActions from '../../../actions/region';


function mapStateToProps(state) {
  const {
    user: {
      resultPostDetail,
      resultPutDetail,
      detail
    },
    region: {
      provinceList,
      provinceCity,
      cityList
    }
  } = state;
  return {
    resultPostDetail,
    resultPutDetail,
    detail,
    provinceList,
    provinceCity,
    cityList
  };
}

function mapDispatchToProps(dispatch) {
  const {
    postUserDetail,
    putUserDetail,
    getUserDetail,
  } = bindActionCreators(UserActions, dispatch);
  const {
    getProvinceList,
    getCityList,
    getProvinceCityList,
  } = bindActionCreators(regionActions, dispatch);
  return {
    postUserDetail,
    putUserDetail,
    getUserDetail,
    getProvinceList,
    getCityList,
    getProvinceCityList,
  };
}

class UserForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: "3",
      payType: 1,
      unsaved: true,
      passwordDirty: false,
      imgUrl: '',
      modalVisible: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.provinceChange = this.provinceChange.bind(this);
    this.checkNumber = this.checkNumber.bind(this);
    this.checkUserAccount = this.checkUserAccount.bind(this);
    this.checkConfirm = this.checkConfirm.bind(this);
    this.handlePasswordBlur = this.handlePasswordBlur.bind(this);
    this.checkPassowrd = this.checkPassowrd.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object
  }
  componentWillMount() {
    // 默认北京市东城区
    this.props.getProvinceList();
    this.props.getProvinceCityList(110000);
    const id = this.props.params.id;
    if (id && id !== 'new') {
      this.props.getUserDetail(id);
    } else {
      this.provinceId = 110000;
    }
  }
  componentWillReceiveProps(nextProps) {
    const self = this;
    if (this.props.detail !== nextProps.detail && nextProps.detail && nextProps.detail.fetch == true) {
      if (nextProps.detail.result.data.cashAccount) {
        const type = nextProps.detail.result.data.cashAccount.type;
        // type 1 for alipay,3 for bank,0 for none
        if (type !== undefined) {
          switch (type) {
            case 1:
              this.setState({
                payType: 1
              });
              break;
            case 3:
              this.setState({
                payType: 3
              });
              const provinceId = nextProps.detail.result.data.cashAccount.provinceId;
              if (provinceId !== 0) {
                this.props.getProvinceCityList(provinceId);
              }
              break;
            default:
              this.setState({
                payType: 0
              });
          }
        }
      }
    }
    if (self.saveDetail == 1) {
      const resultPostDetail = this.props.resultPostDetail;
      if (resultPostDetail !== nextProps.resultPostDetail && nextProps.resultPostDetail.fetch == true) {
        message.success('添加运营商成功', 3);
        self.context.router.goBack();
        self.saveDetail = -1;
      } else if (resultPostDetail !== nextProps.resultPostDetail && nextProps.resultPostDetail.fetch == false) {
        message.error(nextProps.resultPostDetail.result.msg, 3);
        self.saveDetail = -1;
      }
      const resultPutDetail = this.props.resultPutDetail;
      if (resultPutDetail !== nextProps.resultPutDetail && nextProps.resultPutDetail.fetch == true) {
        message.success('修改运营商成功', 3);
        self.context.router.goBack();
        self.saveDetail = -1;
      } else if (resultPutDetail !== nextProps.resultPutDetail && nextProps.resultPutDetail.fetch == false) {
        message.error(nextProps.resultPutDetail.result.msg, 3);
        self.saveDetail = -1;
      }
    }
  }
  provinceChange(event) {
    this.props.getProvinceCityList(event);
    const {
      setFieldsValue
    } = this.props.form;
    setFieldsValue({
      'cityId': '-1'
    });
    this.provinceHelp = {};
    this.default = -1;
  }
  cityChange(event) {
    this.cityIdHelp = {};
  }
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      let cashAccount = {};
      const user = {
        "name": values.name,
        "contact": values.contact,
        "mobile": values.mobile,
        "telephone": values.telephone,
        "address": values.address,
        "email": ""
      }
      if (values.type == 3) {
        let provinceId = values.provinceId;
        let cityId = values.cityId;
        if (!provinceId || provinceId == "请选择省份") {
          this.provinceHelp = {
            'help': '必选',
            'className': 'has-error'
          };
          return false;
        }
        if (cityId == -1 || !cityId || cityId == "请选择城市") {
          cityId = 0;
          this.cityIdHelp = {
            'help': '必选',
            'className': 'has-error'
          };
          return false;
        }
        cashAccount = {
          "type": parseInt(values.type),
          "realName": values.realName,
          "bankName": values.bankName,
          "headBankName": values.headBankName,
          "account": values.account,
          "mobile": values.bankMobile,
          "cityId": parseInt(cityId),
          "provinceId": parseInt(provinceId),
        }
      } else if (values.type == 1) {
        cashAccount = {
          "type": parseInt(values.type),
          "realName": values.alipayName,
          "account": values.alipayAccount,
        }
      } else {
        cashAccount = {
          "type": parseInt(values.type),
        }
      }
      user.cashAccount = cashAccount;
      if (this.props.params.id == 'new') {
        user.password = md5(values.password);
        user.account = values.userAccount;
        this.props.postUserDetail(user);
      } else {
        this.props.putUserDetail(this.props.params.id, user);
      }
      this.saveDetail = 1;
    });
  }

  handleRadio(select) {
    switch (select) {
      case "3":
        this.setState({
          payType: 3
        });
        break;
      case "1":
        this.setState({
          payType: 1
        });
        break;
      default:
        this.setState({
          payType: 0
        });
    }
  }
  handleEnter(event) {
    if (event.keyCode == 13) {
      this.handleSubmit(event);
    }
  }
  goBack() {
    const self = this;
    if (this.state.unsaved) {
      confirm({
        title: '确定取消?',
        onOk() {
          self.context.router.goBack();
        },
      });
    }
  }
  checkNumber(rule, value, callback) {
    var pattern = new RegExp(/^\d+$/);
    if (pattern.test(value) || !value) {
      callback();
    } else {
      callback('只能为数字');
    }
  }
  checkUserAccount(rule, value, callback) {
    var pattern = new RegExp(/^[a-zA-Z0-9]{5,15}$/);
    if ((pattern.test(value)) || !value) {
      callback();
    } else {
      callback('新增账号名只能包含字母或数字，长度为5到15位');
    }
  }
  checkAreaCode(rule, value, callback) {
    var pattern = new RegExp(/^[0-9\-]+$/);
    if (pattern.test(value) || !value) {
      callback();
    } else {
      callback('请填写正确号码');
    }
  }
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    // var pattern = new RegExp(/^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})([a-zA-Z0-9]{8,})$/);
    if (value) {
      if (value.length >= 6 && value.length <= 16) {
        callback();
      } else {
        callback('位数为6到16位');
      }
    } else {
      callback('位数为6到16位');
    }
    // if(pattern.test(value) || !value){
    //   callback();
    // } else {
    //   callback('至少是8位数字和字母组成');
    // }
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], {
        force: true
      });
    }
    callback();
  }
  handlePasswordBlur(e) {
    const value = e.target.value;
    this.setState({
      passwordDirty: this.state.passwordDirty || !!value
    });
  }
  checkPassowrd(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致');
    } else {
      callback();
    }
  }
  showModal(type) {
    if (type == 'account') {
      this.setState({
        modalVisible: true,
        imgUrl: require("../../../../../img/app/account_demo.png")
      });
    } else {
      this.setState({
        modalVisible: true,
        imgUrl: require("../../../../../img/app/name_demo.png")
      });
    }
  }
  handleCancel(e) {
    this.setState({
      modalVisible: false,
    });
  }
  render() {
    let ProvinceNode = [];
    if (this.props.provinceList && this.props.provinceList.fetch == true) {
      ProvinceNode = this.props.provinceList.result.data.map(function(item, key) {
        return <Option key={key} value={item.id.toString()}>{item.name}</Option>
      })
    }
    let cityNode = [];
    if (this.props.provinceCity && this.props.provinceCity.fetch == true) {
      const firstNode = <Option key="-1" value="-1">请选择城市</Option>;
      cityNode.push(firstNode);
      const list = this.props.provinceCity.result.data;
      for (let i = 0; i < list.length; i++) {
        const item = <Option key={i} value={list[i].id.toString()}>{list[i].name}</Option>
        cityNode.push(item);
      }
    }
    const self = this;
    const {
      id
    } = this.props.params;
    const userId = USER.id;
    const {
      detail,
      provinceCity,
      provinceList
    } = this.props;
    let initialValue = {};
    if (id && id !== 'new' && detail) {
      if (detail.fetch == true) {
        const data = detail.result.data;
        const baseValues = {
          userAccount: data.account,
          name: data.name,
          contact: data.contact,
          address: data.address,
          mobile: data.mobile,
          telephone: data.telephone,
        }
        self.account = data.account;
        let cashValues = {};
        if (data.cashAccount) {
          const type = Math.abs(data.cashAccount.type);
          if (type == 3) {
            cashValues = {
              type: data.cashAccount.type.toString(),
              realName: data.cashAccount.realName,
              bankName: data.cashAccount.bankName,
              headBankName: data.cashAccount.headBankName,
              account: data.cashAccount.account,
              bankMobile: data.cashAccount.mobile,
              provinceId: data.cashAccount.provinceId.toString(),
              cityId: data.cashAccount.cityId.toString(),
            }
          } else if (type == 1) {
            cashValues = {
              type: data.cashAccount.type.toString(),
              alipayAccount: data.cashAccount.account,
              alipayName: data.cashAccount.realName,
            }
          } else if (type == 0) {
            cashValues = {
              type: "0",
            }
          }
        }
        initialValue = Object.assign({}, baseValues, cashValues);
      } else {
        message.error('获取运营商信息失败,请重试.', 3);
      }
    }
    const {
      getFieldDecorator
    } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 9
      },
      wrapperCol: {
        span: 10
      },
    };
    let breadcrumb = '添加运营商';
    if (id !== 'new') {
      breadcrumb = '修改运营商';
    }
    let payNode = '';
    let imgUrl = this.state.imgUrl;
    // if(!this.cityIdHelp){
    //   this.cityIdHelp = {};
    // }
    if (this.state.payType == 1) {
      payNode = <div>
        <div className="form-wrapper">
          <FormItem
            {...formItemLayout}
            label="支付宝账号">
            {getFieldDecorator('alipayAccount', {
              rules: [
                {required: true,  message: '必填'},
                { max:30, message: '不超过三十个字'},
              ],
              initialValue: initialValue.alipayAccount,

            })(
            <Input placeholder="需要确认是邮箱还是手机号"/>
            )}
          </FormItem>
          <Button className="button-style" type="primary" onClick={this.showModal.bind(this,'account')}>查看示例</Button> 
        </div>
        <div className="form-wrapper">
            <FormItem
              {...formItemLayout}
              label="真实姓名">
              {getFieldDecorator('alipayName', {
                rules: [
                  {required: true, message: '必填'},
                  {max:30, message: '不超过三十个字'},
                ],
                initialValue: initialValue.alipayName,

              })(
                <Input placeholder="必须为实名认证过的姓名"/>
              )}
            </FormItem>
            <Button type="primary" className="button-style" onClick={this.showModal.bind(this,'name')}>查看示例</Button>
         </div>
      </div>
    } else if (this.state.payType == 3) {
      payNode = <div>
        <FormItem
          {...formItemLayout}
          label="收款户名">
          {getFieldDecorator('realName', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十个字'},
            ],
            initialValue: initialValue.realName,

          })(
            <Input placeholder="如：张三"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="开户行所在省"
          {...this.provinceHelp}
        >
          {getFieldDecorator('provinceId', {
            rules: [
              {required: true, message: '必填'}
            ],
            initialValue: +initialValue.provinceId !== 0?initialValue.provinceId:'请选择省份',
          })(
            <Select placeholder="请选择省份" onChange={this.provinceChange.bind(this)}>
              {ProvinceNode}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="开户行所在市"
          {...this.cityIdHelp}
        >
          {getFieldDecorator('cityId', {
            rules: [
              {required: true, message: '必填'}
            ],
            initialValue: +initialValue.cityId !==0?initialValue.cityId:'请选择城市',
          })(
            <Select placeholder="请选择城市" onChange={this.cityChange.bind(this)}>
              {cityNode}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="开户总行">
          {getFieldDecorator('headBankName', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十个字'},
            ],
            initialValue: initialValue.headBankName,

          })(
            <Input placeholder="如：招商银行"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="开户支行">
          {getFieldDecorator('bankName', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十个字'},
            ],
            initialValue: initialValue.bankName,

          })(
            <Input placeholder="总行加支行，如：招商银行深圳科技园支行"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="银行卡号">
          {getFieldDecorator('account', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十位'},
              { validator: this.checkNumber },
            ],
            initialValue: initialValue.account,

          })(
            <Input placeholder="请输入银行卡号"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="短信通知手机号">
          {getFieldDecorator('bankMobile', {
            rules: [
              {len: 11, message: '请输入11位短信通知手机号'},
            ],
            initialValue: initialValue.bankMobile,

          })(
            <Input placeholder="请输入短信通知手机号"/>
          )}
        </FormItem>
      </div>
    }
    // const disable = id !== 'new'?{disabled:true}:{};
    return (
      <section className="view-user-list" onKeyDown={this.handleEnter.bind(this)}>
        <header>
          {userId == id?
            <Breadcrumb >
              <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
            </Breadcrumb>
            :
            <Breadcrumb >
              <Breadcrumb.Item><Link to="/user">运营商管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item><Link to={"/user/" + userId}>下级运营商</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
            </Breadcrumb>
          }

        </header>
        <article>
          <Form layout="horizontal">
            {id !== 'new'? <FormItem
              {...formItemLayout}
              label="登录账号" >
              {getFieldDecorator('userAccount', {
                rules: [
                  {required: true, message: '必填'},
                  {max:30, message: '不超过三十个字' },
                ],
                initialValue: initialValue.userAccount,
              })(
                <Input disabled placeholder="请输入登录账号" />
              )}
            </FormItem>:
              <div>
                <FormItem
                  {...formItemLayout}
                  label="登录账号" >
                  {getFieldDecorator('userAccount', {
                    rules: [
                      {required: true, message: '必填'},
                      {validator: this.checkUserAccount },
                    ],
                    initialValue: initialValue.userAccount,
                  })(
                    <Input placeholder="请输入登录账号" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="密码"
                >
                  {getFieldDecorator('password', {
                    rules: [
                      {required: true, message: '必填'},
                      {validator: this.checkConfirm}],
                  })(
                    <Input type="password" placeholder="请输入密码" onBlur={this.handlePasswordBlur} />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="确认密码"
                >
                  {getFieldDecorator('confirm', {
                    rules: [{
                      required: true, message: '请确认密码',
                    }, {
                      validator: this.checkPassowrd,
                    }],
                  })(
                    <Input type="password" placeholder="请确认密码"/>
                  )}
                </FormItem>
              </div>
              }
            <FormItem
              {...formItemLayout}
              label="运营商名称" >
              {getFieldDecorator('name', {
                rules: [
                  {required: true, message: '必填'},
                  {max:30, message: '不超过三十个字' },
                ],
                initialValue: initialValue.name,
              })(
                <Input placeholder="请输入运营商名称" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="联系人" >
              {getFieldDecorator('contact', {
                rules: [
                  { required: true, message: '必填' },
                  { max:30, message: '不超过三十个字' },
                ],
                initialValue: initialValue.contact,
              })(
                <Input placeholder="请输入联系人" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="地址" >
              {getFieldDecorator('address', {
                rules: [
                  { required: true, message: '必填' },
                  { max:30, message: '不超过三十个字' },
                ],
                initialValue: initialValue.address,
              })(
                <Input placeholder="请输入地址" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="手机号" >
              {getFieldDecorator('mobile', {
                rules: [
                  { len: 11, message: '请输入11位手机号' },
                  { required: true, message: '必填' },
                  { validator: this.checkNumber },
                ],
                initialValue: initialValue.mobile,
              })(
                <Input placeholder="请输入手机号" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="服务电话" >
              {getFieldDecorator('telephone', {
                rules: [
                  { required: true, message: '必填' },
                  { max:30, message: '长度不超过三十位' },
                  { validator: this.checkAreaCode },
                ],
                initialValue: initialValue.telephone,

              })(
                <Input placeholder="请输入服务电话" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="收款方式"
            >
              {getFieldDecorator('type', {
                rules: [
                  {  message: '请选择收款方式' },
                ],
                initialValue: initialValue.type!==undefined? initialValue.type: this.state.payType.toString(),
              })(
                <RadioGroup>
                  <Radio value="0" onClick = {this.handleRadio.bind(this, '0')} className="radio-block radio-small">
                    无设备
                  </Radio>
                  <Radio value="1" onClick = {this.handleRadio.bind(this, '1')} className="radio-block">
                     <span>支付宝收款(T+1结算，周末照常结算)</span>
                  </Radio>
                  <Radio value="3" onClick = {this.handleRadio.bind(this, '3')} className="radio-block">
                    <span>银行卡收款(T+1结算，仅工作日进行)</span>
                  </Radio>
                </RadioGroup>

              )}
            </FormItem>
            {payNode}
            <FormItem className="button-wrapper">
              <Button type="ghost" onClick={this.goBack.bind(this)}>取消</Button>
              <Button type="primary" onClick={this.handleSubmit}>保存</Button>
            </FormItem>
          </Form>
          <div>
             <Modal title="示例图片" 
                    visible={this.state.modalVisible}
                    footer={null}
                    onCancel={this.handleCancel.bind(this)}
                    style={{textAlign:'center'}}>
                <img src={imgUrl} width="70%"/>
             </Modal>
           </div>
        </article>
      </section>
    );
  }
}

UserForm = createForm()(UserForm);

UserForm.propTypes = {
  title: React.PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserForm);