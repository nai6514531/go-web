import React from 'react';
import { Tabs } from 'antd';
import { Link, hashHistory } from 'react-router';
const TabPane = Tabs.TabPane;


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount() {
  }
  callback(key) {
    // 此处 key 的变化将要根据后续需求再改
    this.props.location.pathname = key;
    this.props.location.query='';
    console.log(this.props.location);
    this.props.replaceLocation(this.props.location);
  }
  render() {
    const tabs = this.props.tabs;
    return (
          <Tabs
            onTabClick={this.callback.bind(this)}
            type="card"
            activeKey={this.props.defaultTab}
          >
            {tabs.map(function (item) {
              return <TabPane tab={item.title} key={item.url}></TabPane>
            })}
          </Tabs>
    );
  }
}


App.propTypes = {};

export default App;
