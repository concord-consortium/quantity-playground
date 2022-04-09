// `allMeasures` includes all the measures packaged with this library
import { SymbolNode } from "mathjs";
import { unit, parse, createUnit, Unit } from "../custom-mathjs";

export const getMathUnit = (value: number, unitString: string) => {
  try {
    // Look for unknown units in the unit string
    const unitNode = parse(unitString);
    const symbols = unitNode.filter(node => "isSymbolNode" in node && node.isSymbolNode) as SymbolNode[];
    for(const symbol of symbols) {
      if (Unit.isValuelessUnit(symbol.name)) {
        // this unit already exists
      } else {
        createUnit(symbol.name);
      }
    }
    return unit(value, unitString);
  } catch (e: any) {
    // Do nothing just return undefined
  }
};
