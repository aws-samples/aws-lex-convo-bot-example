(function() {
  var esprima, falafel, jsonLint;

  esprima = typeof module === 'undefined' ? window.esprima : require('esprima');

  falafel = typeof module === 'undefined' ? window.falafel : require('free-falafel');

  jsonLint = function(src) {
    var ast, breadthFirstFunc, commaFixRegex, comment, createError, depthFirstFunc, errors, literalRegex, res, rootExpr, wrappedSrc, _i, _len, _ref;
    if (!src || /^\s*$/.test(src)) {
      return {
        json: null,
        errors: [
          {
            lineNumber: 1,
            column: 1,
            description: "An empty string is not valid Json",
            status: "crash"
          }
        ]
      };
    }
    src = src.replace(/[\u0000-\u001f]/g, function(c) {
      return JSON.stringify(c).slice(1, -1);
    });
    wrappedSrc = "(function(){return " + src + '\n})();';
    errors = [];
    try {
      ast = esprima.parse(wrappedSrc, {
        range: true,
        tolerant: true,
        loc: true,
        raw: true,
        comment: true
      });
    } catch (err) {
      err.status = "crash";
      if (err.index >= wrappedSrc.length - 7) {
        if (err.lineNumber >= wrappedSrc.match(/\r\n?|\n/g).length + 1) {
          err.lineNumber--;
        }
        err.column = 1;
        err.description = "Invalid Json. Did you forget a close bracket?";
      }
      errors.push(err);
      return {
        errors: errors,
        json: null
      };
    }
    literalRegex = /^(?:-?(?=[1-9]|0(?!\d))\d+(\.\d+)?([eE][+-]?\d+)?|true|false|null|"([^"\\]|(?:\\["\\\/bfnrt])|(?:\\u[\][0-9a-f]{4}))*")$/;
    commaFixRegex = /,(?=\s*[\]}]\s*$)/;
    createError = function(node, status, desc) {
      errors.push({
        lineNumber: node.loc.start.line,
        column: node.loc.start.column,
        description: desc,
        status: status
      });
      if (node.loc.start.line === 1) {
        return errors[errors.length - 1].column -= 19;
      }
    };
    _ref = ast.comments;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      comment = _ref[_i];
      createError(comment, "correctable", "Comments are not valid in Json");
    }
    rootExpr = null;
    breadthFirstFunc = function(node) {
      var key;
      if (rootExpr === null) {
        node.valid = true;
      }
      if (rootExpr === null && node.type === 'ReturnStatement') {
        rootExpr = node.argument;
      }
      if (node.valid != null) {
        return;
      }
      if (!node.parent.valid) {
        node.valid = false;
        return;
      }
      switch (node.type) {
        case "Literal":
          if (literalRegex.test(node.raw)) {
            return node.valid = true;
          } else {
            node.valid = false;
            switch (node.raw[0]) {
              case "'":
                createError(node, "correctable", "Json strings must use double quotes");
                break;
              case "\"":
                createError(node, "correctable", "Invalid Json string");
                break;
              default:
                createError(node, "correctable", "Invalid Json number");
            }
            return node.correct = JSON.stringify(node.value);
          }
          break;
        case "UnaryExpression":
          if (node.operator === "-" && node.argument.type === "Literal") {
            return node.valid = true;
          }
          break;
        case "ObjectExpression":
          node.valid = true;
          return node.props = {};
        case "ArrayExpression":
          return node.valid = true;
        case "Property":
          node.valid = true;
          key = node.key;
          if (key.type === "Identifier") {
            createError(key, "correctable", "Keys must be double quoted in Json. Did you mean \"" + key.name + "\"?");
            key.valid = false;
            return key.correct = JSON.stringify(key.name);
          } else if (key.type === "Literal" && typeof key.value === "number") {
            createError(key, "correctable", "Keys must be double quoted in Json. Did you mean \"" + key.raw + "\"?");
            key.valid = false;
            return key.correct = JSON.stringify(key.raw);
          }
          break;
        case "Identifier":
          node.valid = false;
          createError(node, "guessable", "An identifier is not a valid Json element. Did you mean \"" + node.name + "\"?");
          return node.correct = JSON.stringify(node.name);
        case "CallExpression":
          node.valid = false;
          return createError(node, "fail", "You can not make function calls in Json. Do you think I am a fool?");
        case "Line":
        case "Block":
          node.valid = false;
          return node.correct = "";
        default:
          node.valid = false;
          return createError(node, "fail", "A \"" + node.type + "\" is an invalid Json element.");
      }
    };
    depthFirstFunc = function(node) {
      var key;
      if (node.type === "Property") {
        key = node.key;
        if (node.parent.props[key.correct || key.raw] != null) {
          node.valid = false;
          node.correct = "";
          createError(node, "guessable", "Duplicate key in Json object. The key " + (key.correct || key.raw) + " is already present.");
        } else {
          node.parent.props[key.correct || key.raw] = node;
        }
      }
      if (node.type === "ObjectExpression" || node.type === "ArrayExpression") {
        node.update(node.source().replace(commaFixRegex, ""));
      }
      if (node.valid) {
        return;
      } else if (node.correct != null) {
        node.update(node.correct);
      } else {
        node.update("null");
      }
    };
    res = falafel(wrappedSrc, {
      ast: ast
    }, depthFirstFunc, breadthFirstFunc).toString();
    res = res.substring(19, res.length - 6);
    return {
      json: res,
      errors: errors
    };
  };

  if (typeof module === 'undefined') {
    window.durableJsonLint = jsonLint;
  } else {
    module.exports = jsonLint;
  }

}).call(this);
