import React from "react";
import Circle from "@uiw/react-color-circle";
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

  const handleColorChange = (color: { hex: string }) => {
    const colorName = colorPalette.find(c => c.hex === color.hex)?.name || Colors.LightGray;
    variable.setColor(colorName);
    onShowColorEditor(false);
  };

  return (
    <div className="color-editor-dialog" title="color picker">
      <Circle
        color={selectedColorHex}
        colors={colorsForPicker}
        pointProps={{ style: { width: 14, height: 14 } }}
        style={{ gap: 8, width: 132 }}
        onChange={handleColorChange}
      />
    </div>
  );
};
