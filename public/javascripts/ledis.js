class Ledis {
  constructor() {
    this.ledisMap = {};
    this.timeOutManager = {};
  }

  static constructReturnedObject(value, message, messageType) {
    return {
      value,
      message,
      messageType,
    };
  }

  // String
  set(key, value) {
    if (!Object.prototype.hasOwnProperty.call(this.ledisMap, key)
      || this.ledisMap[key] instanceof Object) {
      this.ledisMap[key] = value;
      return Ledis.constructReturnedObject(null, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }

    return Ledis.constructReturnedObject(null, Ledis.message.WRONG_TYPE, Ledis.messageType.ERROR);
  }

  get(key) {
    if (Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      return Ledis.constructReturnedObject(this.ledisMap[key],
        Ledis.message.OK, Ledis.messageType.SUCCESS);
    }
    return Ledis.constructReturnedObject(null, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  // Set
  sadd(key, ...values) {
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

      return Ledis.constructReturnedObject(countAddedElement, Ledis.message.OK,
        Ledis.messageType.SUCCESS);
    }

    return Ledis.constructReturnedObject(null, Ledis.message.WRONG_TYPE, Ledis.messageType.ERROR);
  }

  srem(key, ...values) {
    if (Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      if (this.ledisMap[key] instanceof Set) {
        let countRemoveElements = 0;
        values.forEach((value) => {
          countRemoveElements = this.ledisMap[key].delete(value)
            ? countRemoveElements += 1 : countRemoveElements;
        });
        return Ledis.constructReturnedObject(countRemoveElements, Ledis.message.OK);
      }

      return Ledis.constructReturnedObject(null, Ledis.message.WRONG_TYPE, Ledis.messageType.ERROR);
    }

    return Ledis.constructReturnedObject(0, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  smembers(key) {
    if (!Object.prototype.hasOwnProperty.call(this.ledisMap, key)
      || ((this.ledisMap[key] instanceof Set)
        && this.ledisMap[key].size === 0)) {
      return Ledis.constructReturnedObject(null, Ledis.message.EMPTY_LIST_SET,
        Ledis.messageType.SUCCESS);
    }
    if (this.ledisMap[key] instanceof Set) {
      const members = [];
      this.ledisMap[key].forEach((value) => {
        members.push(value);
      });
      return Ledis.constructReturnedObject(members, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }
    return Ledis.constructReturnedObject(null, Ledis.message.WRONG_TYPE, Ledis.messageType.ERROR);
  }

  sinter(...keys) {
    for (const key of keys) {
      if (!(this.ledisMap[key] instanceof Set)
        && Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
        return Ledis.constructReturnedObject(null, Ledis.message.WRONG_TYPE,
          Ledis.messageType.ERROR);
      }
    }

    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
        return Ledis.constructReturnedObject(null, Ledis.message.EMPTY_LIST_SET,
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
      return Ledis.constructReturnedObject(null, Ledis.message.EMPTY_LIST_SET,
        Ledis.messageType.SUCCESS);
    }

    return Ledis.constructReturnedObject(resultSet, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  // Data expirations
  keys() {
    const keyArr = Object.keys(this.ledisMap);

    if (keyArr.length === 0) {
      return Ledis.constructReturnedObject(null, Ledis.message.EMPTY_LIST_SET,
        Ledis.messageType.SUCCESS);
    }

    return Ledis.constructReturnedObject(keyArr, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  del(key) {
    if (Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      delete this.ledisMap[key];
      return Ledis.constructReturnedObject(1, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }
    return Ledis.constructReturnedObject(0, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  expire(key, seconds) {
    if (seconds < 0) {
      return Ledis.constructReturnedObject(null, Ledis.message.NEGATIVE_SECOND,
        Ledis.messageType.ERROR);
    }

    if (!Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      return Ledis.constructReturnedObject(0, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }

    this.timeOutManager[key] = {
      start: Date.now(),
      duration: seconds * 1000,
    };

    setTimeout(() => {
      this.del(key);
      delete this.timeOutManager[key];
    }, seconds * 1000);

    return Ledis.constructReturnedObject(seconds, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  ttl(key) {
    if (Object.prototype.hasOwnProperty.call(this.timeOutManager, key)) {
      const elapsed = Date.now() - this.timeOutManager[key].start;
      const remaining = Math.round((this.timeOutManager[key].duration - elapsed) / 1000);
      return Ledis.constructReturnedObject(remaining, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }
    if (Object.prototype.hasOwnProperty.call(this.ledisMap, key)) {
      return Ledis.constructReturnedObject(-1, Ledis.message.OK, Ledis.messageType.SUCCESS);
    }
    return Ledis.constructReturnedObject(-2, Ledis.message.OK, Ledis.messageType.SUCCESS);
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
    const snapshots = JSON.parse(localStorage.getItem('snapshots')) || [];

    const id = `snapshots-${Date.now()}`;
    snapshots.push(id);
    localStorage.setItem('snapshots', JSON.stringify(snapshots));
    localStorage.setItem(id, JSON.stringify(this.ledisMap, Ledis.setToJSONReplacer));
    return Ledis.constructReturnedObject(null, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }

  static JSONToSetReviver(key, value) {
    if (typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'type')
      && value.type === 'Set') {
      return new Set(value.data);
    }
    return value;
  }

  restore() {
    const snapshots = JSON.parse(localStorage.getItem('snapshots')) || [];

    if (snapshots.length === 0) {
      return Ledis.constructReturnedObject(null, Ledis.message.NO_SNAPSHOT,
        Ledis.messageType.ERROR);
    }

    const ledisState = JSON.parse(localStorage.getItem(snapshots[snapshots.length - 1]),
      Ledis.JSONToSetReviver);
    this.ledisMap = ledisState;
    return Ledis.constructReturnedObject(null, Ledis.message.OK, Ledis.messageType.SUCCESS);
  }
}

Ledis.message = {
  OK: 'OK',
  WRONG_TYPE: 'Operation against a key holding the wrong kind of value',
  EMPTY_LIST_SET: 'empty list or set',
  NEGATIVE_SECOND: 'seconds must be a positive integer',
  NO_SNAPSHOT: 'No snapshot available',
};

Ledis.messageType = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};
