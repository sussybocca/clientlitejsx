const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const chalk = require('chalk');

// CLJ Language syntax mappings (preserves your exact syntax)
const cljSyntaxMap = {
  // Your exact variable declarations
  'constraint': 'const',
  'let me': 'let',
  'variable': 'var',
  
  // Your exact function declarations
  'function = name': 'function',
  'method = name': 'function',
  'action = name': 'function',
  
  // Your exact JSX transformations
  'give value of': 'value=',
  'give of': '=',
  'and =': ':',
  'of': ':',
  'payload: of': 'payload:',
  
  // Your exact style transformations
  '= style of Color of Blue': 'style=',
  'minimalHeight': 'minHeight',
  'pixels': 'px',
  'by the way': '//',
  
  // Your exact style properties
  'pad': 'padding',
  'marg': 'margin',
  'mouse': 'cursor',
  'AroundRadius': 'borderRadius',
  'Around': 'border',
  'BC': 'backgroundColor',
  'c': 'color',
  'trans': 'transition',
  'boxSh': 'boxShadow',
  'transf': 'transform',
  'FS': 'fontSize',
  's': 'solid',
  
  // Your exact style shorthands
  'BS': 'buttonStyle',
  'activeBS': 'activeButtonStyle',
  'CS': 'cardStyle',
  'Is': 'inputStyle',
  
  // Your exact provider transformations
  'ThemeChangeContext.Provider': 'ThemeContext.Provider',
  'UseContextOnProvided.Provider': 'UserContext.Provider',
  'Noti.Provider': 'NotificationContext.Provider',
  'Modal.Dispatch.Provider': 'ModalContext.Provider',
  
  // Your exact component names
  'ThreeBackGrounds = 3': 'ThreeDBackground',
  'ThreeBackGrounds': 'ThreeDBackground',
  
  // Your exact operators
  'trigger: on aleart theme change': 'toggleTheme',
  'theme of': 'theme ===',
  'Theme trigger: on aleart theme change': 'toggleTheme',
  
  // Your exact symbols
  '$$$ ====================': '// ====================',
  '$$$': '//',
  
  // Your exact style patterns
  'pixels and': 'px',
  'at': '',
  'and': '',
  'by the way': '//'
};

