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

class GemPuzzle {
  constructor(gameFieldSize = 4) {
    this.gameFieldMinSize = 3;
    this.gameFieldMaxSize = 8;
    if (gameFieldSize < this.gameFieldMinSize
      || gameFieldSize > this.gameFieldMaxSize) {
      return new GemPuzzle();
    }

    this.gameFieldSize = gameFieldSize;
    this.turns = 0;
    this.elapsedTime = 0;

    // TODO: this.elements = { У НАСТИ ЕСТЬ КЛАССНАЯ ШТУКА https://github.com/Nastya07s/virtual-keyboard/blob/gh-pages/script.js
    this.rootElement = null;
    this.controlsElement = null;
    this.statsElement = null;
    this.gameFieldElement = null;
    this.currentFieldSizesElement = null;
    this.otherFieldSizesElement = null;

    this.isGameStart = false;

    this.isUpdateRender = false;
  }

  initPuzzle() {
    this.initStructure();
    this.getData();
    this.initHandlers();
  }

  initStructure() {
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
    const statsText = ['Ходов: ', `${this.turns}`, 'Время: ', `${this.getParsedTime()}`];
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

    for (let i = 1; i < this.gameFieldSize ** 2; i += 1) {
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
    const fieldSizesText = ['Размер поля: ', `${this.gameFieldSize}x${this.gameFieldSize}`];
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
    for (let i = this.gameFieldMinSize; i <= this.gameFieldMaxSize; i += 1) {
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

    this.rootElement = root;
    this.controlsElement = controls;
    this.statsElement = stats;
    this.gameFieldElement = gameField;
    this.currentFieldSizesElement = fieldSizes.firstElementChild;
    this.otherFieldSizesElement = fieldSizesOthers.lastElementChild;
  }

  initTimer() {
    this.stopTimer();

    this.elapsedTime = 0;
    this.turns = 0;
    this.isUpdateRender = true;

    if (this.isUpdateRender) {
      const [turns] = this.statsElement.getElementsByClassName('stats__turns');
      const [elapsedTime] = this.statsElement.getElementsByClassName('stats__elapsed-time');
      turns.textContent = this.turns;
      elapsedTime.textContent = this.getParsedTime();

      this.isUpdateRender = false;
    }

    const delay = 1000;

    function incrementElapsedTime() {
      this.elapsedTime += 1;
      this.isUpdateRender = true;

      if (this.isUpdateRender) {
        const [elapsedTime] = this.statsElement.getElementsByClassName('stats__elapsed-time');
        elapsedTime.textContent = this.getParsedTime();

        this.isUpdateRender = false;
      }

      this.timerId = setTimeout(incrementElapsedTime.bind(this), delay);
    }

    this.timerId = setTimeout(incrementElapsedTime.bind(this), delay);
  }

  stopTimer() {
    // console.log(this);
    clearInterval(this.timerId);
  }

  getData() {

  }

  initHandlers() {
    this.controlsElement.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') return 0;
      const [start, stop, save, stats] = this.controlsElement.children;
      switch (e.target) {
        case start:
          this.newGame();
          break;
        case stop:
          this.endGame();
          break;
        case save:
          this.saveGame();
          break;
        case stats:
          this.getStats();
          break;
        default:
          break;
      }
      return 0;
    });

    // TODO: перенести обработчик события перемещения сюда
    // this.gameFieldElement.addEventListener('click', (e) => {
    // 
    //});
  }

  newGame() {
    console.log('New game');
    this.isGameStart = true;
    this.initTimer();
  }

  endGame() {
    console.log('End game');
    this.isGameStart = false;
    this.stopTimer();
  }

  saveGame() {
    console.log('Saved game');
    // localStorage.setItem('gemPuzzle', {
    //   game: {

    //   }
    // });
    // console.log(localStorage.getItem('stats'));
  }

  getStats() {
    console.log('TOP 10 Stats: ');
  }

  getParsedTime() {
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;
    let timeStr = '';
    if (minutes >= 0 && minutes <= 9) {
      timeStr += '0';
    }
    timeStr += `${minutes}:`;
    if (seconds >= 0 && seconds <= 9) {
      timeStr += '0';
    }
    timeStr += seconds;
    return timeStr;
  }

  isGameOver() {
    const collection = [...this.gameFieldElement.firstElementChild.children];

    for (let i = 0; i < this.gameFieldSize ** 2 - 1; i += 1) {
      if (collection[i].innerText !== `${i + 1}`) {
        return false;
      }
    }
    return true;
  }

