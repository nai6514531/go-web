import React from 'react';
import {Breadcrumb} from 'antd';
import { Link } from 'react-router';

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const items = this.props.items;
    return (
          <Breadcrumb>
            {items.map((item,key)=>{
              return key!==items.length-1?
                <Breadcrumb.Item key={key}><Link to={item.url}>{item.title}</Link></Breadcrumb.Item>:
                <Breadcrumb.Item key={key}>{item.title}</Breadcrumb.Item>
            })}
          </Breadcrumb>
    );
  }
}

App.propTypes = {};

export default App;
