const ledis = new Ledis();

const userInput = document.getElementById('user-input');

const appendNewNodeToPanel = (htmlTag, className, content) => {
  const node = document.createElement(htmlTag);
  node.className = className;
  const textNode = document.createTextNode(content);
  node.appendChild(textNode);
  document.getElementById('cli-panel').appendChild(node);
  document.getElementById('cli-panel').lastChild.scrollIntoView();
};

userInput.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    const userInputString = userInput.value;
    if (userInputString) {
      if (userInputString.trim() === 'clear') {
        document.getElementById('cli-panel').innerHTML = '';
        userInput.value = '';
        return;
      }
      const response = ledis.handleInput(userInputString);

      appendNewNodeToPanel('div', 'code-line', `>${userInputString}`);

      if (response.messageType === 'ERROR') {
        appendNewNodeToPanel('div', 'code-line', `ERROR: ${response.message}`);
      } else if (response.value || response.value === 0) {
        if (response.value instanceof Array) {
          response.value.forEach((element) => {
            appendNewNodeToPanel('div', 'code-line', `"${element}"`);
          });
        } else {
          appendNewNodeToPanel('div', 'code-line', `"${response.value}"`);
        }
      } else {
        appendNewNodeToPanel('div', 'code-line', response.message);
      }
      userInput.value = '';
    }
  }
});

// ledis.set('user', 'duyphan');
// ledis.sadd('user', 'duyphan', 'huynguyen');
// ledis.sadd('company1', 'holistics', 'Not a Basement', 'Orange Logic', 'Garena', 'Google', 'Facebook');
// ledis.sadd('company2', 'holistics', 'Knorex', 'Orange Logic', 'DSV', 'Apple', 'Google', 'Samsung');
// ledis.sadd('company3', 'holistics', 'Knorex', 'Orange Logic', 'DSV', 'Google', 'Samsung');