  resize() {
    // TODO: на ресайзе почему-то отключаются (НОДЫ УДАЛЯЮТСЯ СОБЫТИЯ СЛЕТАЮТ)
    // this.rootElement.remove();
    // this.initStructure();
    [...this.gameFieldElement.firstElementChild.children]
      .forEach((val) => {
        const el = val;
        el.style.width = `${Math.floor(100 / this.gameFieldSize)}%`;
        el.style.height = el.style.width;
      });
  }

  checkForBoundaries(i, j) {
    // i = clicked cellIndex
    // j = empty cellIndex
    if (i >= 0 && i < this.gameFieldSize ** 2) {
      if ((i === j + 1) && (j % this.gameFieldSize !== this.gameFieldSize - 1)) {
        return true;
      }

      if ((i === j - 1) && (j % this.gameFieldSize !== 0)) {
        return true;
      }

      if (i === j + this.gameFieldSize || i === j - this.gameFieldSize) {
        return true;
      }
    }

    return false;
  }
}

const gemPuzzle = new GemPuzzle();
gemPuzzle.initPuzzle();
gemPuzzle.resize();
console.log(gemPuzzle);

gemPuzzle.gameFieldElement.addEventListener('click', (e) => {
  if (!gemPuzzle.isGameStart) return 0;

  if (e.target.tagName !== 'LI') return 0;

  const CURRENT_GAME_FIELD_BLOCK = 'game-field__block_current';
  if (e.target.classList.contains(CURRENT_GAME_FIELD_BLOCK)) return 0;

  // find indexes of clickedItem & emptyCellItem
  const cell = e.target;
  const [emptyCell] = document.getElementsByClassName(CURRENT_GAME_FIELD_BLOCK);
  const parentNode = gemPuzzle.gameFieldElement.firstElementChild;
  const children = [...parentNode.children];

  let cellIdx = -1;
  let emptyCellIdx = -1;
  children.forEach((val, index) => {
    if (val === cell) {
      cellIdx = index;
    } else if (val === emptyCell) {
      emptyCellIdx = index;
    }
  });

  if (gemPuzzle.checkForBoundaries(cellIdx, emptyCellIdx)) {
    [children[cellIdx], children[emptyCellIdx]] = [children[emptyCellIdx], children[cellIdx]];
    parentNode.append(...children);

    gemPuzzle.turns += 1;
    gemPuzzle.isUpdateRender = true;

    if (gemPuzzle.isUpdateRender) {
      const [turns] = gemPuzzle.statsElement.getElementsByClassName('stats__turns');
      turns.textContent = gemPuzzle.turns;

      gemPuzzle.isUpdateRender = false;
    }

    if (gemPuzzle.isGameOver()) {
      // TODO: stopTheGame()
      alert(`Ура! Вы решили головоломку за ${gemPuzzle.getParsedTime()} и ${gemPuzzle.turns} ходов`);
    }
  } else {
    //
  }
  return 0;
});

// TODO: [...gemPuzzle.gameFieldElement.firstElementChild.children].forEach(val => {val.style.width ='25%'; val.style.height = '20%'});

// TODO: рандомный алгоритм шафлинга
let arr = [];
gemPuzzle.gameFieldSize = 4;
for (let i = 0; i < gemPuzzle.gameFieldSize ** 2 - 1; i += 1) {
  arr.push(i + 1);
}

arr.push('<X>');

let whitePos = 15;

function showSwag(arr) {
  let str = '';
  for (let i = 0; i < arr.length; i += 1) {
    str += `${arr[i]}\t`;
    if (i % gemPuzzle.gameFieldSize === gemPuzzle.gameFieldSize - 1) {
      str += '\n';
    }
  }
  console.log(str);
}

showSwag(arr);

let N = 25; // EASY = 25, MEDIUM = 25 * 4, HARD = 25 * 4 * 5

let randomN = N; //Math.floor(Math.random() * N + 1);
console.log('Random N: ', randomN); // 1, 2, 3

console.log('LOH');
// 1, 2
while (randomN) {
  showSwag(arr);

  const temp = [
    whitePos + 1,
    whitePos - 1,
    whitePos + gemPuzzle.gameFieldSize,
    whitePos - gemPuzzle.gameFieldSize,
  ].filter((newPos) => gemPuzzle.checkForBoundaries(newPos, whitePos));
  // temp = temp.filter((newPos) => gemPuzzle.checkForBoundaries(newPos, whitePos));
  console.log('Current moves:', temp.map(val => val + 1));
  // temp = temp.map(val => val + 1);
  // console.log(temp);

  const K = Math.floor(Math.random() * temp.length);
  [arr[whitePos], arr[temp[K]]] = [arr[temp[K]], arr[whitePos]];
  console.log(`Go to ${temp[K] + 1}!`);
  whitePos = temp[K];

  randomN -= 1;
}

showSwag(arr);
