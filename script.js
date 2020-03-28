// function createElementWithClassName(config) {
//   const element = document.createElement(config.tag);
//   const classes = config.className.split(' ');
//   element.classList.add(...classes);

//   if (config.text) {
//     element.append(document.createTextNode(text));
//   }
//   return element;
// }

/**
 * Creates HTMLElement by the given tag, className & text
 * @param {String} tag string, representing HTML tag name
 * @param {String} className if given, then set given classes to the new element
 * @param {String} text if given, then createTextNode with this text
 * @returns {HTMLElement} new created HTML element
 */
function createElementWithClassName(tag, className, text = undefined) {
  const element = document.createElement(tag);
  if (className) {
    const classes = className.split(' ');
    element.classList.add(...classes);
  }

  if (text !== undefined) {
    element.append(document.createTextNode(text));
  }
  return element;
}

/**
 * By the given config-object create element and append it to the config.parent
 * @param {Object} config object representing structure such like
 * { tag, className, text, parent, quantity }
 * @returns created element
 */
function createElement(config) {
  const conf = config;
  if (!conf.quantity) conf.quantity = 1;

  let element;
  for (let i = 0; i < conf.quantity; i += 1) {
    element = createElementWithClassName(conf.tag, conf.className, conf.text);
    conf.parent.append(element);
  }
  return element;
}

function initStructure() {
  const root = createElementWithClassName('div', 'wrapper');
  const mainContainer = createElement({
    tag: 'main',
    className: 'container',
    parent: root,
  });

  // creating controls section
  const controls = createElement({
    tag: 'div',
    className: 'container__controls controls',
    parent: mainContainer,
  });
  const controlsText = ['Размешать и начать', 'Стоп', 'Сохранить', 'Результаты'];
  controlsText.forEach((val) => {
    createElement({
      tag: 'button',
      className: 'controls__button',
      text: val,
      parent: controls,
    });
  });

  // creating stats section
  const stats = createElement({
    tag: 'div',
    className: 'container__stats stats',
    parent: mainContainer,
  });
  const statsClasses = ['stats__param', 'stats__turns', 'stats__param', 'stats__elapsed-time'];
  const statsText = ['Ходов: ', '', 'Время: ', ''];
  statsClasses.forEach((curClass, i) => {
    createElement({
      tag: 'span',
      className: curClass,
      text: statsText[i],
      parent: stats,
    });
  });

  // creating game field section
  const gameField = createElement({
    tag: 'div',
    className: 'container__game-field',
    parent: mainContainer,
  });

  createElement({
    tag: 'ul',
    className: 'game-field',
    parent: gameField,
  });

  const gameFieldSize = 4;
  for (let i = 1; i < gameFieldSize ** 2; i += 1) {
    createElement({
      tag: 'li',
      className: 'game-field__block',
      text: i,
      parent: gameField.firstElementChild,
    });
  }
  createElement({
    tag: 'li',
    className: 'game-field__block game-field__block_current',
    parent: gameField.firstElementChild,
  });

  // creating of choosing the field sizes'
  const fieldSizes = createElement({
    tag: 'div',
    className: 'container__field-sizes field-sizes',
    parent: mainContainer,
  });

  createElement({
    tag: 'div',
    className: 'field-sizes__current',
    parent: fieldSizes,
  });
  const fieldSizesClasses = ['field-sizes__title', 'field-sizes__current-size'];
  const fieldSizesText = ['Размер поля: ', ''];
  fieldSizesClasses.forEach((curClass, i) => {
    createElement({
      tag: 'span',
      className: curClass,
      text: fieldSizesText[i],
      parent: fieldSizes.firstElementChild,
    });
  });

  const fieldSizesOthers = createElement({
    tag: 'div',
    className: 'field-sizes__others',
    parent: fieldSizes,
  });
  createElement({
    tag: 'span',
    className: 'field-sizes__title',
    text: 'Другие размеры: ',
    parent: fieldSizesOthers,
  });
  createElement({
    tag: 'ul',
    className: 'field-sizes__anchors field-size-anchors',
    parent: fieldSizesOthers,
  });
  for (let i = 3; i < 9; i += 1) {
    const element = createElement({
      tag: 'li',
      className: 'field-size-anchors__item',
      parent: fieldSizesOthers.lastElementChild,
    });
    createElement({
      tag: 'a',
      text: `${i}x${i}`,
      parent: element,
    });
  }

  root.append(mainContainer);
  document.body.append(root);
}

initStructure();
