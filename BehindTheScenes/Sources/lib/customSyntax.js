const babel = require('@babel/core');
const t = require('@babel/types');
const parser = require('@babel/parser');

function extendParser(blocks) {
  const plugin = () => ({
    visitor: {
      Identifier(path) {
        for (const block of blocks) {
          if (path.node.name === block.name) {
            const funcName = `__clj_custom_${block.id}`;
            const program = path.findParent(p => p.isProgram());
            if (program) {
              let hasFunc = false;
              program.traverse({
                FunctionDeclaration(p) {
                  if (p.node.id && p.node.id.name === funcName) hasFunc = true;
                }
              });
              if (!hasFunc) {
                const funcBody = block.function || `function ${block.name}(...args) { return args; }`;
                const ast = parser.parse(funcBody, { sourceType: 'module' });
                if (ast.program.body.length) {
                  program.node.body.unshift(...ast.program.body);
                }
              }
            }
            const call = t.callExpression(t.identifier(funcName), path.parentPath.isCallExpression() ? path.parent.arguments : []);
            path.replaceWith(call);
          }
        }
      }
    }
  });

  const originalTransform = babel.transformSync;
  babel.transformSync = (code, opts = {}) => {
    const plugins = opts.plugins || [];
    plugins.push(plugin);
    opts.plugins = plugins;
    return originalTransform(code, opts);
  };
  console.log(`✅ Custom syntax: ${blocks.length} block(s) loaded.`);
}

module.exports = { extendParser };