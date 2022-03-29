// `allMeasures` includes all the measures packaged with this library
import { SymbolNode } from "mathjs";
import { unit, parse, createUnit, Unit } from "../custom-mathjs";

type ConversionFunction = (input: number) => number;

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

export const getUnitConversion = (inputUnit:string, outputUnit:string): ConversionFunction | null => {
  
  if (inputUnit === outputUnit) {
      return value => value;
  }

  // First check if we can actual do this conversion by checking the bases of
  // the two units.  I'm not sure if this will handle compound units.
  
  const inputMathUnit = getMathUnit(1, inputUnit);
  const outputMathUnit = getMathUnit(1, outputUnit);

  if (!inputMathUnit || !outputMathUnit) {
      return null;
  }

  if (!inputMathUnit.equalBase(outputMathUnit)) {
    return null;
  }

  return value => unit(value, inputUnit).toNumber(outputUnit);
};
