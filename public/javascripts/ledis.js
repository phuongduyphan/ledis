class Ledis {
  constructor() {
    this.ledisMap = {};
    this.timeOutManager = {};
  }

  static constructReponse(value, message, messageType) {
    return {
      value,
      message,
      messageType,
    };
  }

  // handle input
  static splitInput(inputString) {
    if (!inputString) return null;

    const inputArr = inputString.trim().split(/\s+/);
    if (inputArr.length !== 0) {
      inputArr[0] = inputArr[0].toLowerCase();
    }
    return {
      command: inputArr[0],
      args: inputArr.length > 1 ? inputArr.slice(1) : [],
    };
  }

  handleInput(inputString) {
    const { command, args } = Ledis.splitInput(inputString);

    let response;
    switch (command) {
      case 'set':
        if (args.length !== 2) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.set(args[0], args[1]);
        break;

      case 'get':
        if (args.length !== 1) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.get(args[0]);
        break;

      case 'sadd':
        if (args.length < 2) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.sadd(args[0], ...args.slice(1));
        break;

      case 'srem':
        if (args.length < 2) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.srem(args[0], ...args.slice(1));
        break;

      case 'smembers':
        if (args.length !== 1) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.smembers(args[0]);
        break;

      case 'sinter':
        if (args.length < 1) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.sinter(...args);
        break;

      case 'keys':
        if (args.length !== 0) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.keys();
        break;

      case 'del':
        if (args.length !== 1) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.del(args[0]);
        break;

      case 'expire':
        if (args.length !== 2) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.expire(args[0], args[1]);
        break;

      case 'ttl':
        if (args.length !== 1) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.ttl(args[0]);
        break;

      case 'save':
        if (args.length !== 0) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.save();
        break;

      case 'restore':
        if (args.length !== 0) {
          response = Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
            Ledis.messageType.ERROR);
          break;
        }
        response = this.restore();
        break;

      default:
        response = Ledis.constructReponse(null, Ledis.message.WRONG_COMMAND,
          Ledis.messageType.ERROR);
    }
    return response;
  }

  // String
  set(key, value) {
    if (arguments.length !== 2) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    if (!Object.prototype.hasOwnProperty.call(this.ledisMap, key)
      || typeof this.ledisMap[key] === 'string') {
      this.ledisMap[key] = value;
      return Ledis.constructReponse(null, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }

    return Ledis.constructReponse(null, Ledis.message.WRONG_TYPE, Ledis.messageType.ERROR);
  }

  get(key) {
    if (arguments.length !== 1) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    if (Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      if (typeof this.ledisMap[key] === 'string') {
        return Ledis.constructReponse(this.ledisMap[key],
          Ledis.message.OK, Ledis.messageType.SUCCESS);
      }
      return Ledis.constructReponse(null, Ledis.message.WRONG_TYPE,
        Ledis.messageType.ERROR);
    }
    return Ledis.constructReponse('nil', Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  // Set
  sadd(key, ...values) {
    if (arguments.length < 2) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    if (!Object.prototype.hasOwnProperty.call(this.ledisMap, key)
      || this.ledisMap[key] instanceof Set) {
      const set = this.ledisMap[key] instanceof Set ? this.ledisMap[key] : new Set();

      let countAddedElement = 0;
      values.forEach((value) => {
        if (!set.has(value)) {
          set.add(value);
          countAddedElement += 1;
        }
      });

      this.ledisMap[key] = set;

      return Ledis.constructReponse(countAddedElement, Ledis.message.OK,
        Ledis.messageType.SUCCESS);
    }

    return Ledis.constructReponse(null, Ledis.message.WRONG_TYPE, Ledis.messageType.ERROR);
  }

  srem(key, ...values) {
    if (arguments.length < 2) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    if (Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      if (this.ledisMap[key] instanceof Set) {
        let countRemoveElements = 0;
        values.forEach((value) => {
          countRemoveElements = this.ledisMap[key].delete(value)
            ? countRemoveElements += 1 : countRemoveElements;
        });
        return Ledis.constructReponse(countRemoveElements, Ledis.message.OK,
          Ledis.messageType.SUCCESS);
      }

      return Ledis.constructReponse(null, Ledis.message.WRONG_TYPE, Ledis.messageType.ERROR);
    }

    return Ledis.constructReponse(0, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  smembers(key) {
    if (arguments.length !== 1) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    if (!Object.prototype.hasOwnProperty.call(this.ledisMap, key)
      || ((this.ledisMap[key] instanceof Set)
        && this.ledisMap[key].size === 0)) {
      return Ledis.constructReponse(null, Ledis.message.EMPTY_LIST_SET,
        Ledis.messageType.SUCCESS);
    }
    if (this.ledisMap[key] instanceof Set) {
      const members = [];
      this.ledisMap[key].forEach((value) => {
        members.push(value);
      });
      return Ledis.constructReponse(members, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }
    return Ledis.constructReponse(null, Ledis.message.WRONG_TYPE, Ledis.messageType.ERROR);
  }

  sinter(...keys) {
    if (arguments.length < 1) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    for (const key of keys) {
      if (!(this.ledisMap[key] instanceof Set)
        && Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
        return Ledis.constructReponse(null, Ledis.message.WRONG_TYPE,
          Ledis.messageType.ERROR);
      }
    }

    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
        return Ledis.constructReponse(null, Ledis.message.EMPTY_LIST_SET,
          Ledis.messageType.SUCCESS);
      }
    }

    const intersect = (set1, set2) => {
      const resultSet = new Set();
      set1.forEach((value) => {
        if (set2.has(value)) {
          resultSet.add(value);
        }
      });
      return resultSet;
    };

    const resultSet = keys.reduce((accumulator, currentKey) => (
      intersect(accumulator, this.ledisMap[currentKey])
    ), this.ledisMap[keys[0]]);

    if (resultSet.size === 0) {
      return Ledis.constructReponse(null, Ledis.message.EMPTY_LIST_SET,
        Ledis.messageType.SUCCESS);
    }

    return Ledis.constructReponse([...resultSet], Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  // Data expirations
  keys() {
    if (arguments.length !== 0) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }
    const keyArr = Object.keys(this.ledisMap);

    if (keyArr.length === 0) {
      return Ledis.constructReponse(null, Ledis.message.EMPTY_LIST_SET,
        Ledis.messageType.SUCCESS);
    }

    return Ledis.constructReponse(keyArr, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  del(key) {
    if (arguments.length !== 1) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    if (Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      delete this.ledisMap[key];
      return Ledis.constructReponse(1, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }
    return Ledis.constructReponse(0, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  expire(key, seconds) {
    if (arguments.length !== 2) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    if (seconds < 0 || !Number.isInteger(parseInt(seconds, 10))) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_FORMAT_SECOND,
        Ledis.messageType.ERROR);
    }

    if (!Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      return Ledis.constructReponse(0, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }

    this.timeOutManager[key] = {
      start: Date.now(),
      duration: seconds * 1000,
    };

    setTimeout(() => {
      this.del(key);
      delete this.timeOutManager[key];
    }, seconds * 1000);

    return Ledis.constructReponse(seconds, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  ttl(key) {
    if (arguments.length !== 1) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    if (Object.prototype.hasOwnProperty.call(this.timeOutManager, key)) {
      const elapsed = Date.now() - this.timeOutManager[key].start;
      const remaining = Math.round((this.timeOutManager[key].duration - elapsed) / 1000);
      return Ledis.constructReponse(remaining, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }
    if (Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      return Ledis.constructReponse(-1, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }
    return Ledis.constructReponse(-2, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  // Snapshot
  static setToJSONReplacer(key, value) {
    if (typeof value === 'object' && value instanceof Set) {
      return {
        type: 'Set',
        data: [...value],
      };
    }
    return value;
  }

  save() {
    if (arguments.length !== 0) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    const snapshots = JSON.parse(localStorage.getItem('snapshots')) || [];

    const id = `snapshots-${Date.now()}`;
    snapshots.push(id);
    localStorage.setItem('snapshots', JSON.stringify(snapshots));
    localStorage.setItem(id, JSON.stringify(this.ledisMap, Ledis.setToJSONReplacer));
    return Ledis.constructReponse(null, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  static JSONToSetReviver(key, value) {
    if (typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'type')
      && value.type === 'Set') {
      return new Set(value.data);
    }
    return value;
  }

  restore() {
    if (arguments.length !== 0) {
      return Ledis.constructReponse(null, Ledis.message.WRONG_ARGUMENTS,
        Ledis.messageType.ERROR);
    }

    const snapshots = JSON.parse(localStorage.getItem('snapshots')) || [];

    if (snapshots.length === 0) {
      return Ledis.constructReponse(null, Ledis.message.NO_SNAPSHOT,
        Ledis.messageType.ERROR);
    }

    const ledisState = JSON.parse(localStorage.getItem(snapshots[snapshots.length - 1]),
      Ledis.JSONToSetReviver);
    this.ledisMap = ledisState;
    return Ledis.constructReponse(null, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }
}

Ledis.message = {
  OK: 'OK',
  WRONG_TYPE: 'Operation against a key holding the wrong kind of value',
  EMPTY_LIST_SET: 'empty list or set',
  WRONG_FORMAT_SECOND: 'seconds must be a positive integer',
  NO_SNAPSHOT: 'No snapshot available',
  WRONG_ARGUMENTS: 'Wrong number of arguments',
  WRONG_COMMAND: 'Wrong command',
};

Ledis.messageType = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};
