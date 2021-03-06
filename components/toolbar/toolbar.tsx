import React from 'react';
import { Styled } from './toolbar.styles';
import MoveTool from '../../svgs/move-tool';
import ArtboardTool from '../../svgs/artboard-tool';
import EllipseTool from '../../svgs/ellipse-tool';
import PolygonTool from '../../svgs/polygon-tool';
import LineTool from '../../svgs/line-tool';
import RectangleTool from '../../svgs/rectangle-tool';
import { Tools } from '../../enums';
import { useTool } from '../../hooks/useTool';

const ToolIcons = {
  [Tools.selection]: MoveTool,
  [Tools.artboard]: ArtboardTool,
  [Tools.rectangle]: RectangleTool,
  [Tools.ellipse]: EllipseTool,
  [Tools.polygon]: PolygonTool,
  [Tools.line]: LineTool,
};

const Toolbar = () => {
  const tool = useTool();

  const handleToolClick = (type: Tools) => () => {
    // TODO: Remove alert when tool is implemented
    if (type !== Tools.rectangle && type !== Tools.selection) {
      window.alert('Sorry. The tool is under development. 🚧');
      return;
    }

    tool.setType(type);
  };

  return (
    <Styled.Toolbar>
      <Styled.Container>
        {Object.keys(Tools).map((key) => {
          const Icon = ToolIcons[key];
          return (
            <Styled.Tool key={key} active={tool.type === Tools[key]} onClick={handleToolClick(Tools[key])}>
              <Icon active={tool.type === Tools[key]} />
            </Styled.Tool>
          );
        })}
      </Styled.Container>
    </Styled.Toolbar>
  );
};

export default Toolbar;
