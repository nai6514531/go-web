import React from 'react';
import './app.less';
import { Table, Button,Input, Breadcrumb } from 'antd';
import { Link } from 'react-router';
import Device from './self-device.jsx';
import ChildDevice from './child-device.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount() {}
  render() {
    return (
      <section className="view-device-user-list">
        <header>
          <Breadcrumb>
            <Breadcrumb.Item>设备管理</Breadcrumb.Item>
          </Breadcrumb>
        </header>
        <article>
          <div style={{margin:'20px 0px'}}>
            <h3>我的设备</h3>
            <Device/>
          </div>
          <div>
            <h3>已分配设备</h3>
            <ChildDevice/>
          </div>
        </article>
      </section>
    );
  }
}


App.propTypes = {};

export default App;
