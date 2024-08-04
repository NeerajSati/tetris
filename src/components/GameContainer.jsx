import React, { useEffect, useState, useRef } from "react";
import Styles from "./gameContainer.module.scss";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  COLORS,
  DEFAULT_COLOR,
  getNewBoard,
  SHAPES,
  STATIC_BLOCK,
} from "./constants";
import clsx from "clsx";

const getRandom = (limit) => {
  return Math.floor(Math.random() * limit);
};

function GameContainer() {
  const [blocks, setBlocks] = useState(getNewBoard);
  const [blockSpawn, setBlockSpawn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [pauseGame, setPauseGame] = useState(false);
  const [replay, setReplay] = useState(0);
  const [upcomingShape, setUpcomingShape] = useState(() =>
    getRandom(SHAPES.length)
  );
  const [upcomingColor, setUpcomingColor] = useState(
    () => COLORS[getRandom(COLORS.length)]
  );

  //creating a reference object
  const blockSpawnRef = useRef(blockSpawn);
  blockSpawnRef.current = blockSpawn;
  const upcomingShapeRef = useRef(upcomingShape);
  upcomingShapeRef.current = upcomingShape;
  const upcomingColorRef = useRef(upcomingColor);
  upcomingColorRef.current = upcomingColor;
  const gameOverRef = useRef(gameOver);
  gameOverRef.current = gameOver;
  const pauseRef = useRef(pauseGame);
  pauseRef.current = pauseGame;
  const currentShapeRef = useRef({ shape: 0, axial: 0 });
  const currentColorRef = useRef(DEFAULT_COLOR);
  const currentMoveRef = useRef({ row: 0, col: 0 });
  const rotateActiveRef = useRef(false);

  const checkForPointRows = () => {
    setBlocks((list) => {
      let rowsToDelete = [];
      for (let i = list.length - 1; i >= 0; i--) {
        let rowTaken = true;
        for (let j = 0; j < list[0].length; j++) {
          if (list[i][j].color === DEFAULT_COLOR) {
            rowTaken = false;
            break;
          }
        }
        if (rowTaken) {
          rowsToDelete.push(i);
        }
      }
      rowsToDelete.forEach((row) => {
        list.splice(row, 1);
      });
      rowsToDelete.forEach((row) => {
        let newRow = [];
        for (let i = 0; i < BOARD_WIDTH; i++) {
          newRow.push({
            id: `${i}_${Math.random() * BOARD_WIDTH}`,
            ...STATIC_BLOCK,
          });
        }
        list.unshift(newRow);
      });

      return list;
    });
  };

  const createBlock = () => {
    checkForPointRows();
    const color = upcomingColorRef.current;
    let shape = SHAPES[upcomingShapeRef.current];
    if (!shape[0].includes(1)) {
      shape = SHAPES[upcomingShapeRef.current].slice(1);
    }
    currentShapeRef.current = {
      shape: upcomingShapeRef.current,
      axial: 0,
    };
    currentColorRef.current = color;

    // nextShape should not be same as previous one
    let nextShape = getRandom(SHAPES.length);
    while (upcomingShapeRef.current === nextShape) {
      nextShape = getRandom(SHAPES.length);
    }
    setUpcomingShape(nextShape);

    // nextColor should not be same as previous one
    let nextColor = COLORS[getRandom(COLORS.length)];
    while (upcomingColorRef.current === nextColor) {
      nextColor = COLORS[getRandom(COLORS.length)];
    }
    setUpcomingColor(nextColor);

    const startAt = Math.min(
      getRandom(BOARD_WIDTH),
      BOARD_WIDTH - shape[0].length
    );
    currentMoveRef.current.row = 0;
    currentMoveRef.current.col = startAt;

    setBlocks((list) => {
      for (let i = 0; i < shape.length; i++) {
        if (i !== 0) {
          //Check next line if it is possible to move handle spawn after 2nd row
          for (let j = 0; j < shape[0].length; j++) {
            if (
              shape[i][j] &&
              list[0 + i][startAt + j].color !== DEFAULT_COLOR
            ) {
              // It is a conflict so game over
              setGameOver(true);
              return list;
            }
          }
        }

        // Handle spawn on first row
        let conflict = false;
        for (let j = 0; j < shape[0].length; j++) {
          if (shape[i][j]) {
            if (list[0 + i][startAt + j].move) {
              conflict = true;
            }
            list[0 + i][startAt + j] = {
              ...list[0 + i][startAt + j],
              color: color,
              move: true,
            };
          }
        }
        if (conflict) {
          // It is a conflict so game over
          setGameOver(true);
          return list;
        }
      }
      return list;
    });

    setBlockSpawn((blockSpawn) => !blockSpawn);
  };

  const didStopProgress = (list, right, left, bottom) => {
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list[0].length; j++) {
        if (list[i][j].move === true) {
          if (
            i + bottom >= list.length ||
            j + right >= list[0].length ||
            j - left < 0 ||
            (list[i + bottom][j + right - left].move !== true &&
              list[i + bottom][j + right - left].color !== DEFAULT_COLOR)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const moveTetra = (right, left, bottom) => {
    setBlocks((blocks) => {
      let list = blocks.map(function (arr) {
        return arr.slice();
      });

      let stopProgress = didStopProgress(list, right, left, bottom);
      if (stopProgress && !bottom) {
        return list;
      }
      if (stopProgress) {
        for (let i = 0; i < list.length; i++) {
          for (let j = 0; j < list[0].length; j++) {
            list[i][j].move = false;
          }
        }
        setBlockSpawn(true);
        rotateActiveRef.current = false;
        return list;
      }

      for (let i = list.length - 1; i >= 0; i--) {
        if (left) {
          for (let j = left; j < list[0].length; j++) {
            if (list[i][j].move === true) {
              list[i][j - left] = {
                ...list[i][j],
                id: list[i][j - left].id,
              };
              list[i][j] = {
                ...list[i][j],
                ...STATIC_BLOCK,
                move: false,
              };
            }
          }
        } else {
          for (let j = list[0].length - 1 - right; j >= 0; j--) {
            if (list[i][j].move === true) {
              list[i + bottom][j + right] = {
                ...list[i][j],
                id: list[i + bottom][j + right].id,
              };
              list[i][j] = {
                ...list[i][j],
                ...STATIC_BLOCK,
                move: false,
              };
            }
          }
        }
      }
      currentMoveRef.current.row += bottom;
      currentMoveRef.current.col += right - left;
      return list;
    });
  };

  const rotateMatrix = (mat, times) => {
    let newMat = mat.map(function (arr) {
      return arr.slice();
    });
    while (times > 0) {
      newMat = newMat[0].map((val, index) =>
        newMat.map((row) => row[index]).reverse()
      );
      times -= 1;
    }
    return newMat;
  };

  const isPossibleRotate = (list, row, col, tetra) => {
    // Handle rotate on extreme right
    if (col + tetra.length - 1 >= BOARD_WIDTH) {
      col = BOARD_WIDTH - tetra.length;
    }
    // Handle rotate on extreme left
    if (col < 0) {
      col = 0;
    }

    for (let i = 0; i < tetra.length; i++) {
      for (let j = 0; j < tetra[i].length; j++) {
        if (row + i >= BOARD_HEIGHT || col < 0) {
          return false;
        }
        if (tetra[i][j]) {
          if (
            !list[row + i][col + j].move &&
            list[row + i][col + j].color !== DEFAULT_COLOR
          ) {
            return false;
          }
          list[row + i][col + j].color = currentColorRef.current;
          list[row + i][col + j].move = true;
        } else if (list[row + i][col + j].move) {
          list[row + i][col + j].color = DEFAULT_COLOR;
          list[row + i][col + j].move = false;
        }
      }
    }

    if (col !== currentMoveRef.current.col) currentMoveRef.current.col = col;

    return true;
  };

  const rotateTetra = () => {
    // Handle 2*2 block
    if (
      SHAPES[currentShapeRef.current.shape].length === 2 &&
      SHAPES[currentShapeRef.current.shape][0].length === 2
    )
      return;
    setBlocks((blocks) => {
      let list = JSON.parse(JSON.stringify(blocks));

      const rotateTimes =
        currentShapeRef.current.axial === 3
          ? 0
          : currentShapeRef.current.axial + 1;
      const rotatedMat = rotateMatrix(
        SHAPES[currentShapeRef.current.shape],
        currentShapeRef.current.axial + 1
      );
      const success = isPossibleRotate(
        list,
        currentMoveRef.current.row,
        currentMoveRef.current.col,
        rotatedMat
      );
      if (success) {
        currentShapeRef.current.axial = rotateTimes;
        return list;
      }

      return blocks;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (pauseRef.current) {
        return;
      } else if (gameOverRef.current) {
        clearInterval(timer);
      } else if (blockSpawnRef.current) {
        rotateActiveRef.current = false;
        createBlock();
      } else {
        moveTetra(0, 0, 1);
        rotateActiveRef.current = true;
      }
    }, 500);

    const onKeyPress = (e) => {
      if (gameOverRef.current || pauseRef.current) {
        return;
      }
      if (e.code === "ArrowDown") moveTetra(0, 0, 1);
      if (e.code === "ArrowRight") moveTetra(1, 0, 0);
      if (e.code === "ArrowLeft") moveTetra(0, 1, 0);
      if (e.code === "ArrowUp" && rotateActiveRef.current) rotateTetra();
    };
    window.addEventListener("keydown", onKeyPress);

    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", onKeyPress);
    };
  }, [replay]);

  return (
    <>
      <div className={Styles.gameContainer}>
        {blocks.map((row) =>
          row.map((block) => (
            <div
              className={clsx(Styles.block, {
                [Styles.defaultBlock]: block.color === DEFAULT_COLOR,
              })}
              key={block.id}
              style={{
                backgroundColor: block.color,
              }}
            ></div>
          ))
        )}
        {gameOver && (
          <div className={Styles.gameOverContainer}>
            Game Over
            <button
              className={Styles.replay}
              onClick={() => {
                setBlocks(getNewBoard());
                setReplay(replay + 1);
                setGameOver(false);
                setBlockSpawn(true);
                rotateActiveRef.current = false;
              }}
            >
              Replay
            </button>
          </div>
        )}
        {pauseGame && (
          <div className={Styles.gameOverContainer}>
            Paused
            <button
              className={Styles.replay}
              onClick={() => {
                setPauseGame(false);
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
      {!gameOver && (
        <div className={Styles.pauseRow}>
          <button
            className={Styles.pauseButton}
            onClick={() => setPauseGame(true)}
          >
            Pause
          </button>
        </div>
      )}

      <div className={Styles.upcomingContainer}>
        {SHAPES[upcomingShape].map((row) => (
          <div className={Styles.row}>
            {row.map((col) => (
              <div
                className={clsx(Styles.upcomingBlock, {
                  [Styles.upcomingBlockChosen]: col,
                })}
                style={col ? { backgroundColor: upcomingColor } : null}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default GameContainer;
