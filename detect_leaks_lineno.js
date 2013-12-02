var fs = require('fs');
var esprima = require('esprima');
var estraverse = require('estraverse');

var filename = process.argv[2];
console.log('Processing', filename);
var ast = esprima.parse(fs.readFileSync(filename), {loc: true});
var scopeChain = [];
var assignments = [];

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
  if (node.type === 'AssignmentExpression'){
    assignments.push(node);
  }
}

function leave(node){
  if (createsNewScope(node)){
    checkForLeaks(assignments, scopeChain);
    scopeChain.pop();
    assignments = [];
  }
}

function isVarDefined(varname, scopeChain){
  for (var i = 0; i < scopeChain.length; i++){
    var scope = scopeChain[i];
    if (scope.indexOf(varname) !== -1){
      return true;
    }
  }
  return false;
}

function checkForLeaks(assignments, scopeChain){
  for (var i = 0; i < assignments.length; i++){
    var assignment = assignments[i];
    var varname = assignment.left.name;
    if (!isVarDefined(varname, scopeChain)){
      console.log('Leaked global', varname, 
        'on line', assignment.loc.start.line);
    }
  }
}

function createsNewScope(node){
  return node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'Program';
}