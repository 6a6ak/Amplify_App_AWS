const test = require('node:test');
const assert = require('node:assert/strict');
const braces = require('braces');
const { mergeDeep } = require('@graphql-tools/utils');
const { generateModelsSync, generateStatements, generateTypes } = require('@aws-amplify/graphql-generator');
const { buildSchema, introspectionFromSchema } = require('graphql');

test('normal brace compilation, ranges and nested expansion remain compatible', () => {
  assert.deepEqual(braces.expand('src/{a,b}/{1..3}.ts'), ['src/a/1.ts','src/a/2.ts','src/a/3.ts','src/b/1.ts','src/b/2.ts','src/b/3.ts']);
  assert.equal(braces.compile('src/{a,b}.ts'), 'src/(a|b).ts');
  assert.deepEqual(braces.expand('{a,{b,c}}'), ['a','b','c']);
});
test('deep brace and parenthesis strings fail safely before recursive walkers', () => {
  for (const [open, close] of [['{','}'], ['(',')'], ['{(',')}']]) {
    const input = open.repeat(5000) + 'a,b' + close.repeat(5000);
    for (const method of ['parse','compile','expand','stringify']) {
      assert.throws(() => braces[method](input), error => error instanceof SyntaxError && !(error instanceof RangeError));
    }
  }
});
test('supplied deep and cyclic ASTs cannot bypass nesting limits', () => {
  const root = { type: 'root', nodes: [] }; let current = root;
  for (let i = 0; i < 5000; i++) { const next = { type: 'brace', nodes: [] }; current.nodes.push(next); current = next; }
  const cyclic = { type: 'root', nodes: [] }; cyclic.nodes.push(cyclic);
  for (const method of ['compile','expand','stringify']) {
    assert.throws(() => braces[method](root), SyntaxError);
    assert.throws(() => braces[method](cyclic), SyntaxError);
  }
});
test('GraphQL merging rejects prototype-pollution keys', () => {
  const payload = JSON.parse('{"__proto__":{"securityPolluted":true},"constructor":{"prototype":{"securityPolluted":true}},"safe":{"b":2}}');
  const result = mergeDeep([{ safe: { a: 1 } }, payload]);
  assert.equal({}.securityPolluted, undefined);
  assert.deepEqual(result.safe, { a: 1, b: 2 });
  assert.equal(Object.hasOwn(result, 'constructor'), false);
});
test('Amplify model generation works with the patched GraphQL utility version', () => {
  const models = generateModelsSync({ schema: 'type Device @model { id: ID!, status: String }', target: 'typescript', isDataStoreEnabled: false });
  assert.ok(Object.keys(models).length > 0);
  assert.match(Object.values(models).join('\n'), /Device/);
});
test('Amplify operation and type generation work with patched dependencies', async () => {
  const schema = JSON.stringify(introspectionFromSchema(buildSchema('type Device { id: ID!, status: String } type Query { getDevice(id: ID!): Device }')));
  const statements = generateStatements({ schema, target: 'typescript' });
  assert.match(Object.values(statements).join('\n'), /getDevice/);
  const types = await generateTypes({ schema, introspection: true, target: 'typescript', queries: 'query GetDevice($id: ID!) { getDevice(id: $id) { id status } }' });
  assert.match(Object.values(types).join('\n'), /GetDevice/);
});
