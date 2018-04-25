import React, { Component } from 'react';

class TextInput extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    return (
      <input
        className="pin"
        type="text"
        onMouseUp={this.props.onMouseUp}
        onChange={this.props.onChange}
        size={1.5}
        style={{ borderColor: this.props.color }}
        value={this.props.value}
      />
    );
  }
}

export default TextInput;
