import React from 'react';
import Promise from 'bluebird'
import _ from 'underscore';
import moment from 'moment';
import op from 'object-path';

import { Button, Radio, Input, Icon, message, Modal, Row, Col, Form, Spin, Checkbox } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import QRCode from 'qrcode.react'
import UserService from '../../../service/user';
import WechatService from '../../../service/wechat';

import { isProduction } from '../../../library/debug'
const defaultUrl = isProduction ? 'http://m.sodalife.xyz/act/relate-wechat' : 'http://m.sodalife.club/act/relate-wechat';

class Alipay extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showAccountTip: false,
      showAccountNameTip: false
    }
  }
  render() {
    const cashAccount = this.props.cashAccount
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = this.props.formItemLayout
    return <div>
      <div className='form-wrapper form-input'>
        <FormItem
          {...formItemLayout}
          label='支付宝账号'>
          {getFieldDecorator('alipayAccount', {
            rules: [
              {required: true,  message: '必填'},
              {max:30, message: '不超过三十个字'},
            ],
            initialValue: cashAccount.get('type') === 1 ? cashAccount.get('account') : '',

          })(
            <Input placeholder='需要确认是邮箱还是手机号' /> 
          )}
        </FormItem>
        <Button type='primary' onClick={() => { this.setState({ showAccountTip: true })}}>查看示例</Button> 
      </div>
      <div className='form-wrapper form-input'>
        <FormItem
          {...formItemLayout}
          label='真实姓名'>
          {getFieldDecorator('alipayName', {
            rules: [
              {required: true, message: '必填'},
              {max:30, message: '不超过三十个字'},
            ],
            initialValue: cashAccount.get('type') === 1 ? cashAccount.get('realName') : '',

          })(
            <Input placeholder='必须为实名认证过的姓名' />
          )}
        </FormItem>
        <Button type='primary' onClick={() => { this.setState({ showAccountNameTip: true })}}>查看示例</Button>  
      </div>
      <Modal title='示例图片'
        footer={null}
        visible={this.state.showAccountTip}
        onCancel={() => { this.setState({ showAccountTip: false })}}
        style={{textAlign:'center'}}>
        <img src={require('../../../../../img/app/account_demo.png')} width='70%'/>
     </Modal>
     <Modal title='示例图片' 
        footer={null}
        visible={this.state.showAccountNameTip}
        onCancel={() => { this.setState({ showAccountNameTip: false })}}
        style={{textAlign:'center'}}>
        <img src={require('../../../../../img/app/name_demo.png')} width='70%'/>
     </Modal>
    </div>
  }
}

class Wechat extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showIdentification: false,
      qrCodeUrl: ''
    }
  }
  initQRCode(key) {
    const self = this;
    key = key || '';
    const url = defaultUrl + `?key=${key}`;

    self.setState({qrCodeUrl: url})
  }
  identification() {
    this.setState({ showIdentification: true })
  }
  componentWillUpdate(nextProps, nextState) {
    const self = this;
    if (nextProps.wechat.key !== this.props.wechat.key) {
      self.initQRCode(nextProps.wechat.key)
    }
  }
  componentDidMount() {
    this.initQRCode()
  }
  render() {
    const { wechat, user } = this.props;
    const cashAccount = this.props.cashAccount;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = this.props.formItemLayout;
    const nickName = wechat.name || user.get('nickName');

    return <div>
      <div className='form-wrapper'>
        <FormItem {...formItemLayout} label={( <span className='label'>扫码验证身份</span>)} >
          <div className={this.props.keyLoading ? 'code loading' : 'code' } >
            <QRCode value={this.state.qrCodeUrl} />
            { this.props.keyLoading ? <Spin className='key-loading' /> : null }
          </div> 
        </FormItem>
        { 
          wechat.isRelate || (!wechat.key && cashAccount.get('type') === 2) ? <div className='code-tip'>
            <Icon type='check-circle' className='icon success' /> 
            <span>关联成功（你将使用昵称为<span className='color-red'>{nickName}</span>的微信收款。如需更换账号请<i className='reset-wechat' onClick={this.props.resetWechatKey}>刷新</i>二维码，用新微信号扫描）</span>
          </div> :
          <div className='code-tip'>
            <Icon type='exclamation-circle' className='icon info' />
            <span>请使用你作为收款用途的微信扫描二维码进行关联，申请结算后，
            款项会在规定时间内打入微信账户。</span>
            <p>请确保自己的微信已实名认证<span className='check-wechat' onClick={this.identification.bind(this)}>如何认证?</span></p>
          </div> 
        }
      </div>
      <FormItem
        {...formItemLayout}
        label='微信已认证姓名'>
        {getFieldDecorator('wechatName', {
          rules: [
            {required: true, message: '必填'},
            {max:30, message: '不超过三十个字'},
          ],
          initialValue: cashAccount.get('type') === 2 ? cashAccount.get('realName') : '',
        })(
          <Input placeholder='如：张三' />
        )}
      </FormItem>
      <Modal title='如何认证' 
        footer={null}
        visible={this.state.showIdentification}
        onCancel={() => { this.setState({ showIdentification: false })}}
        style={{textAlign:'center'}}>
        <p>通过微信内选择【我】-> 【钱包】 -> 【···】 -> 【支付管理】 -> 【实名认证】-> 上传身份证进行实名。</p>
     </Modal>
    </div>
  }
}

class AmountForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      keyLoading: false,
      wechat: {
        name: '',
        key: '',
        isRelate: false
      },
      type: '',
      isMode: true,
      userLoading:false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault()
    const self = this;
    self.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      let cashAccount = {};
      const type = parseInt(values.type);
      if (type === 1) {
        cashAccount = {
          'type': type,
          'realName': values.alipayName,
          'account': values.alipayAccount
        }
      } 
       // 当前为修改微信账号状态，且未关联微信
      if (!this.state.wechat.name && !!this.state.wechat.key) {
        return message.error('请使用你作为收款用途的微信扫描二维码进行关联')
      }
      if (type === 2) {
        cashAccount = {
          'type': type,
          'realName': values.wechatName
        }
      }
      self.updateUserAccount(cashAccount)  
    });
  }
  changePayTye(type) {
    const self = this;
    const wechat = this.state.wechat;
    clearInterval(self.timer);
    self.timer = null;
    this.setState({type: type, wechat: {name: '', key: ''}});
    // 选择微信支付账户 且用户默认不是微信支付
    if (type === 2 && this.props.cashAccount.type !== 2) {
      // 获取随机key
      return self.resetWechatKey()
    }
  }
  resetWechatKey() {
    const self = this;
    self.setState({keyLoading: true})
    WechatService.create(window.USER.id).then((res) => {
      if (res.status !== 0) {
        throw new Error()
      }
      const key = res.data.key
      // 根据key生成二维码
      // self.initQRCode(key)
      self.setState({wechat: {name: '', key: key || '', isRelate: false}, keyLoading: false})
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
          throw new Error()
        }
        if (status === 0) {
          clearInterval(self.timer);
          self.timer = null;
          self.setState({wechat: {...self.state.wechat, name: res.data.wechat.name, isRelate: true}})
        }
      }).catch((error) => {
        clearInterval(self.timer);
        self.timer = null;
      })
    }, 3000)
  }
  updateUserAccount({ ...options }) {
    const self = this
    let cashAccount = _.chain(this.props.cashAccount).clone().extendOwn({realName: options.realName, account: options.account, type: options.type, mode: this.state.isMode ? 0 : 1}).value()
    cashAccount = _.pick(cashAccount, 'type', 'realName', 'account', 'mode')
    // 微信用户 补充key nickName 
    let user = options.type === 2 ? _.chain(this.props.user).clone().extendOwn({key: this.state.wechat.key, nickName: this.state.wechat.name}).value() : this.props.user
    user = _.pick(user, 'name', 'contact', 'mobile', 'telephone', 'address', 'email', 'key')
    user.cashAccount = cashAccount
    self.setState({userLoading: true})
    UserService.edit(window.USER.id, user).then((res) => {
      if (res.status !== 0) {
        throw new Error(res.msg)
      }
      self.setState({userLoading: false})
      self.props.handleCashModal('success');
    }, (res) => {    
      throw new Error(res.msg)
    }).catch((err) => {
      self.setState({userLoading: false})
      message.error(err.message || '更新失败，请重试~')
    })
  }
  handleCashModal(val) {
    clearInterval(this.timer);
    this.timer = null;
    this.props.handleCashModal(val)
  }
  onChangeAutoBill () {
    this.setState({isMode: !this.state.isMode})
  }
  componentDidMount() {
    this.setState({isMode: this.props.cashAccount.mode === 0 ? true : false})
  }
  componentWillUnmount () {
    clearInterval(this.timer)
    this.timer = null
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const cashAccount = op(this.props.cashAccount)
    const user = op(this.props.user)
    const type = this.state.type || cashAccount.get('type')  
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 },
      },
    };

    return (<Form onSubmit={this.handleSubmit}>
      <FormItem {...formItemLayout} label='是否自动结算'>
        <Checkbox checked={this.state.isMode} onChange={this.onChangeAutoBill.bind(this)}>结算金额一旦超过200元，系统自动提交结算申请（若不勾选，
        结算时需手动点击结算查询的"申请结算"按钮，财务才会进行结算）</Checkbox>
      </FormItem>
      <FormItem {...formItemLayout} label='收款方式'>
        {getFieldDecorator('type', {
          rules: [
            {required: true, message: '请选择收款方式'},
          ],
          initialValue: !!type ? type.toString() : '',
        })(
          <RadioGroup>
            <Radio value='2' onClick = {this.changePayTye.bind(this, 2)} className='radio-block'>
               <span>微信(申请后T+1结算，收取结算金额的1%作为手续费)</span>
            </Radio>
            <Radio value='1' onClick = {this.changePayTye.bind(this, 1)} className='radio-block'>
               <span>支付宝(申请后T+1结算，200元以下每次结算收取2元手续费，</span><br/>
               <span>200元及以上收取结算金额的1%作为手续费)</span>
            </Radio>
          </RadioGroup>
        )}
      </FormItem>
      { type === 1 ? <Alipay form={this.props.form} cashAccount={cashAccount} formItemLayout={formItemLayout} /> : type === 2 ?
       <Wechat cashAccount={cashAccount} formItemLayout={formItemLayout} keyLoading={this.state.keyLoading} user={user}
       form={this.props.form} resetWechatKey={this.resetWechatKey.bind(this)} wechat={this.state.wechat} /> : null} 
      <div className='footer-btn'>
        <FormItem>
          <Button type='ghost' onClick={this.handleCashModal.bind(this)}>取消</Button>
          <Button type='primary' htmlType='submit' loading={this.state.userLoading}>保存</Button>
        </FormItem>
       </div>
    </Form>);
  }
};

AmountForm = createForm()(AmountForm);

export default AmountForm;
