import React, { Component } from 'react';

import { Button } from 'react-bootstrap';

class Header extends Component {
  constructor(props) {
    super(props);
    this.name = 'header';
  }

  render() {
    return (
      <div>
        <ul>
          <li><button> Save </button></li>
          <li><button> Load </button></li>
          <li><button> Compile </button></li>
          <li><button onClick={this.props.generate}> Generate </button></li>
        </ul>
      </div>
    );
  }
}

export default Header;
