import { useEditor } from '../../../../../hooks/useEditor';
import { usePage } from '../../../../../hooks/usePage';
import { useRectangle, RectangleState } from '../../../../../hooks/useRectangle';
import { useState, useEffect, FC, MouseEvent } from 'react';
import { RecoilState } from 'recoil';

const LeftResizer: FC<{
  rectangleState: RecoilState<RectangleState>;
}> = ({ rectangleState }) => {
  const editor = useEditor();
  const page = usePage(editor.selectedPage);
  const rectangle = useRectangle(rectangleState);
  const [state, setState] = useState({
    isMouseDown: false,
    rectangle: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  });

  useEffect(() => {
    const handleMouseMove = (event: globalThis.MouseEvent) => {
      const rect = page.ref.current.getBoundingClientRect();

      const x = event.clientX - rect.left;

      const newWidth = state.rectangle.width + state.rectangle.x - x;

      if (newWidth > 0) {
        rectangle.moveTo(x, rectangle.y);
        rectangle.resize(newWidth, rectangle.height);
      } else {
        rectangle.moveTo(state.rectangle.x + state.rectangle.width - 1, rectangle.y);
        rectangle.resize(1, rectangle.height);
      }
    };

    if (state.isMouseDown) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [state, rectangle, page.ref]);

  useEffect(() => {
    const handleMouseUp = () => {
      setState((state) => ({ ...state, isMouseDown: false }));
    };

    if (state.isMouseDown) {
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state]);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    event.stopPropagation();
    setState({
      isMouseDown: true,
      rectangle: {
        x: rectangle.x,
        y: rectangle.y,
        width: rectangle.width,
        height: rectangle.height,
      },
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: rectangle.x - 1,
        top: rectangle.y,
        width: '2px',
        height: rectangle.height,
        backgroundColor: '#51BC95',
        cursor: 'ew-resize',
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default LeftResizer;
