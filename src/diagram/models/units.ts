// `allMeasures` includes all the measures packaged with this library
import math, { SymbolNode } from "mathjs";
import { unit, parse, createUnit, Unit } from "../custom-mathjs";

export const getMathUnit = (value: number, unitString: string): math.Unit | undefined => {
  try {
    // Look for unknown units in the unit string
    const unitNode = parse(unitString);
    const symbols = unitNode.filter(node => "isSymbolNode" in node && node.isSymbolNode) as SymbolNode[];
    for(const symbol of symbols) {
      // if the symbol isn't already a unit, make a unit for it
      if (!Unit.isValuelessUnit(symbol.name)) {
        createUnit(symbol.name);
      }
    }
    return unit(value, unitString);
  } catch (e: any) {
    // Do nothing just return undefined
  }
};
