export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 12;
export const COLORS = [
  "#00ffff",
  "#ffff00",
  "#800080",
  "#00ff00",
  "#ff0000",
  "#0000ff",
  "#ff7f00",
];
export const DEFAULT_COLOR = "#222222";
// export const DEFAULT_COLOR = "#969696";
export const SHAPES = [
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [0, 1],
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1],
    [0, 1],
    [0, 1],
  ],
  [
    [1, 1],
    [1, 0],
    [1, 0],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [
    [1, 1],
    [1, 1],
  ],
];

export const STATIC_BLOCK = {
  color: DEFAULT_COLOR,
};

export const getNewBoard = () => {
  const array = [];

  for (let i = 0; i < BOARD_HEIGHT; i++) {
    array[i] = [];
    for (let j = 0; j < BOARD_WIDTH; j++) {
      array[i][j] = {
        id: `${i}_${Math.random() * BOARD_WIDTH}`,
        ...STATIC_BLOCK,
      };
    }
  }
  return array;
};
