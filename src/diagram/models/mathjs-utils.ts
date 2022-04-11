// This direct import of mathjs is just for the types. All the actual code is imported
// by custom-math.js which reduces the amount of mathjs code that is imported. 
// Importing the types like this doesn't seem to increase the size of the bundle.
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

// 1. use string replace of the inputNames with backticks
// 2. then find all symbols and look for matches in those symbols
// 3. if they match replace them 
export const replaceInputNames = (expression: string, inputNames: (string | undefined)[]) => {
  let localExpression = expression;

  console.log("replaceInputNames");
  inputNames.forEach((name, index) => {
    if (!name) {
      return;
    }
    localExpression = localExpression.replace("`" + name + "`", `input_${index}`);
  });

  console.log(localExpression);
  try {
    const expressionNode = parse(localExpression);
    const symbols = expressionNode.filter(node => "isSymbolNode" in node && node.isSymbolNode) as SymbolNode[];
    for(const symbol of symbols) {
      inputNames.forEach((name, index) => {
        if (symbol.name === name) {
          symbol.name = `input_${index}`;
        }
      });
    }
    console.log(expressionNode.toString());
    return expressionNode.toString();
  } catch (e) {
    // if there is parse error just return the expression for now
    return localExpression;
  }
};
