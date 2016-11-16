import React from 'react';
import './app.less';
import { Button, Form, Input, Radio, Select, Cascader, Breadcrumb, message, Modal,Tooltip, Icon } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const confirm = Modal.confirm;
import { Link } from 'react-router';
import md5 from 'md5';



import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as UserActions from '../../../actions/user';
import * as regionActions from '../../../actions/region';


function mapStateToProps(state) {
  const { user: { resultPostDetail, resultPutDetail, detail }, region: { provinceList, provinceCity, cityList } }= state;
  return { resultPostDetail, resultPutDetail, detail, provinceList, provinceCity, cityList };
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
      payType: 0,
      unsaved: true,
      passwordDirty: false,
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
    if(id && id !== 'new') {
      this.props.getUserDetail(id);
    } else {
            this.provinceId = 110000;
        }
  }
  componentWillReceiveProps(nextProps) {
        const self = this;
    if(this.props.detail !== nextProps.detail && nextProps.detail && nextProps.detail.fetch == true){
            if(nextProps.detail.result.data.cashAccount){
        const type = nextProps.detail.result.data.cashAccount.type;
              // type 1 for alipay,3 for bank,0 for none
        if(type) {
          switch (type) {
            case 1:
              this.setState({ payType: 1 });
              break;
            case 3:
              this.setState({ payType: 3 });
              const provinceId = nextProps.detail.result.data.cashAccount.provinceId;
              this.props.getProvinceCityList(provinceId);
              break;
            default:
              this.setState({ payType: 0 });
          }
        }
      }
    }
    if(self.saveDetail == 1){
      const resultPostDetail = this.props.resultPostDetail;
      if(resultPostDetail !== nextProps.resultPostDetail
        && nextProps.resultPostDetail.fetch == true){
        message.success('添加代理商成功',3);
        self.context.router.goBack();
        self.saveDetail = -1;
      } else if(resultPostDetail !== nextProps.resultPostDetail
        && nextProps.resultPostDetail.fetch == false){
        message.error(nextProps.resultPostDetail.result.msg,3);
        self.saveDetail = -1;
      }
      const resultPutDetail = this.props.resultPutDetail;
      if(resultPutDetail !== nextProps.resultPutDetail
        && nextProps.resultPutDetail.fetch == true){
        message.success('修改代理商成功',3);
        self.context.router.goBack();
        self.saveDetail = -1;
      } else if(resultPutDetail !== nextProps.resultPutDetail
        && nextProps.resultPutDetail.fetch == false){
        message.error(nextProps.resultPostDetail.result.msg,3);
        self.saveDetail = -1;
      }
    }
  }
  provinceChange(event) {
    this.props.getProvinceCityList(event);
    const { setFieldsValue } = this.props.form;
    setFieldsValue({'cityId':'-1'});
    this.default = -1;
    }
  cityChange(event) {
    this.cityIdHelp = {};
    }
  handleSubmit(e) {
      e.preventDefault();
      const self = this;
    this.props.form.validateFields((errors, values) => {
      if(values.cityId == -1) {
        self.cityIdHelp = {'help':'必选','className':'has-error'};
        return false;
      }
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
      if(values.type == 3) {
          cashAccount = {
              "type": parseInt(values.type),
              "realName": values.realName,
              "bankName": values.bankName,
              "account": values.account,
              "mobile": values.bankMobile,
              "cityId": parseInt(values.cityId),
              "provinceId": parseInt(values.provinceId),
          }
      } else if(values.type == 1){
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
      if(this.props.params.id == 'new') {
        user.password = md5(values.password);
        if(values.userAccount.length == 11) {
            user.account = values.userAccount;
            this.props.postUserDetail(user);
        } else {
          message.error('新增账号只能为11位手机号',3);
          return;
        }
      } else {
          // user.account = self.account;
          this.props.putUserDetail(this.props.params.id, user);
      }
      self.saveDetail = 1;
    });
  }

  handleRadio(select) {
    switch (select) {
      case "3":
        this.setState({ payType: 3 });
        break;
      case "1":
        this.setState({ payType: 1 });
        break;
      default:
        this.setState({ payType: 0 });
    }
  }
  handleEnter(event) {
    if (event.keyCode==13) {
      this.handleSubmit(event);
    }
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
  checkNumber(rule, value, callback) {
    var pattern=new RegExp(/^\d+$/);
    if(pattern.test(value) || !value){
      callback();
    } else {
      callback('只能为数字');
    }
  }
  checkUserAccount(rule, value, callback) {
    var pattern=new RegExp(/^\d+$/);
    if((pattern.test(value) && value.length == 11 )|| !value ){
      callback();
    } else {
      callback('新增账号名只能为11位手机号');
    }
  }
  checkAreaCode(rule, value, callback) {
    var pattern = new RegExp(/^[0-9\-]+$/);
    if(pattern.test(value) || !value){
      callback();
    } else {
      callback('请填写正确号码');
    }
  }
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    var pattern = new RegExp(/^(?=.*[0-9]{1,})(?=.*[a-zA-Z]{1,})([a-zA-Z0-9]{8,})$/);
    if(pattern.test(value) || !value){
      callback();
    } else {
      callback('至少是8位数字和字母组成');
    }
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }
  handlePasswordBlur(e) {
    const value = e.target.value;
    this.setState({ passwordDirty: this.state.passwordDirty || !!value });
  }
  checkPassowrd(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致');
    } else {
      callback();
    }
  }
  render() {
    let ProvinceNode = [];
    if(this.props.provinceList && this.props.provinceList.fetch == true){
      ProvinceNode = this.props.provinceList.result.data.map(function (item, key) {
        return <Option key={key} value={item.id.toString()}>{item.name}</Option>
      })
    }
    let cityNode = [];
    if(this.props.provinceCity && this.props.provinceCity.fetch == true){
      const firstNode = <Option key="-1" value="-1">请选择城市</Option>;
      cityNode.push(firstNode);
      const list = this.props.provinceCity.result.data;
      for(let i = 0;i<list.length; i++) {
        const item = <Option key={i} value={list[i].id.toString()}>{list[i].name}</Option>
        cityNode.push(item);
      }
    }
    const self = this;
    const { id } = this.props.params;
    const userId = USER.id;
        const { detail, provinceCity, provinceList } = this.props;
    let initialValue = {};
    if(id && id !== 'new' && detail) {
      if(detail.fetch == true){
        const data = detail.result.data;
        const baseValues = {
          userAccount: data.account,
          name: data.name,
          contact: data.contact,
          address: data.address,
          mobile : data.mobile,
          telephone: data.telephone,
        }
        self.account = data.account;
        let cashValues = {};
        if(data.cashAccount) {
          const type = Math.abs(data.cashAccount.type);
          if(type == 3) {
            cashValues = {
              type: data.cashAccount.type.toString(),
              realName: data.cashAccount.realName,
              bankName: data.cashAccount.bankName,
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
          }
        }
        initialValue = Object.assign({}, baseValues, cashValues);
      } else {
        message.error('获取代理商信息失败,请重试.');
      }
    }
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    };
    let breadcrumb = '添加代理商';
    if(id !== 'new') {
      breadcrumb = '修改代理商';
    }
    let payNode = '';
    if(!this.cityIdHelp){
      this.cityIdHelp = {};
    }
    if(this.state.payType == 1){
      payNode = <div>
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
            <Input placeholder="请输入支付宝账号"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="支付宝姓名">
          {getFieldDecorator('alipayName', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十个字'},
            ],
            initialValue: initialValue.alipayName,

          })(
            <Input placeholder="请输入支付宝姓名"/>
          )}
        </FormItem>
      </div>
    } else if (this.state.payType == 3){
      payNode = <div>
        <FormItem
          {...formItemLayout}
          label="转账户名">
          {getFieldDecorator('realName', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十个字'},
            ],
            initialValue: initialValue.realName,

          })(
            <Input placeholder="请输入转账户名"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="开户行">
          {getFieldDecorator('bankName', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十个字'},
            ],
            initialValue: initialValue.bankName,

          })(
            <Input placeholder="请输入开户行"/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="银行账号">
          {getFieldDecorator('account', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十位'},
              { validator: this.checkNumber },
            ],
            initialValue: initialValue.account,

          })(
            <Input placeholder="请输入银行账号"/>
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
        <FormItem
          {...formItemLayout}
          label="省份"
        >
          {getFieldDecorator('provinceId', {
            rules: [
              { required: true, message: '必选' },
            ],
            initialValue: initialValue.provinceId,
          })(
            <Select placeholder="请选择省份" onChange={this.provinceChange.bind(this)}>
              {ProvinceNode}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="城市"
          {...this.cityIdHelp}
        >
          {getFieldDecorator('cityId', {
            rules: [
              { required: true, message: '必选' },
            ],
            initialValue: initialValue.cityId,
          })(
            <Select placeholder="请选择城市" onChange={this.cityChange.bind(this)}>
              {cityNode}
            </Select>
          )}
        </FormItem>
      </div>
    }
    const disable = id !== 'new'?{disabled:true}:{};
    return (
      <section className="view-user-list" onKeyDown={this.handleEnter.bind(this)}>
        <header>
          {userId == id?
            <Breadcrumb >
              <Breadcrumb.Item><Link to="/user">代理商管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
            </Breadcrumb>
            :
            <Breadcrumb >
              <Breadcrumb.Item><Link to="/user">代理商管理</Link></Breadcrumb.Item>
              <Breadcrumb.Item><Link to={"/user/" + userId}>下级代理商</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
            </Breadcrumb>
          }

        </header>
        <article>
          <Form horizontal>
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
              label="代理商名称" >
              {getFieldDecorator('name', {
                rules: [
                  {required: true, message: '必填'},
                  {max:30, message: '不超过三十个字' },
                ],
                initialValue: initialValue.name,
              })(
                <Input placeholder="请输入代理商名称" />
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
              label="收款方式"
            >
              {getFieldDecorator('type', {
                rules: [
                  {  message: '请选择收款方式' },
                ],
                initialValue: initialValue.type? initialValue.type: this.state.payType.toString(),
              })(
                <RadioGroup>
                  <Radio value="0" onClick = {this.handleRadio.bind(this, '0')} className="radio-block radio-small">
                    无
                  </Radio>
                  <Radio value="1" onClick = {this.handleRadio.bind(this, '1')} className="radio-block">
                    <span>自动分账-无须手动申请结账</span>
                    <p className="tips">必须有支付宝账号</p>
                  </Radio>
                  <Radio value="3" onClick = {this.handleRadio.bind(this, '3')} className="radio-block">
                      <span>财务定期结账-需手动申请结账</span>
                      <p className="tips">请确保输入正确的银行卡相关信息</p>
                  </Radio>
                </RadioGroup>

              )}
            </FormItem>
            {payNode}
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
            <FormItem wrapperCol={{ span: 12, offset: 7 }}>
              <Button type="ghost" onClick={this.goBack.bind(this)}>取消</Button>
              <Button type="primary" onClick={this.handleSubmit}>保存</Button>
            </FormItem>
          </Form>
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
