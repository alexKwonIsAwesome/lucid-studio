import { useTool } from '../../../hooks/useTool';
import { useEditor } from '../../../hooks/useEditor';
import { usePage } from '../../../hooks/usePage';
import { useRectangle, rectangleStateFamily, RectangleState } from '../../../hooks/useRectangle';
import { useState, MouseEvent } from 'react';
import { Styled } from './rectangle-layer.styles.';
import { undefinedState } from '../../../recoil/atoms';
import { Tools } from '../../../enums';
import { RecoilState } from 'recoil';
import { createRandomGreyHexColor } from '../../../services/random-color/random-color';

const isAnyDraggedDistanceExceeds5px = (
  originalCoordinate: { x: number; y: number },
  newCoordinate: {
    x: number;
    y: number;
  },
) => {
  return Math.abs(newCoordinate.x - originalCoordinate.x) > 5 || Math.abs(newCoordinate.y - originalCoordinate.y) > 5;
};

const RectangleLayer = () => {
  const tool = useTool();
  const editor = useEditor();
  const page = usePage(editor.selectedPage);

  const [state, setState] = useState({
    isMouseDown: false,
    coordinate: {
      x: 0,
      y: 0,
    },
  });

  const [targetRectangleState, setTargetRectangleState] = useState<RecoilState<RectangleState>>(null);
  const targetRectangle = useRectangle(targetRectangleState ? targetRectangleState : undefinedState);

  if (tool.type !== 'rectangle') {
    return null;
  }

  const resetLocalStates = () => {
    setState({ isMouseDown: false, coordinate: { x: 0, y: 0 } });
    setTargetRectangleState(null);
  };

  const getMouseCoordinate = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    const rect = page.ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  };

  const getRectangleProperty = (
    baseCoordinate: { x: number; y: number },
    targetCoordinate: { x: number; y: number },
  ) => {
    const xDiff = targetCoordinate.x - baseCoordinate.x;
    const yDiff = targetCoordinate.y - baseCoordinate.y;

    return {
      x: xDiff > 0 ? baseCoordinate.x : baseCoordinate.x + xDiff,
      y: yDiff > 0 ? baseCoordinate.y : baseCoordinate.y + yDiff,
      width: Math.abs(xDiff),
      height: Math.abs(yDiff),
    };
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    event.stopPropagation();
    const { x, y } = getMouseCoordinate(event);
    setState({
      isMouseDown: true,
      coordinate: {
        x,
        y,
      },
    });
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    if (!state.isMouseDown) {
      return;
    }

    const mouseCoordinate = getMouseCoordinate(event);

    if (targetRectangleState) {
      const { x, y, width, height } = getRectangleProperty(state.coordinate, mouseCoordinate);
      targetRectangle.moveTo(x, y);
      targetRectangle.resize(width, height);
      return;
    }

    if (isAnyDraggedDistanceExceeds5px(state.coordinate, mouseCoordinate)) {
      const { x, y, width, height } = getRectangleProperty(state.coordinate, mouseCoordinate);
      const rectangleState = rectangleStateFamily({
        x,
        y,
        width,
        height,
        angle: 0,
        fill: createRandomGreyHexColor(),
      });
      setTargetRectangleState(rectangleState);
      page.addChild(rectangleState);
      page.selectSingleGraphicObject(rectangleState);
      return;
    }
  };

  const handleMouseUp = () => {
    if (!targetRectangleState) {
      const rectangleState = rectangleStateFamily({
        x: state.coordinate.x - 50,
        y: state.coordinate.y - 50,
        width: 100,
        height: 100,
        angle: 0,
        fill: createRandomGreyHexColor(),
      });
      page.addChild(rectangleState);
      page.selectSingleGraphicObject(rectangleState);
      resetLocalStates();
      tool.setType(Tools.selection);
      return;
    }

    tool.setType(Tools.selection);
    resetLocalStates();
  };

  return (
    <Styled.RectangleLayer onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} />
  );
};

export default RectangleLayer;
