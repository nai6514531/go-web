import React from 'react';
import './app.less';
import { Table, Button,Input, Breadcrumb,Tabs } from 'antd';
import { Link,hashHistory } from 'react-router';
import Device from './self-device.jsx';
import ChildDevice from '../child-user/app.jsx';
const TabPane = Tabs.TabPane;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultActiveKey:'/device',
    };
  }
  componentWillMount() {
    const defaultActiveKey = this.props.location.pathname;
    this.setState({defaultActiveKey:defaultActiveKey});

  }
  callback(key) {
    this.props.location.pathname = key;
    this.props.location.query='';
    // console.log(this.props.location);
    hashHistory.replace(this.props.location);
  }
  render() {
    return (
      <section className="view-device-user-list">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>设备管理</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <article>
          <Tabs
            onTabClick={this.callback.bind(this)}
            type="card"
            defaultActiveKey={this.state.defaultActiveKey}
          >
            <TabPane tab="我的设备" key="/device">{this.props.children}</TabPane>
            <TabPane tab="已分配设备" key="/device/child-user">{this.props.children}</TabPane>
          </Tabs>
        </article>
      </section>
    );
  }
}


App.propTypes = {};

export default App;
