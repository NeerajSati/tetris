import React, { useEffect, useState, useRef } from "react";
import Styles from "./gameContainer.module.scss";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  COLORS,
  DEFAULT_COLOR,
  SHAPES,
} from "./constants";
import clsx from "clsx";

const getRandom = (limit) => {
  return Math.floor(Math.random() * limit);
};

function GameContainer() {
  let staticBlock = {
    color: DEFAULT_COLOR,
  };
  const [blocks, setBlocks] = useState(() => {
    const array = [];

    for (let i = 0; i < BOARD_HEIGHT; i++) {
      array[i] = [];
      for (let j = 0; j < BOARD_WIDTH; j++) {
        array[i][j] = {
          id: `${i}_${Math.random() * BOARD_WIDTH}`,
          ...staticBlock,
        };
      }
    }
    return array;
  });

  const [blockSpawn, setBlockSpawn] = useState(true);
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

      rowsToDelete.reverse().forEach((row) => {
        list.splice(row, 1);
      });
      rowsToDelete.forEach((row) => {
        let newRow = [];
        for (let i = 0; i < BOARD_WIDTH; i++) {
          newRow.push({
            id: `${i}_${Math.random() * BOARD_WIDTH}`,
            ...staticBlock,
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
    const shape = SHAPES[upcomingShapeRef.current];

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

    setBlocks((list) => {
      for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[0].length; j++) {
          if (shape[i][j]) {
            list[0 + i][startAt + j] = {
              ...list[0 + i][startAt + j],
              color: color,
              move: true,
            };
          }
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
                ...staticBlock,
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
                ...staticBlock,
                move: false,
              };
            }
          }
        }
      }
      return list;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (blockSpawnRef.current) {
        createBlock();
      } else {
        moveTetra(0, 0, 1);
      }
    }, 500);

    window.addEventListener("keydown", (e) => {
      if (e.code === "ArrowDown") moveTetra(0, 0, 1);
      if (e.code === "ArrowRight") moveTetra(1, 0, 0);
      if (e.code === "ArrowLeft") moveTetra(0, 1, 0);
    });
    return () => clearInterval(timer);
  }, []);

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
      </div>
      {console.log(upcomingColor, upcomingShape)}
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
