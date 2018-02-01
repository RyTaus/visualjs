const Component = require('./component.js');
const d3 = require('d3');

// in pins keep track of edges
class Pin extends Component {
  constructor(pinType) {
    super();
    this.type = pinType;
  }

  baseCanConnect(pin) {
    if (this.direction !== pin.direction) {
      return true;
    }
    throw Pin.Error.direction(this, pin);
  }

  canConnect(pin) {
    return this.baseCanConnect(pin);
  }

  createConnection(pin) {
    if (this.direction === Pin.Direction.IN) {
      if (this.connection) {
        this.connection.connection = null;
      }
    }
    this.update('connection', pin);
  }

  connect(pin) {
    if (this.baseCanConnect(pin) && this.canConnect(pin) && pin.canConnect(this)) {
      this.createConnection(pin);
      pin.createConnection(this);

      return this;
    }
    throw new Error('Cannot Connect Pins');
  }

  init(node, direction, index) {
    this.node = node;
    this.direction = direction;
    this.index = index;
    this.svg = node.svg;
    this.createSvgNode(Pin.Type.toTag[this.type]);
  }

  getOffsets() {
    return {
      x: this.node.transform.x + (this.direction === Pin.Direction.IN ? 10 : 100 - 20),
      y: this.node.transform.y + 10 + (20 * this.index)
    };
  }

  baseRender(d3Node) {
    const self = this;
    d3Node
      .on('mousedown', () => {
        console.log(this.node);
        this.node.canvas.mouse.infocus = self;
      })
      .on('mouseup', () => {
        console.log(this.node.canvas.mouse.infocus);
        if (this.node.canvas.mouse.infocus) {
          this.connect(this.node.canvas.mouse.infocus);
        }
      });

    if (this.connection) {
      console.log(this.connection);
      if (this.direction === Pin.Direction.IN) {
        d3.selectAll(`#edge${this.id}`).remove();
        this.svg.append('polygon')
          .attr('points', `${this.getOffsets().x},${this.getOffsets().y} ${this.connection.getOffsets().x},${this.connection.getOffsets().y}`)
          .classed('line', true)
          .attr('id', `edge${this.id}`);
      }
    }
  }
}

class PinInput extends Pin {
  constructor() {
    super(Pin.Type.INPUT);
  }

  canConnect(pin) {
    if (this.direction === Pin.Direction.IN && pin.type === Pin.Type.Value) {
      return true;
    }
    throw Pin.Error.type(this, pin);
  }

  render() {
    const offset = this.getOffsets(this.node, this.index);
    const node = this.getNode()
      .data([{ pin: this, offset }])
      .attr('x', d => d.offset.x)
      .attr('y', d => d.offset.y)
      .attr('width', 10)
      .attr('height', 10)
      .classed('pin', true)
      .classed('input', true)
      .attr("contentEditable", true)
      .text(function(d) { return d.pin.value })
      .on("keyup", function(d) { d.pin.update('value', d3.select(this).text()) });

    this.baseRender(node);
  }

  setValue(value) {
    this.value = value;
  }

  compile() {
    return this.value;
  }
}

class PinFlow extends Pin {
  constructor() {
    super(Pin.Type.FLOW);
  }

  canConnect(pin) {
    if (pin.type === Pin.Type.FLOW) {
      return true;
    }
    throw Pin.Error.type(this, pin);
  }

  render() {
    const offset = this.getOffsets(this.node, this.index);
    const makePolyString = () => {
      const pair = (x, y) => `${offset.x + x},${offset.y + y}`;

      const start = pair(0, 0);
      return `${start} ${pair(10, 5)} ${pair(0, 10)} ${start}`;
    };

    const node = this.getNode()
      .data([makePolyString()])
      .attr('points', d => d)
      .classed('pin', true)
      .classed('flow', true);

    this.baseRender(node);
  }
}

class PinValue extends Pin {
  constructor() {
    super(Pin.Type.VAL);
  }

  canConnect(pin) {
    if (this.type === Pin.Direction.IN ?
      pin.type === Pin.Type.VAL :
      [Pin.Type.VAL, Pin.Type.INPUT].includes(pin.type)) {
      return true;
    }
    throw Pin.Error.type(this, pin);
  }

  render() {
    const node = this.getNode()
      .data([this.getOffsets(this.node, this.index)])
      .attr('width', 10)
      .attr('height', 10)
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .classed('pin', true)
      .classed('val', true);

    this.baseRender(node);
  }

  compile() {
    // TODO might need to know the type
    return (this.direction === Pin.Direction.IN) ? this.connection.compile() : this.node.compile();
  }
}

Pin.Type = {
  VAL: 'val',
  FLOW: 'flow',
  INPUT: 'input',
  toTag: {
    val: 'rect',
    flow: 'polygon',
    input: 'text'
  }
};

Pin.Direction = {
  IN: 'in',
  OUT: 'out'
};

Pin.Error = {
  type: (a, b) => new Error(`cannot match pin types ${a.type}:${a.direction} with ${b.type}:${b.direction}`),
  direction: (a, b) => new Error(`cannot match pin directions ${a.direction} and ${b.direction}`)
};

module.exports = {
  Pin,
  Flow: PinFlow,
  Value: PinValue,
  Input: PinInput
};
