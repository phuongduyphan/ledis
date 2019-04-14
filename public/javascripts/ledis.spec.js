/* eslint-disable */
const assert = chai.assert;

suite('ledis', function () {
  suite('#splitInput', function () {

    test('should return command and argument array for correct provided arguments',
      function () {
        const str = 'sadd users duyphan john_doe bob';
        const result = Ledis.splitInput(str);
        assert.deepEqual(result, {
          command: 'sadd', args: ['users', 'duyphan',
            'john_doe', 'bob']
        });
      })

    test('should return command and argument array if input string has multiple spaces',
      function () {
        const str = '    sadd        users    duyphan   john_doe      bob      ';
        const result = Ledis.splitInput(str);
        assert.deepEqual(result, {
          command: 'sadd', args: ['users', 'duyphan',
            'john_doe', 'bob']
        });
      })

    test('should return null if input string is empty', function () {
      const str = '';
      const result = Ledis.splitInput(str);
      assert.equal(result, null);
    })
  })

  suite('#handleInput', function () {

    const ledis = new Ledis();

    test('should return wrong command message for incorrect command', function () {
      const str = 'smem set abc';
      const result = ledis.handleInput(str);
      assert.deepEqual(result, {
        value: null,
        message: Ledis.message.WRONG_COMMAND,
        messageType: Ledis.messageType.ERROR,
      });
    })
  });

  suite('#set', function () {

    const ledis = new Ledis();

    test('should return ok message for correct provided arguments',
      function () {
        const result = ledis.set('user', 'duyphan');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return wrong arguments message if the number
      of provided arguments is less than required`,
      function () {
        const result = ledis.set('user');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong arguments message if the number
      of provided arguments is more than required`,
      function () {
        const result = ledis.set('user', 'duyphan', 'bob', 'john_doe');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong type message if provided key has already exists
      and is another type`,
      function () {
        ledis.ledisMap.set = new Set([1, 2, 3]);
        const result = ledis.set('set', 'abc');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_TYPE,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })

  suite('#get', function () {

    const ledis = new Ledis();
    ledis.set('user', 'duyphan');
    ledis.ledisMap.set = new Set([1, 2, 3]);

    test('should return value for correct provided key', function () {
      const result = ledis.get('user');
      assert.deepEqual(result, {
        value: 'duyphan',
        message: Ledis.message.OK,
        messageType: Ledis.messageType.SUCCESS,
      });
    })

    test('should return nil if provided key does not exist', function () {
      const result = ledis.get('student');
      assert.deepEqual(result, {
        value: 'nil',
        message: Ledis.message.OK,
        messageType: Ledis.messageType.SUCCESS,
      });
    })

    test(`should return wrong arguments message if the number of
      provided arguments is less than required`,
      function () {
        const result = ledis.get();
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong arguments message if the number of
      provided arguments is more than required`,
      function () {
        const result = ledis.get('user', 'set');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong type message if provided key is another type`,
      function () {
        const result = ledis.get('set');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_TYPE,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })

  suite('#sadd', function () {

    const ledis = new Ledis();

    test(`should return number of added element for correct
      provide arguments`,
      function () {
        let result = ledis.sadd('students', 'duyphan', 'bob', 'john_doe');

        assert.deepEqual(result, {
          value: 3,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });

        result = ledis.sadd('students', 'bob', 'zack');

        assert.deepEqual(result, {
          value: 1,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return wrong arguments message if the number of
      provided arguments is less than required`,
      function () {
        const result = ledis.sadd('students');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong type message if provided key is another type`, function () {
      ledis.set('courses', 'software_engineering');
      const result = ledis.sadd('courses', 'OOP', 'network');
      assert.deepEqual(result, {
        value: null,
        message: Ledis.message.WRONG_TYPE,
        messageType: Ledis.messageType.ERROR,
      });
    })
  })

  suite('#srem', function () {

    const ledis = new Ledis();
    ledis.ledisMap.students = new Set(['duyphan', 'bob', 'john_doe']);

    test(`should return number of removed element
      for correct provide arguments`,
      function () {
        const result = ledis.srem('students', 'bob', 'zack');
        assert.deepEqual(result, {
          value: 1,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS
        });
      })

    test(`should return wrong arguments message if the number of
      provided arguments is less than required`,
      function () {
        const result = ledis.srem('students');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong type message if provided key is another type`,
      function () {
        ledis.set('user', 'bob');
        const result = ledis.srem('user', 'bob');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_TYPE,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return 0 if provided key does not exist`,
      function () {
        const result = ledis.srem('professors', 'martin');
        assert.deepEqual(result, {
          value: 0,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })
  })

  suite('#smembers', function () {

    const ledis = new Ledis();
    ledis.ledisMap.students = new Set(['duyphan', 'bob', 'zack', 'john_doe']);

    test(`should return members of set for correct provided keys`,
      function () {
        const result = ledis.smembers('students');
        assert.deepEqual(result, {
          value: ['duyphan', 'bob', 'zack', 'john_doe'],
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return empty list or set message if provided key does not exist`,
      function () {
        const result = ledis.smembers('companies');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.EMPTY_LIST_SET,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return wrong arguments message if the number of
      provided arguments is less than required`,
      function () {
        const result = ledis.smembers();
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong arguments message if the number of
      provided arguments is more than required`,
      function () {
        const result = ledis.smembers('students', 'users');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong type message if provided key is another type`,
      function () {
        ledis.set('users', 'admin');
        const result = ledis.smembers('users');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_TYPE,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })

  suite('#sinter', function () {

    const ledis = new Ledis();
    ledis.ledisMap.students = new Set(['bob', 'anna', 'zack', 'john_doe', 'martin',
      'steve', 'bill', 'larry']);
    ledis.ledisMap.top_richest = new Set(['steve', 'bill', 'anna', 'bob', 'larry']);
    ledis.ledisMap.top_smartest = new Set(['steve', 'bill', 'john_doe', ' zack']);
    ledis.ledisMap.top_tallest = new Set(['martin', 'john_doe']);

    test(`should return array of set intersection for correct provided arguments`,
      function () {
        const result = ledis.sinter('students', 'top_richest', 'top_smartest');
        assert.deepEqual(result, {
          value: ['steve', 'bill'],
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return empty list or set message if set intersection is empty`,
      function () {
        let result = ledis.sinter('students', 'top_richest', 'top_tallest');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.EMPTY_LIST_SET,
          messageType: Ledis.messageType.SUCCESS,
        });

        result = ledis.sinter('students', 'set_not_exist');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.EMPTY_LIST_SET,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return wrong arguments message if the number of
      provided arguments is less than required`,
      function () {
        let result = ledis.sinter();
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong type message if any provided key is another type`,
      function () {
        ledis.ledisMap.user = 'duyphan';
        const result = ledis.sinter('students', 'user', 'top_richest');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_TYPE,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })

  suite('#keys', function () {

    const ledis = new Ledis();
    ledis.ledisMap.user = 'duyphan';
    ledis.ledisMap.company = 'holistics';
    ledis.ledisMap.students = new Set(['bob', 'bill', 'steve', 'martin']);
    ledis.ledisMap.courses = new Set(['OOP', 'network']);

    test(`should return array of all available keys for correct provided arguments`,
      function () {
        const result = ledis.keys();
        assert.deepEqual(result, {
          value: ['user', 'company', 'students', 'courses'],
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return empty list or set message if there is no key`,
      function () {
        const ledis = new Ledis();
        const result = ledis.keys();
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.EMPTY_LIST_SET,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return wrong arguments message if the number of
      provided arguments is more than required`,
      function () {
        const result = ledis.keys('user', 'students');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })

  suite('#del', function () {

    const ledis = new Ledis();
    ledis.ledisMap.user = 'duyphan';

    test(`should delete and return 1 for correct provided key`,
      function () {
        const result = ledis.del('user');
        assert.deepEqual(result, {
          value: 1,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return 0 if provided key does not exist`,
      function () {
        const result = ledis.del('company');
        assert.deepEqual(result, {
          value: 0,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return wrong arguments message if the number of 
      provided arguments is less than required`,
      function () {
        const result = ledis.del();
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong arguments message if the number of 
      provided arguments is more than required`,
      function () {
        const result = ledis.del('user', 'company');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })

  suite('#expire', function () {

    const ledis = new Ledis();
    ledis.ledisMap.user = 'duyphan';

    test(`should return the number of seconds if the timeout
      is set for correct provided key`,
      function () {
        const result = ledis.expire('user', 10);
        assert.deepEqual(result, {
          value: 10,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return 0 if provide key does not exist`,
      function () {
        const result = ledis.expire('company', 10);
        assert.deepEqual(result, {
          value: 0,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return wrong arguments message if the number of 
      provided arguments is less than required`,
      function () {
        const result = ledis.expire('company');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong arguments message if the number of 
      provided arguments is more than required`,
      function () {
        const result = ledis.expire('company', 10, 3, 'user');
        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })

  suite('#ttl', function () {

    const ledis = new Ledis();
    ledis.ledisMap.user = 'bob';

    test(`should return the timeout for the correct provided key`,
      function () {
        ledis.expire('user', 10);
        const result = ledis.ttl('user');

        assert.isNumber(result.value);
        assert.equal(result.message, Ledis.message.OK);
        assert.equal(result.messageType, Ledis.messageType.SUCCESS);
      })

    test(`should return -1 for the provided key that has not been set expired`,
      function () {
        ledis.ledisMap.course = 'OOP';
        const result = ledis.ttl('course');

        assert.deepEqual(result, {
          value: -1,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return -2 for the provided key that does not exist`,
      function () {
        const result = ledis.ttl('students');

        assert.deepEqual(result, {
          value: -2,
          message: Ledis.message.OK,
          messageType: Ledis.messageType.SUCCESS,
        });
      })

    test(`should return wrong arguments message if the number of
      provided arguments is less than required`,
      function () {
        const result = ledis.ttl();

        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })

    test(`should return wrong arguments message if the number of
      provided arguments is more than required`,
      function () {
        const result = ledis.ttl('user', 'course');

        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })

  suite('#save', function () {

    const ledis = new Ledis();

    test(`should return wrong arguments message if the number of
      provided arguments is more than required`,
      function () {
        const result = ledis.save('user', 'course');

        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })

  suite('#restore', function () {

    const ledis = new Ledis();

    test(`should return wrong arguments message if the number of
      provided arguments is more than required`,
      function () {
        const result = ledis.restore('user', 'course');

        assert.deepEqual(result, {
          value: null,
          message: Ledis.message.WRONG_ARGUMENTS,
          messageType: Ledis.messageType.ERROR,
        });
      })
  })
})