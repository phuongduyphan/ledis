const processUserInput = (userInputString) => {
  const userInputArr = userInputString.trim().split(/\s+/);
  if (userInputArr.length !== 0) {
    userInputArr[0] = userInputArr[0].toLowerCase();
  }
  return userInputArr;
}

const ledis = new Ledis();
ledis.set('user', 'duyphan');
ledis.sadd('user', 'duyphan', 'huynguyen');
ledis.sadd('company1', 'holistics', 'Not a Basement', 'Orange Logic', 'Garena', 'Google', 'Facebook');
ledis.sadd('company2', 'holistics', 'Knorex', 'Orange Logic', 'DSV', 'Apple', 'Google', 'Samsung');
ledis.sadd('company3', 'holistics', 'Knorex', 'Orange Logic', 'DSV', 'Google', 'Samsung');