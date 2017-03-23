import React from 'react';
import { Tabs } from 'antd';
import { Link, hashHistory } from 'react-router';
const TabPane = Tabs.TabPane;


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  callback(key) {
    // this.props.location.pathname = key;
    // this.props.location.query='';
    // this.props.replaceLocation(this.props.location);
    // const search = this.props.location.search;
    window.location.href = '#'+key;
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
