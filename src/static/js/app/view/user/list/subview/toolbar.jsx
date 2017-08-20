import React from 'react';
import { Table, Button,Input, Breadcrumb, message } from 'antd';
import { Link, hashHistory } from 'react-router';

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  handleInputChange(e) {
    this.props.handleInputChange(e);
  }
  handleSearch() {
    this.props.handleSearch();
  }
  render() {
    return (
        <div className="toolbar">
          <Link to='/user/edit/new' className="ant-btn ant-btn-primary item">
            添加新运营商
          </Link>
          <Input defaultValue={this.props.user}
                 style={{width:160}}
                 placeholder="请输入运营商或者联系人"
                 onChange={this.handleInputChange.bind(this)}
                 onPressEnter={this.handleSearch.bind(this)}
          />
          <Button type="primary item" onClick={this.handleSearch.bind(this)}>查询</Button>
        </div>
    );
  }
}


App.propTypes = {};

export default App;
