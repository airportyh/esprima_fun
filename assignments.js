var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');

var filename = process.argv[2];
console.log('Processing', filename);
var ast = esprima.parse(fs.readFileSync(filename));
estraverse.traverse(ast, {
  enter: function(node){
    if (node.type === 'AssignmentExpression'){
      console.log('Encountered assignment to', node.left.name);
    }
  }
});