const assert = chai.assert;

suite('main', function() {
  suite('#processUserInput()', function() {

    test(`should split user string input,
      return input array and convert command to lowercase`, function() {
      const str = 'GET user';
      assert.typeOf(processUserInput(str), 'array');
      assert.deepEqual(processUserInput(str), ['get', 'user']);
    })

    test('should produce correct array if there are multiple spaces in user string', function() {
      const str = '    SET      company    holistics ';
      assert.typeOf(processUserInput(str), 'array');
      assert.deepEqual(processUserInput(str), ['set', 'company', 'holistics']);
    })
  })
})