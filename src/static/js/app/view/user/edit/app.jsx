import React from 'react';
import Promise from 'bluebird'
import op from 'object-path'
import _ from 'underscore';

import './app.less';
import {
  Button,
  Form,
  Input,
  Checkbox,
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
import { Wechat, Alipay, Test } from './pay-form.jsx'
import * as UserActions from '../../../actions/user';
import * as regionActions from '../../../actions/region';
import UserService from '../../../service/user';
import WechatService from '../../../service/wechat';

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
      payType: 0,
      unsaved: true,
      passwordDirty: false,
      imgUrl: '',
      modalVisible: false,
      wechat: {
        key: '',
        name: '',
      },
      keyLoading: false,
      isMode: true
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.provinceChange = this.provinceChange.bind(this);
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
    // this.props.getProvinceList();
    // this.props.getProvinceCityList(110000);
    const id = this.props.params.id;
    if (id && id !== 'new') {
      this.props.getUserDetail(id);
    }
  }
  componentWillReceiveProps(nextProps) {
    const self = this;
    if (this.props.detail !== nextProps.detail && nextProps.detail && nextProps.detail.fetch == true) {
      if (nextProps.detail.result.data.cashAccount) {
        const type = nextProps.detail.result.data.cashAccount.type;
        const mode = nextProps.detail.result.data.cashAccount.mode;
        // type 1 for alipay,3 for bank,0 for none
        this.setState({payType: type || 0, isMode: mode === 0 ? true : false});
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
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      let cashAccount = {};
      const type = parseInt(values.type);
      const user = {
        "name": values.name,
        "contact": values.contact,
        "mobile": values.mobile,
        "telephone": values.telephone,
        "address": values.address,
        "email": "",
        "key": this.state.wechat.key || ''      
      }
      // 当前为修改微信账号状态，且未关联微信
      if (!this.state.wechat.name && !!this.state.wechat.key) {
        return message.error('请使用你作为收款用途的微信扫描二维码进行关联')
      }
       // 未选任何结算方式
      if (!~[1, 2].indexOf(type)) {
        return message.error('请选择收款方式')
      }
      if (type === 1) {
        cashAccount = {
          "type": type,
          "realName": values.alipayName,
          "account": values.alipayAccount,
        }
      }
      if (type === 2) {
        cashAccount = {
          "type": type,
          "realName": values.wechatName,
        }
      }
      cashAccount.mode = this.state.isMode ? 0 : 1
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

  changePayTye(type) {
    const self = this;
    const isEdit = this.props.params.id !== 'new'
    let user = {};

    
    const wechat = this.state.wechat;
    clearInterval(self.timer);
    self.timer = null;
    this.setState({payType: type, wechat: {name: '', key: ''}});

    // 当前状态为修改用户信息
    if (isEdit) {
      user = this.props.detail.result.data;
      // 选择微信支付账户 且用户默认不是微信支付
      if (type === 2 && user.cashAccount.type !== 2) {
        // 获取随机key
        return self.resetWechatKey()
      }
    }
    if (!isEdit && type === 2) {
      // 获取随机key
      return self.resetWechatKey()
    }
  }
  resetWechatKey() {
    const self = this;
    self.setState({keyLoading: true})
    WechatService.create().then((res) => {
      console.log(res)
      if (res.status !== 0) {
        return new Promise.reject()
      }
      const key = res.data.key
      // 根据key生成二维码
      // self.initQRCode(key)
      self.setState({wechat: {name: '', key: key || ''}, keyLoading: false})
      self.checkWechatKey()
    }).catch(() => {
      self.setState({keyLoading: false})
    })
  }
  checkWechatKey() {
    const self = this;
    const key = self.state.wechat.key;
    clearInterval(self.timer);
    self.timer = null;
    self.timer = setInterval(() => {
      WechatService.getKeyDetail(key).then((res) => {
        const status = res.status;
        if (status === 1) {
          clearInterval(self.timer);
          self.timer = null;
          return new Promise.reject()
        }
        if (status === 0) {
          clearInterval(self.timer);
          self.timer = null;
          self.setState({wechat: {...self.state.wechat, name: res.data.wechat.name}})
        }
      }).catch((error) => {
        clearInterval(self.timer);
        self.timer = null;
        console.log(error)
      })
    }, 3000)
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
  onChangeAutoBill () {
    this.setState({isMode: !this.state.isMode})
  }
  componentWillUpdate(nextProps, nextState) {
    const self = this;
    // if (nextProps.detail.result.data.cashAccount !== this.props.wechat.key) {
    //   self.initQRCode(nextProps.wechat.key)
    // }
  }
  componentWillUnmount () {
    clearInterval(this.timer)
    this.timer = null
  }
  render() {
    let ProvinceNode = [];
    const wechat = this.state.wechat
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
          mode: data.mode
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
              account: data.cashAccount.account,
              realName: data.cashAccount.realName,
            }
          } else if (type == 2) {
            cashValues = {
              type: data.cashAccount.type.toString(),
              account: data.cashAccount.account,
              realName: data.cashAccount.realName,
            }
          } else {
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
        xs: { span: 9 },
        sm: { span: 9 }
      },
      wrapperCol: {
        xs: { span: 15 },
        sm: { span: 10 },
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
    const type = this.state.payType || +initialValue.type
    if (type == 1) {
      payNode = <Alipay form={this.props.form} cashAccount={op.get(detail, 'result.data.cashAccount') || {}} formItemLayout={formItemLayout} />
    } else if (type == 2) {
      payNode = <Wechat cashAccount={op.get(detail, 'result.data.cashAccount') || {}} formItemLayout={formItemLayout} keyLoading={this.state.keyLoading} user={op.get(detail, 'result.data') || {}}
       form={this.props.form} resetWechatKey={this.resetWechatKey.bind(this)} wechat={this.state.wechat} />
    } else {
      payNode = ''
    }
    // const disable = id !== 'new'?{disabled:true}:{};
    return (
      <section className="view-user-list" onKeyDown={this.handleEnter.bind(this)}>
        <header>
          {userId == id ?
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
            </FormItem> :
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
            <FormItem {...formItemLayout} label="是否自动结算" >
              <Checkbox checked={this.state.isMode} onChange={this.onChangeAutoBill.bind(this)} className='label-margin'>
                结算金额一旦超过200元，系统自动提交结算申请（若不勾选，
              结算时需手动点击结算查询的"申请结算"按钮，财务才会进行结算）</Checkbox>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="收款方式"
            >
              {getFieldDecorator('type', {
                rules: [
                  { required: true, message: '请选择收款方式' },
                ],
                initialValue: initialValue.type || ''
              })(
                <RadioGroup className='radio-line'>
                  <Radio value="2" onClick = {this.changePayTye.bind(this, 2)} className="radio-block">
                    <span>微信(申请后T+1结算，收取结算金额的1%作为手续费)</span>
                  </Radio>
                  <Radio value="1" onClick = {this.changePayTye.bind(this, 1)} className="radio-block">
                     <span>支付宝(申请后T+1结算，200元以下每次结算收取2元手续费，200元及以上收取结算金额的1%作为手续费)</span>
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