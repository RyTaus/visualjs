const Snap = require('snapsvg');


const { Node, Pin, Edge } = require('./nodes.js');

const SVG = document.getElementsByClassName('canvas')[0];

let n = new Node('Test', [0, 1, 4, 8], 50, 80, [new Pin(), new Pin()], [new Pin()]);

console.log(n);
n.draw(Snap(SVG));