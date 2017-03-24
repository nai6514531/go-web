import React, { PropTypes } from 'react';

import { Form, Icon, Input, Button, Modal, message } from 'antd';
const FormItem = Form.Item;
import  UserService  from "../../app/service/user";

const COUNTDOWN = 5

class VerifyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      captcha: false,
      smsCode: true,
      count: COUNTDOWN,
      visible: true,
      mobile: 'xxxxxxxxxxx'
    }
    this.getCaptcha = this.getCaptcha.bind(this);
    this.getSmsCode = this.getSmsCode.bind(this);
  }
  componentWillMount() {
    this.getCaptcha();
  }
  getCaptcha(e) {
    if(e){
      e.preventDefault();
    }
    const url = '/captcha.png';
    var timestamp =new Date().getTime();
    this.setState({ url: `${url}?${timestamp}`});
  }
  showInfo(mobile) {
    Modal.info({
      content: (
        <div>
          <p>正在给手机号：{mobile} 发送短信验证码，如手机号有误或收取不到验证码请联系苏打生活技术团队。</p>
        </div>
      ),
      okText: '我知道了',
      onOk() {},
    });
  }
  handleSmsCode(values) {
    const self = this;
    UserService.sms(values)
      .then((data) => {
        const mobile = data.data.mobile;
        this.showInfo(mobile);
        self.setState({
          smsCode: false,
          mobile,
        })
        // 图形验证码通过以后,再执行倒计时
        self.timer = setInterval(function () {
          let count = self.state.count;
          if(count > 0) {
            console.log('count',count);
            self.setState({
              count: --self.state.count,
            })
          } else {
            self.clearTimer();
            self.setState({
              smsCode: true,
              count: COUNTDOWN,
            })
          }
        },1000);
        this.getCaptcha();
      },(error)=>{
        message.error(error.msg,3);
        this.getCaptcha();
        self.setState({
          smsCode: true,
          count: COUNTDOWN,
        })
      })
  }
  verifyAccount() {
    const verifyList = ['account','captcha'];
    let verifyAccount = false;
    this.props.form.validateFields(verifyList,(err, values) => {
      if(!err){
        verifyAccount = values;
      }
    })
    return verifyAccount;
  }
  smsCodeVerify(values) {
    const self = this;
    UserService.smsVerify(values)
      .then((data) => {
        self.props.next();
        // 账户信息传递给父组件
        self.props.setValues(values);
      },(error)=>{
        message.error(error.msg,3);
      })
  }
  clearTimer() {
    clearInterval(this.timer);
  }
  getSmsCode() {
    const self = this;
    const verifyAccount = this.verifyAccount();
    if(verifyAccount) {
      this.handleSmsCode(verifyAccount);
    }

  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.motivation = "RESET_PASSWORD";
        this.smsCodeVerify(values);
      }
    });
  }
  componentWillUnmount() {
    this.clearTimer();
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 16 },
    };
    const initialAccount = this.props.account;
    return (
      <Form onSubmit={this.handleSubmit} className="verify-form">
        <FormItem
          {...formItemLayout}
          label="登录账号：">
          {getFieldDecorator('account', {
            rules: [{ required: true, message: '登录账号不可为空' }],
            initialValue: initialAccount,
          })(
            <Input placeholder="请输入登录账号" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="图形验证码：">
          {getFieldDecorator('captcha', {
            rules: [{ required: true, message: '图形验证码不可为空' }],
          })(
            <div>
              <Input  placeholder="请输入图形验证码" style={{ width: '60%', marginRight: 8 }}/>
              <div className="captcha">
                <img   src={this.state.url} onClick={this.getCaptcha}/>
              </div>
              <p><a href="#" onClick={this.getCaptcha}>看不清楚? 换一张</a></p>
            </div>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="短信验证码：">
          {getFieldDecorator('code', {
            rules: [{ required: true, message: '短信验证码不可为空' }],
          })(
            <div>
              <Input  placeholder="请输入短信验证码" style={{ width: '60%', marginRight: 8 }}/>
                {this.state.smsCode ?
                  <Button type="primary" className="codeSms" onClick={this.getSmsCode}>发送验证码</Button>
           						:
                  <Button type="primary" className="codeSms" disabled>{this.state.count} S后重发</Button>}
            </div>
            )}
        </FormItem>
        <FormItem>
          <Button className="submit" type="primary" htmlType="submit">下一步</Button>
        </FormItem>
      </Form>
    );
  }
}

const App = Form.create()(VerifyForm);


export default App;

