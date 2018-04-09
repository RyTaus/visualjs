class Type {
  constructor(name, color = 'black') {
    this.name = name;
    this.color = color;
  }

  equals(other) {
    return this.name === other.name;
  }

  toString() {
    return this.name;
  }
}

class StringLit extends Type {
  constructor() {
    super('String', 'blue');
  }
}

class NumLit extends Type {
  constructor() {
    super('Number', 'green');
  }
}

class BoolLit extends Type {
  constructor() {
    super('Boolean', 'red');
  }
}

class List extends Type {
  constructor(elementType) {
    super('List', elementType.color);
    this.elementType = elementType;
  }

  toString() {
    return `List<${this.elementType.toString()}>`;
  }
}

class Map extends Type {
  constructor(structName, inType, outType) {
    super('Map', 'yellow');
    this.inType = inType;
    this.outType = outType;
  }

  toString() {
    return `Map<${this.inType.toString()} : ${this.outType.toString()}}>`;
  }
}

class Struct extends Type {
  constructor(structName, propDict) {
    super(structName, 'orange');
    this.props = propDict;
  }

  getPropType(propName) {
    return this.props[propName];
  }

  toString() {
    return `${this.name}{${this.props}}`;
  }
}

class Func extends Type {
  constructor(inputTypeDict, returnType) {
    super('Function', 'purple');
    this.returnType = returnType;
    this.inputTypeDict = inputTypeDict;
  }

  getInputType(name) {
    return this.inputTypeDict[name];
  }

  toString() {
    return `Function<${this.elementType.toString()}>`;
  }
}

module.exports = {
  Type, StringLit, NumLit, BoolLit, List, Struct, Func, Map
};
