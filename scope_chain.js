var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');

var filename = process.argv[2];
console.log('Processing', filename);
var ast = esprima.parse(fs.readFileSync(filename));
var scopeChain = [];

estraverse.traverse(ast, {
  enter: enter,
  leave: leave
});

function enter(node){
  if (createsNewScope(node)){
    scopeChain.push([]);
  }
  if (node.type === 'VariableDeclarator'){
    var currentScope = scopeChain[scopeChain.length - 1];
    currentScope.push(node.id.name);
  }
}

function leave(node){
  if (createsNewScope(node)){
    var currentScope = scopeChain.pop();
    printScope(currentScope, node);
  }
}

function printScope(scope, node){
  var varsDisplay = scope.join(', ');
  if (node.type === 'Program'){
    console.log('Variables declared in the global scope:', 
      varsDisplay);
  }else{
    if (node.id && node.id.name){
      console.log('Variables declared in the function ' + node.id.name + '():',
        varsDisplay);
    }else{
      console.log('Variables declared in anonymous function:',
        varsDisplay);
    }
  }
}

function createsNewScope(node){
  return node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'Program';
}