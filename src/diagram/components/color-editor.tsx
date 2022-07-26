import React, { /*useEffect, useRef,*/ useState } from "react";
//import { useClickAway } from "../../hooks/use-click-away";
import { VariableType } from "../models/variable";

import "./color-editor.scss";
import {CirclePicker} from "react-color";

interface IProps {
  variable: VariableType
  onShowColorEditor: (show: boolean) => void;
}

export const ColorEditor: React.FC<IProps> = ({variable, onShowColorEditor}) => {

  const [color, setColor] = useState(variable.color);

  const handleColorChange = (evt:any) => {
    variable.setColor(evt.hex);
    setColor(evt.hex);
    onShowColorEditor(false);
  };

  return (
    <div className="color-editor-dialog" title={"color picker"}>
      <div className="variable-info-row ">
        <CirclePicker color={color} onChange={handleColorChange} width={"110px"} colors={
          [
            "#ABB8C3",
            "#0693E3",
            "#8ED1FC",
            "#00D084",
            "#7BDCB5",
            "#F78DA7",
            "#e98b42",
            "#FF6900",
            "#EB144C",
            "#9900EF",
          ]} circleSize={14} circleSpacing={7}/>
      </div>
    </div>
  );
};
