const Component = require('./component.js');
const d3 = require('d3');
const Event = require('./event.js');


class ViewPin extends Component {
  constructor(pin, index, viewNode) {
    super(viewNode.canvas);
    this.isPin = true;
    this.viewNode = viewNode;
    this.pin = pin;
    pin.view = this;
    this.index = index;
    // this.connections = [];
  }

  getPosition() {
    return {
      x: this.pin.node.x + (this.pin.direction === 'in' ? 10 : 100 - 20),
      y: this.pin.node.y + 15 + (15 * this.index)
    };
  }

  initialize() {
    super.initialize();
    const { pin } = this;
    const { node } = pin;
    this.svgNode
      .classed('pin', true)
      .call(d3.drag()
        .on('start', () => {
          this.viewNode.canvas.startEvent(pin, Event.dragPin);
          d3.select('svg').append('line').classed('drawingline', true);
        })
        .on('drag', () => {
          const position = this.getPosition();
          d3.select('.drawingline')
            .attr('x1', position.x)
            .attr('y1', position.y)
            .attr('x2', d3.mouse(this.svg.node())[0])
            .attr('y2', d3.mouse(this.svg.node())[1]);
        })
        .on('end', () => {
          d3.select('.drawingline').remove();
          if (this.viewNode.canvas.currentEvent.event === Event.dragPin
            && this.viewNode.canvas.hovered().pin !== this.pin) {

            console.log(this.viewNode.canvas.hovered());
            const otherPin = this.viewNode.canvas.hovered().pin;
            pin.connect(otherPin);
            this.viewNode.canvas.stopEvent();
            this.render();
            otherPin.view.render();
          } else {
            this.viewNode.canvas.generateNodeSearcher(this.pin);
          }
        })
      );
  }

  render() {
    const { pin } = this;

    if (pin.connections.length > 0 && pin.direction === 'in') {
      d3.selectAll(`#edge${this.id}`).remove();

      const start = this.getPosition();
      const end = pin.connections[0].view.getPosition();

      this.svg.append('line')
        .attr('id', `edge${this.id}`)
        .classed('line', true)
        .classed(pin.pinType, true)
        .attr('x1', start.x)
        .attr('y1', start.y)
        .attr('x2', end.x)
        .attr('y2', end.y);
    }
  }
}

class ViewPinFlow extends ViewPin {
  constructor(pin, index, svg) {
    super(pin, index, svg);
    this.svgNode = this.svg.append('polygon').attr('id', this.id).classed('flow', true);
    this.initialize();
  }

  render() {
    super.render();
    const position = this.getPosition();
    const makePolyString = () => {
      const pair = (x, y) => `${position.x + x},${position.y + y}`;

      const start = pair(0, 0);
      return `${start} ${pair(10, 5)} ${pair(0, 10)} ${start}`;
    };

    this.svgNode
      .attr('points', makePolyString());
  }
}

class ViewPinVal extends ViewPin {
  constructor(pin, index, svg) {
    super(pin, index, svg);
    this.svgNode = this.svg.append('rect').attr('id', this.id).classed('val', true);
    this.initialize();
  }

  initialize() {
    super.initialize();
    this.svgNode
      .attr('width', 10)
      .attr('height', 10);
  }


  render() {
    super.render();
    const position = this.getPosition();
    this.svgNode
      .attr('x', position.x)
      .attr('y', position.y);
  }
}

class ViewPinInput extends ViewPin {
  constructor(pin, index, svg) {
    super(pin, index, svg);
    this.svgNode = this.svg.append('rect').classed('inputbg', true).attr('id', `${this.id}_border`);
    this.text = this.svg.append('text').attr('id', `${this.id}_text`);

    this.initialize();
  }

  initialize() {
    this.svgNode
      .on('mouseenter', () => {
        this.fileView.focus(this);
      });

    this.svgNode
      .attr('width', 40)
      .attr('height', 12)
      .on('click', () => {
        this.svgNode.classed('focus', true);
        this.viewNode.canvas.startEvent(this, 'editText');
        d3.event.stopPropagation();
      });
  }

  processInput(d3Event) {
    console.log(d3Event);
    this.pin.value = ViewPinInput.update(this.pin.value, d3Event.key)
    this.text.text(this.pin.value);
  }

  render() {
    super.render();
    const position = this.getPosition();

    this.svgNode
      .attr('x', position.x)
      .attr('y', position.y);

    this.text
      .attr('x', position.x)
      .attr('y', position.y + 10)
      .text(this.pin.value);
  }
}

ViewPinInput.update = (string, key) => {
  const result = string;
  if (key === 'Backspace') {
    return result.slice(0, -1);
  } else if ('0123456789'.includes(key)) {
    return result + key;
  } else if (key === '-' && result.length === 0) {
    return '-';
  } else if (key === '.' && !result.includes('.')) {
    return result + key;
  }
  return result;
};

module.exports = {
  pin: ViewPin,
  flow: ViewPinFlow,
  value: ViewPinVal,
  input: ViewPinInput
};