import React, { Component } from 'react';

import Pin from './pin';
import Size from './../utils/sizes';


class Node extends Component {
  constructor(props) {
    super(props);

    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  handleMouseDown(evt) {
    this.coords = {
      x: evt.pageX,
      y: evt.pageY,
    };
    document.addEventListener('mousemove', this.handleMouseMove);
    evt.preventDefault();
    evt.stopPropagation()
  }

  handleMouseMove(evt) {
    const xDiff = this.coords.x - evt.pageX;
    const yDiff = this.coords.y - evt.pageY;

    this.coords.x = evt.pageX;
    this.coords.y = evt.pageY;

    this.props.node.x -= xDiff * (1 / window.frame.state.zoom);
    this.props.node.y -= yDiff * (1 / window.frame.state.zoom);
    window.frame.forceUpdate();

    evt.preventDefault();
  }

  handleMouseUp() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    this.coords = {
      x: 0,
      y: 0,
    };
  }

  render() {
    const { node } = this.props;
    const { x, y } = node;
    return (
      <g>
        <rect
          className="node"
          x={x}
          y={y}
          width={Size.Node.width}
          height={Size.Node.topLabel + Size.Node.botMargin + (Math.max(Object.keys(node.inPins).length, Object.keys(node.outPins).length) * Size.Pin.perPin)}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onDoubleClick={this.handleDoubleClick}
        />
        <rect
          className="node node-label-bg"
          x={x + 1}
          y={y + 1}
          width={Size.Node.width - 2}
          height={Size.Node.topLabel - 7}
        />
        <text
          className="node-label"
          y={y + Size.Pin.width}
          x={x + (Size.Node.width / 2)}
          width={Size.Node.width}
          textAnchor="middle"
        >
          {node.name}
        </text>
        {Object.keys(node.inPins).map((pin, i) => (<Pin pin={node.inPins[pin]} x={x} y={y} index={i} />))}
        {Object.keys(node.outPins).map((pin, i) => (<Pin pin={node.outPins[pin]} x={x} y={y} index={i} />))}
      </g>
    );
  }
}

class BlackBoxNode extends Node {
  constructor(props) {
    super(props);
    this.type = 'bb';
    this.className = 'node bb-node';
  }

  handleDoubleClick(evt) {
    console.log('bb node clicked');
  }
}



export { Node, BlackBoxNode };
export default Node;
