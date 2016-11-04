import React from "react";
import {Menu} from "antd";
import Sider from "./sider.jsx";
import "./application.less";
import Header from "./header.jsx";

const Application = React.createClass({
  render() {
    const { location, children } = this.props;
    return (<div className="application">
      <Sider location={location} />
      <Header/>
      <div className="application-main">
        <section className="content">
          {children}
        </section>
      </div>
    </div>);
  }
});

export default Application;
