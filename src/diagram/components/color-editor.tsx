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
            "#FF6900",
            "#e98b42",
            "#7BDCB5",
            "#00D084",
            "#8ED1FC",
            "#0693E3",
            "#ABB8C3",
            "#EB144C",
            "#F78DA7",
            "#9900EF"
          ]} circleSize={14} circleSpacing={7}/>
      </div>
    </div>
  );
};
