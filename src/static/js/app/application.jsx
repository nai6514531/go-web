import React from "react";
import {Menu} from "antd";
import Sider from "./sider.jsx";
import "./application.less";
import Header from "./header.jsx";

const Application = React.createClass({
  getInitialState() {
    return {
      forceShowSider: false
    };
  },
  showSider() {
    this.setState({
      forceShowSider: true
    });
  },
  hideSider() {
    this.setState({
      forceShowSider: false
    });
  },
  render() {
    const { location, children } = this.props;
    const { forceShowSider } = this.state;
    return (<div className="application">
      <Sider key={1} location={location} forceShow={forceShowSider} onClickClose={this.hideSider} onRedirect={this.hideSider} />
      <Header onHamburgClick={this.showSider} />
      <div className="application-main">
        {children}
      </div>
    </div>);
  }
});

export default Application;
