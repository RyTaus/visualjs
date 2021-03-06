import Pin from './../../models/pin';
import Node from './../../models/node';

import { FLOW } from './../../type/type-type';

import parser, { parsePin } from './parser';

const defaultGeneration = string => (node) => {
  let str = string;
  Object.keys(node.inPins).forEach((key) => {
    if (str.includes(`{${key}}`)) {
      const replacement = node.inPins[key].generate();
      str = str.replace(new RegExp(`{${key}}`, 'g'), replacement);
    }
  });
  Object.keys(node.outPins)
    .filter(key => (node.outPins[key].type.name === FLOW && key !== 'next'))
    .forEach((key) => {
      const replacement = node.outPins[key].generate();
      str = str.replace(new RegExp(`{${key}}`, 'g'), replacement);
    });
  return str;
};

export default class NodeFactory {
  constructor(name) {
    this.name = name;
    this.in = [];
    this.out = [];
    this.generationString = null;
    this.declType = null;
  }

  setDeclType(type) {
    this.declType = type;
    return this;
  }

  addPin(direction, name, type, prop) {
    this[direction].push({
      name, type, direction, prop,
    });
    return this;
  }

  // a function that takes in a node, OR a string with {pinName} to be replaced
  generateFunction(val) {
    if (typeof val === 'function') {
      this.genFun = val;
    } else {
      this.genFun = defaultGeneration(val);
    }
    return this;
  }

  // returns true if this can connect to pin
  filter(pin) {
    const direction = { in: 'out', out: 'in' }[pin.direction];
    if (this.data) {
      return Object.keys(this.data[direction]).some((key) => {
        const pinData = this.data[direction][key];
        const p = parsePin('', pinData, direction, 0);
        try {
          return p.canConnect(pin);
        } catch (e) {
          return false;
        }
      });
    }
    return this[direction].some((pinData) => {
      const p = new Pin(pinData.name, pinData.type, pinData.direction, 0, pinData.prop);
      try {
        return p.canConnect(pin);
      } catch (e) {
        return false;
      }
    });
  }

  pureData(data) {
    this.data = data;
    return this;
  }

  export(x, y, script) {
    if (this.data) {
      const {
        name,
        inPins,
        outPins,
        compile,
      } = parser(this.name, this.data);
      return new Node(name, x, y, inPins, outPins, defaultGeneration(compile), script);
    }
    const inPins = {};
    const outPins = {};

    this.in.forEach((pin, i) => {
      inPins[pin.name] = new Pin(pin.name, pin.type, pin.direction, i, pin.prop);
    });

    this.out.forEach((pin, i) => {
      outPins[pin.name] = new Pin(pin.name, pin.type, pin.direction, i, pin.prop);
    });

    return new Node(this.name, x, y, inPins, outPins, this.genFun, script, this.declType);
  }
}
