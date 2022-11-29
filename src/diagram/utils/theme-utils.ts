export enum Colors {
  Blue = "blue",
  Red = "red",
  Gray = "gray",
  Green = "green",
  LightGray = "light-gray",
  Yellow = "yellow"
}

export interface IColors {
  name: string;
  hex: string;
}

export interface ILegacyColors {
  name: string;
  hex: string;
  replacement: string;
}

export const colorPalette: IColors[] = [
  {name: "light-gray", hex: "#e6e6e6"},
  {name: "gray", hex: "#d4d4d4"},
  {name: "blue", hex: "#addef4"},
  {name: "green", hex: "#b7e690"},
  {name: "yellow", hex: "#f7e58f"},
  {name: "red", hex: "#ffc7bf"}
];

export const legacyColors: ILegacyColors[] = [
  {name: "orange", hex: "#ff6900", replacement: "yellow"},
  {name: "light orange", hex: "#e98b42", replacement: "yellow"},
  {name: "light green", hex: "#7bdcb5", replacement: "green"},
  {name: "green", hex: "#00d084", replacement: "green"}, 
  {name: "light blue", hex: "#8ed1fc", replacement: "blue"}, 
  {name: "blue", hex: "#0693e3", replacement: "blue"},
  {name: "gray", hex: "#abb8c3", replacement: "gray"},
  {name: "red", hex: "#eb144c", replacement: "red"},
  {name: "pink", hex: "#f78da7", replacement: "red"},
  {name: "purple", hex: "#9900ef", replacement: "red"}
];
