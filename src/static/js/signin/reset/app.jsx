import React, { PropTypes } from 'react';
import './app.less';
import { Button, Form, Input, message, Checkbox, Steps, Icon } from 'antd';
const Step = Steps.Step;

import VarityForm from './verify_form.jsx'
import ResetForm from './reset_form.jsx';

const steps = [{
  title: '验证身份',
}, {
  title: '重置密码',
}, {
  title: '完成',
}];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      account: '',
      code: '',
    };
  }
  setValues(values) {
    this.setState({
      account: values.account || '',
      code: values.code || '',
    })
  }
  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }
  show() {
    let show = '';
    const { current } = this.state;
    if(current == 0) {
      show = <VarityForm account={this.state.account}
                         setValues={this.setValues.bind(this)}
                         next={this.next.bind(this)}/>
    } else if (current == 1) {
      show = <ResetForm account={this.state.account} 
                        code={this.state.code}
                        next={this.next.bind(this)} 
                        prev={this.prev.bind(this)}/>
    } else if(current == 2) {
      show = <div className="result-text"><h2><Icon type="check-circle" />新密码设置成功！</h2>
          <p>请牢记您的新密码。<a href="#">返回登录</a></p>
        </div>
    }
    return show;
  }
  render() {
    const { current } = this.state;
    return (
      <div className="reset-view">
        <Steps current={current}>
          {steps.map(item => <Step key={item.title} title={item.title} />)}
        </Steps>
        <div className="steps-content">
          {this.show()}
        </div>
      </div>
    );
  }
}



export default App;
