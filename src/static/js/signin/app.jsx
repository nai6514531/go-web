import React, { PropTypes } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import './app.less';

const LoginForm = Form.create()(React.createClass({
  login(e) {
    const { username, password } = this.props.form.getFieldsValue();
    e.preventDefault();
    // 替换成你的中后台登录接口地址
    fetch('/passport/api/login', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // 替换成你的中后台登录接口参数
      body: JSON.stringify({
        username: username,
        password: password
      }),
      credentials: 'same-origin'
    }).then(function (response) {
      if (!response.ok) {
        return response.text().then(function (text) {
          alert(text);
        });
      }
      // 替换成你的中后台首页地址
      window.location.href = '/admin';
    });
  },
  render() {
    const { getFieldProps } = this.props.form;
    return (<Form horizontal onSubmit={this.login}>
      <Form.Item>
        <Input placeholder="用户名" required
          {...getFieldProps('username')} />
      </Form.Item>
      <Form.Item>
        <Input type="password" placeholder="密码" required
          {...getFieldProps('password')} />
      </Form.Item>
      <Form.Item>
        <Input placeholder="验证码" required
          {...getFieldProps('code')} style={{ width: '60%', marginRight: 8 }}/>
        <img className="codeImg" src={require('./logo_mz.jpg')} />
      </Form.Item>
      <div className="submit">
        <Button type="primary" size="large" htmlType="submit">登录</Button>
      </div>
    </Form>);
  }
}));

const App = React.createClass({
  render() {
    return (<div className="application application-login">
      <h2>
        <img src={require('./logo_mz.jpg')} />
        <p>卖座影院登录系统</p>
      </h2>
      <div className="form">
        <LoginForm />
      </div>
    </div>);
  }
});

export default App;
