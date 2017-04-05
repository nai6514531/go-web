import React, { PropTypes } from 'react';
import './app.less';
import md5 from 'md5';
import { Button, Form, Input, message,Checkbox } from 'antd';
const createForm = Form.create;
const FormItem = Form.Item;
import LoginService from '../app/service/login';
export class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      loginButton: true,
      getCaptcha: false,
      account: '',
      password: '',
      captcha: '',
      currentAccount:'',
      currentPassword:'',

    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCaptcha = this.getCaptcha.bind(this);
    this.getCookie = this.getCookie.bind(this);
  }
  error(text) {
    if(text) {
      message.error(text);
    }
    this.getCaptcha();
  }
  handleSubmit(e) {
    e.preventDefault();
    if(this.state.loginButton == false){return;}
    const self = this;
    this.setState({loginButton:false,account:'',password:'',captcha:''});
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        this.setState({loginButton:true});
        return;
      } else {
        const { account, password, verificode, captcha, remember } = values;
        let thePassword = password.length==32?password:md5(password);
        self.rememberPassword(remember,account,thePassword);
        // 通过长度判断密码不够严谨
        const data = {
          account: account,
          password: thePassword,
          verificode: verificode,
          captcha: captcha,
        };
        LoginService.login(data).then((response)=>{
          window.location.href = '/';
        },(response) => {
          switch (response.status) {
            case 1:
            case 9:
              self.setState({account:response.msg});
              break;
            case 2:
            case 10:
              self.setState({password:response.msg});
              break;
            case 3:
            case 4:
            case 5:
              self.setState({captcha:response.msg});
              break;
            default:
              self.error(response.msg);
              break;
          }
          this.getCaptcha();
        });
      }
    });
  }
  getCookie(name) {
    const domain = document.domain;
    const mng = domain.slice(0,3);
    //域名满足条件,才可获取 cookie
    if(mng == "mng") {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
    }
    return null;
  }
  rememberPassword(remember,account,password) {
    if(remember) {
      let date=new Date();
      date.setTime(date.getTime() + 1000 * 60 * 10080);//过期时间一周
      document.cookie = "user=" + JSON.stringify({account: account, password: password})+
        ";expires=" + date.toGMTString();
    }
  }
  componentWillUpdate(nextProps, nextState) {
    const self = this;
    if(this.captcha && this.state.url !== nextState.url) {
      this.setState({loginButton:true});
      this.captcha = 0;
    }  else if (this.first == false && this.captcha
      && this.state.url == nextState.url) {
      // 两次时间戳结果相等,表示操作太快
      alert('您的操作太快!');
      self.getCaptcha();
    }
    const { getFieldValue } = this.props.form;
    if(!getFieldValue('account')&& this.state.account ){this.setState({account:''})}
    if(!getFieldValue('password')&& this.state.password ){this.setState({password:''})}
    if(!getFieldValue('captcha')&& this.state.captcha ){this.setState({captcha:''})}
  }
  getCaptcha(e) {
    if(e){
      e.preventDefault();
    }
    const url = '/captcha.png';
    var timestamp =new Date().getTime();
    this.captcha = 1;
    this.setState({ url: `${url}?${timestamp}`});
  }
  componentWillMount() {
    this.getCaptcha();
    this.first = true;
    const user = JSON.parse(this.getCookie('user'));
    if(user) {
      this.setState({currentAccount:user.account, currentPassword: user.password});
    }
  }
  handleEnter(event) {
    if(this.state.loginButton) {
      if (event.keyCode==13) {
        this.handleSubmit(event);
      }
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    };
    const accountHelp = this.state.account?{'help':this.state.account,'className':'has-error'}:{};
    const passwordHelp = this.state.password?{'help':this.state.password,'className':'has-error'}:{};
    const captchaHelp = this.state.captcha?{'help':this.state.captcha,'className':'has-error'}:{};
    return (
        <Form horizontal onKeyDown={this.handleEnter.bind(this)}>
          <FormItem {...formItemLayout}
            label="登录账号"
            {...accountHelp}
            >
            {getFieldDecorator('account', {
              rules: [
                { required: true, message: '请输入注册时填写的登录账号' },
              ],
              initialValue: this.state.currentAccount,
            })(
              <Input placeholder="请输入登录账号" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="密码"
            {...passwordHelp}
            >
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: '请输入密码' },
              ],
              initialValue: this.state.currentPassword,
            })(
              <Input type="password" placeholder="请输入密码" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="图形验证码"
            {...captchaHelp}
            >
            {getFieldDecorator('captcha', {
              rules: [
                { required: true, message: '请输入图形验证码' },
              ],
            })(
              <div>
                <Input  placeholder="请输入图形验证码" style={{ width: '60%', marginRight: 8 }}/>
                <img className="captcha"  src={this.state.url} onClick={this.getCaptcha}/>
                <p><a href="#" onClick={this.getCaptcha}>看不清楚? 换一张</a></p>
              </div>
            )}
          </FormItem>
          <FormItem  wrapperCol={{ span: 12, offset: 7 }} style={{ marginBottom: 8 }}>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
            })(
              <Checkbox>记住密码</Checkbox>
            )}
          </FormItem>
          <FormItem wrapperCol={{ span: 12, offset: 7 }}>
            {this.state.loginButton ?
              <Button type="primary" onClick={this.handleSubmit}>登录</Button>
                :
              <Button type="primary" disabled onClick={this.handleSubmit}>登录</Button>
            }
            <p className="reset">
              <a href="/#/reset">忘记密码?</a>
            </p>
          </FormItem>
        </Form>
    );
  }
}

LoginForm.propTypes = {
  children: React.PropTypes.object,
};

LoginForm = createForm()(LoginForm);

const App = React.createClass({
  render() {
    return (<div className="application application-login">
      <h2>
        <img src={require("./WechatIMG130.png")} alt=""/>
      </h2>
      <div className="form">
        <LoginForm />
      </div>
      <div className="copy">
        Copyright &copy; 2017 苏打生活. All Rights Reserved<br/>
        客服电话:4008290029 粤ICP备<a href="http://www.miitbeian.gov.cn">16090794</a>号<br/>
        深圳市华策网络科技有限公司
      </div>
    </div>);
  }
});

export default App;