// Transform CLJ syntax to standard JSX (preserves your syntax)
function transformCLJToJSX(code) {
  let transformed = code;
  
  // Apply your exact syntax mappings
  for (const [cljSyntax, jsSyntax] of Object.entries(cljSyntaxMap)) {
    const regex = new RegExp(cljSyntax.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    transformed = transformed.replace(regex, jsSyntax);
  }
  
  // Fix your specific patterns
  transformed = transformed.replace(/payload: of \{/g, 'payload: {');
  transformed = transformed.replace(/\.Provider give/g, '.Provider');
  transformed = transformed.replace(/value of \{/g, 'value={');
  transformed = transformed.replace(/\{\{/g, '{{');
  transformed = transformed.replace(/\}\}/g, '}}');
  
  // Fix your constraint destructuring
  transformed = transformed.replace(/constraint\s+\[([^\]]+)\]\s*=/g, 'const [$1] =');
  transformed = transformed.replace(/constraint\s+{([^}]+)}\s*=/g, 'const {$1} =');
  transformed = transformed.replace(/constraint\s+(\w+)\s*=/g, 'const $1 =');
  
  // Fix your style object transformations
  transformed = transformed.replace(/'(\d+)pixels'/g, "'$1px'");
  transformed = transformed.replace(/"(\d+)pixels"/g, '"$1px"');
  transformed = transformed.replace(/(\d+)pixels/g, '$1px');
  
  // Fix your by the way comments
  transformed = transformed.replace(/by the way/g, '//');
  
  // Fix your shorthand style declarations
  transformed = transformed.replace(/constraint BS = {/g, 'const buttonStyle = {');
  transformed = transformed.replace(/constraint activeBS = {/g, 'const activeButtonStyle = {');
  transformed = transformed.replace(/constraint CS = {/g, 'const cardStyle = {');
  transformed = transformed.replace(/constraint Is = {/g, 'const inputStyle = {');
  
  // Fix spread operator
  transformed = transformed.replace(/\.\.\.BS/g, '...buttonStyle');
  
  // Fix your template literals
  transformed = transformed.replace(/`([^`]*)`/g, '`$1`');
  
  // Fix your arrow functions
  transformed = transformed.replace(/=>\s*{/g, '=> {');
  
  // Fix your JSX self-closing tags
  transformed = transformed.replace(/<(\w+)\s*=\s*(\d+)\s*\/>/g, '<$1 />');
  transformed = transformed.replace(/<(\w+)\s*=\s*(\d+)\s*>/g, '<$1>');
  
  return transformed;
}

// Parse and validate your CLJ syntax
function parseCLJ(code, filename = 'source.clj') {
  try {
    const jsxCode = transformCLJToJSX(code);
    
    const ast = parser.parse(jsxCode, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    return { ast, jsxCode, error: null };
  } catch (error) {
    return { ast: null, jsxCode: null, error };
  }
}

// Generate detailed error messages for CLJ syntax
function getDetailedError(error, code) {
  const errorMsg = error.message;
  let line = null;
  let column = null;
  
  // Extract line and column from error
  const match = errorMsg.match(/\((\d+):(\d+)\)/);
  if (match) {
    line = parseInt(match[1]);
    column = parseInt(match[2]);
  }
  
  // If no match, try another pattern
  if (!line) {
    const lineMatch = errorMsg.match(/position (\d+)/);
    if (lineMatch && code) {
      const pos = parseInt(lineMatch[1]);
      const lines = code.split('\n');
      let currentPos = 0;
      for (let i = 0; i < lines.length; i++) {
        currentPos += lines[i].length + 1;
        if (currentPos > pos) {
          line = i + 1;
          column = pos - (currentPos - lines[i].length - 1);
          break;
        }
      }
    }
  }
  
  // Get the actual error line from code
  let errorLine = '';
  let codeContext = '';
  if (line && code) {
    const lines = code.split('\n');
    errorLine = lines[line - 1] || '';
    
    // Build code context (3 lines before and after)
    const startLine = Math.max(0, line - 4);
    const endLine = Math.min(lines.length, line + 3);
    const contextLines = [];
    for (let i = startLine; i < endLine; i++) {
      const lineNumber = i + 1;
      const prefix = lineNumber === line ? '➡️  ' : '   ';
      const marker = lineNumber === line && column ? ' '.repeat(prefix.length + String(lineNumber).length + 2 + column) + '^' : '';
      contextLines.push(`${prefix}${String(lineNumber).padStart(4)} | ${lines[i]}`);
      if (marker) contextLines.push(marker);
    }
    codeContext = contextLines.join('\n');
  }
  
  // Determine error type and suggestion
  let suggestion = '';
  if (errorMsg.includes('Unexpected token')) {
    if (errorLine.includes('constraint')) {
      suggestion = 'Use "constraint" instead of "const" - it will be converted automatically';
    } else if (errorLine.includes('give value of')) {
      suggestion = 'Use "give value of" instead of "value=" - it will be converted automatically';
    } else if (errorLine.includes('payload: of')) {
      suggestion = 'Use "payload: of" instead of "payload: {" - it will be converted automatically';
    } else if (errorLine.includes('theme of')) {
      suggestion = 'Use "theme of" instead of "theme ===" - it will be converted automatically';
    } else if (errorLine.includes('=') && !errorLine.includes('==')) {
      suggestion = 'Check your assignment syntax. Use "constraint x = value"';
    } else if (errorLine.includes('{') && !errorLine.includes('}')) {
      suggestion = 'Missing closing brace "}"';
    } else if (errorLine.includes('(') && !errorLine.includes(')')) {
      suggestion = 'Missing closing parenthesis ")"';
    } else {
      suggestion = 'Check for missing brackets, parentheses, or quotes';
    }
  } else if (errorMsg.includes('Unexpected end of input')) {
    suggestion = 'Missing closing bracket, parenthesis, or brace. Check your code structure.';
  } else if (errorMsg.includes('Unknown token')) {
    suggestion = 'Invalid character detected. Check for special characters or unclosed strings.';
  } else {
    suggestion = 'Check your CLJ syntax near the indicated line';
  }
  
  return {
    line,
    column,
    errorLine,
    codeContext,
    suggestion,
    rawMessage: errorMsg
  };
}

// Display detailed error in console
function showCLJError(error, code, filename) {
  const details = getDetailedError(error, code);
  
  console.log(chalk.red('\n' + '═'.repeat(70)));
  console.log(chalk.red.bold('  ❌ CLJ COMPILATION ERROR'));
  console.log(chalk.red('═'.repeat(70)));
  console.log(chalk.white(`\n  📁 File: ${chalk.cyan(filename)}`));
  
  if (details.line) {
    console.log(chalk.white(`  📍 Line: ${chalk.yellow(details.line)}${details.column ? `, Column: ${chalk.yellow(details.column)}` : ''}`));
  }
  
  console.log(chalk.red(`\n  ❌ ${details.rawMessage}\n`));
  
  if (details.codeContext) {
    console.log(chalk.yellow('  📝 Code context:\n'));
    console.log(chalk.white(details.codeContext));
    console.log();
  }
  
  console.log(chalk.magenta(`  💡 Suggestion: ${details.suggestion}\n`));
  
  // Common fixes
  console.log(chalk.cyan('  🔧 Common fixes:'));
  console.log(chalk.white('     • Check for missing brackets: {} [] ()'));
  console.log(chalk.white('     • Ensure all JSX tags are properly closed'));
  console.log(chalk.white('     • Verify string literals have matching quotes'));
  console.log(chalk.white('     • Check for missing commas between object properties'));
  console.log(chalk.white('     • Make sure arrow functions have proper syntax: () => {}'));
  
  console.log(chalk.red('\n' + '═'.repeat(70) + '\n'));
}

// Your custom Babel plugin for CLJ syntax
function cljSyntaxPlugin() {
  return {
    visitor: {
      Program(path) {
        path.traverse({
          VariableDeclaration(path) {
            if (path.node.kind === 'constraint') {
              path.node.kind = 'const';
            }
          },
          JSXElement(path) {
            const openingElement = path.node.openingElement;
            if (openingElement.attributes) {
              openingElement.attributes.forEach(attr => {
                if (t.isJSXAttribute(attr) && t.isStringLiteral(attr.value)) {
                  if (attr.value.value.includes('pixels')) {
                    attr.value.value = attr.value.value.replace('pixels', 'px');
                  }
                }
              });
            }
          }
        });
      }
    }
  };
}

// Compile your CLJ file to JavaScript
function compileCLJ(code, options = {}, filename = 'source.clj') {
  const { ast, jsxCode, error } = parseCLJ(code);
  
  if (error) {
    // Show detailed error in console
    showCLJError(error, code, filename);
    
    return {
      success: false,
      error: error.message,
      details: getDetailedError(error, code),
      originalCode: code
    };
  }
  
  const output = generate(ast, {
    retainLines: true,
    compact: false,
    comments: true
  }, jsxCode);
  
  return {
    success: true,
    code: output.code,
    jsxCode,
    ast
  };
}

// Your CLJ Language keywords reference (preserved exactly)
const cljKeywords = {
  declarations: ['constraint', 'let me', 'variable'],
  functions: ['function = name', 'method = name', 'action = name'],
  jsxAttributes: ['give value of', 'give of', 'and =', 'of', 'payload: of'],
  styles: ['= style of Color of Blue', 'minimalHeight', 'pixels', 'by the way', 'pad', 'marg', 'mouse', 'AroundRadius', 'Around', 'BC', 'c', 'trans', 'boxSh', 'transf', 'FS', 's'],
  styleShorthands: ['BS', 'activeBS', 'CS', 'Is'],
  providers: ['ThemeChangeContext.Provider', 'UseContextOnProvided.Provider', 'Noti.Provider', 'Modal.Dispatch.Provider'],
  components: ['ThreeBackGrounds = 3', 'ThreeBackGrounds'],
  operators: ['trigger: on aleart theme change', 'theme of', 'Theme trigger: on aleart theme change'],
  symbols: ['$$$ ====================', '$$$']
};
function getCLJErrorHint(error, code) {
  const errorMsg = error.message;
  
  if (errorMsg.includes('Unexpected token')) {
    const match = errorMsg.match(/\((\d+):(\d+)\)/);
    if (match) {
      const line = parseInt(match[1]);
      const lines = code.split('\n');
      const errorLine = lines[line - 1] || '';
      
      if (errorLine.includes('constraint')) {
        return 'Use "constraint" instead of "const" - it will be converted automatically';
      }
      if (errorLine.includes('give value of')) {
        return 'Use "give value of" instead of "value=" - it will be converted automatically';
      }
      if (errorLine.includes('payload: of')) {
        return 'Use "payload: of" instead of "payload: {" - it will be converted automatically';
      }
      if (errorLine.includes('theme of')) {
        return 'Use "theme of" instead of "theme ===" - it will be converted automatically';
      }
    }
  }
  
  return 'Check your CLJ syntax near the indicated line. Make sure all brackets, parentheses, and quotes are properly closed.';
}

module.exports = { getCLJErrorHint };

module.exports = {
  transformCLJToJSX,
  parseCLJ,
  getCLJErrorHint,
  cljSyntaxPlugin,
  compileCLJ,
  cljKeywords,
  cljSyntaxMap,
  showCLJError,
  getDetailedError
};