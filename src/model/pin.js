class Pin {
  constructor(pinType) {
    this.pinType = pinType;
    this.connections = [];
  }

  initialize(node, direction) {
    this.node = node;
    this.direction = direction;
    return this;
  }

  canConnect(pin) {
    return (this.direction !== pin.direction) &&
            this.pinType === pin.pinType &&
            !this.connections.includes(pin);
  }

  connect(pin) {
    if (this.canConnect(pin)) {
      this.createConnection(pin);
      pin.createConnection(this);
    }
    return this;
  }

  removeConnection(pin) {
    this.connections.splice(this.connections.indexOf(pin), 1);
    return this;
  }

  createConnection(pin) {
    let poppedConnection = null;
    if (this.direction === Pin.direction.in || this.type === Pin.type.flow) {
      if (this.connections.length > 0) {
        poppedConnection = this.connections[0];
        this.connections[0].removeConnection(this);
      }
    }
    this.connections.push(pin);
    return poppedConnection;
  }
}

class Flow extends Pin {
  /**
  * isNext defines whether or not it is the next statement or expression in the chain.
  */
  constructor(isNext = true) {
    super(Pin.type.flow);
    this.isNext = isNext;
  }

  compile() {
    return `${this.pinType}`;
  }
}

class Value extends Pin {
  constructor() {
    super(Pin.type.value)
  }

  compile() {
    return this.direction === Pin.direction.in ?
      this.connections[0].compile() :
      this.node.compile();
  }
}

/**
* Different types of inputs will test valid input differently and slightly change compile result,
* Strings will surround with "" for example
*/
class Input extends Pin {
  constructor() {
    super(Pin.type.input);
    this.value = '';
  }

  setValue(value) {
    this.value = value;
    return this;
  }

  compile() {
    return this.value;
  }
}




Pin.direction = Object.freeze({
  in: 'in',
  out: 'out'
});

Pin.type = Object.freeze({
  flow: 'flow',
  input: 'input',
  value: 'value'
});

module.exports = {
  Flow,
  Value,
  Input
};