import React from "react";
import { CirclePicker } from "react-color";
import { VariableType } from "../models/variable";
import { Colors, colorPalette } from "../utils/theme-utils";

import "./color-editor.scss";

interface IProps {
  variable: VariableType
  onShowColorEditor: (show: boolean) => void;
}

export const ColorEditor = ({variable, onShowColorEditor}: IProps) => {
  const colorsForPicker = colorPalette.map(c => c.hex);
  const selectedColorHex = colorPalette.find(c => c.name === variable.color)?.hex || "#e6e6e6";

  const handleColorChange = (evt: any) => {
    const colorName = colorPalette.find(c => c.hex === evt.hex)?.name || Colors.LightGray;
    variable.setColor(colorName);
    onShowColorEditor(false);
  };

  return (
    <div className="color-editor-dialog" title="color picker">
      <div className="variable-info-row">
        <CirclePicker
          circleSize={14}
          circleSpacing={8}
          color={selectedColorHex}
          colors={colorsForPicker}
          width={"132px"}
          onChange={handleColorChange}
        />
      </div>
    </div>
  );
};
