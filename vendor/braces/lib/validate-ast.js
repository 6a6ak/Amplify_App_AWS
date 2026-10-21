'use strict';
// Validate iteratively before any recursive walker accepts a caller-provided AST.
module.exports = ast => {
  const pending = [[ast, 0]];
  const visited = new WeakSet();
  let count = 0;
  while (pending.length) {
    const [node, depth] = pending.pop();
    if (!node || typeof node !== 'object') continue;
    if (depth > 128 || visited.has(node) || ++count > 65536) {
      throw new SyntaxError('Brace AST exceeds security limits');
    }
    visited.add(node);
    if (Array.isArray(node.nodes)) {
      for (const child of node.nodes) pending.push([child, depth + 1]);
    }
  }
};
