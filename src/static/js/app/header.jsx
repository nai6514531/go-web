import React from "react";
import {Menu, Button, Icon} from "antd";

const Header = React.createClass({
  propTypes: {
    onHamburgClick: React.PropTypes.func
  },
  getDefaultProps: function () {
    return {
      onHamburgClick: function () {}
    };
  },
  logout() {
    let boo = confirm('确认退出登录吗?');
    if (!boo) {
      return false;
    }
    fetch('/api/signout', {
      method: 'get',
      credentials: 'same-origin'
    }).then(response=>response.json())
      .then(function (data) {
        if (data && data.status && parseInt(data.status.substr(-2)) == 0) {
          window.location.reload();
        } else {
          alert(data.msg || '系统异常,请重试!')
        }
      });
  },
  onClick(item) {
    if (item.key.includes('logout')) {
      return this.logout();
    }
    if (/^#|\//.test(item.key)) {
      window.location.href = item.key;
    }
  },
  render() {
    const {location} = this.props;
    const menus = USER.menu || [];
    return (<div className="application-header">
      <span className="hamburg">
        <Button type="ghost" icon="bars" onClick={this.props.onHamburgClick} />
      </span>
      <div className="right">
        <span className="avatar">
          <img src="static/img/app/a5.jpg" alt="" />
        </span>
        <span className="name">
          {USER.name}, 您好!
        </span>
        <span className="logout">
          <Icon type="logout" onClick={this.logout} />
        </span>
      </div>
    </div>)
  }
});

export default Header;
