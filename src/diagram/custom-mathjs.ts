// Note: we can't use mathjs/number due to https://github.com/josdejong/mathjs/issues/2284
import { create, simplifyDependencies, unitDependencies, 
  parseDependencies, evaluateDependencies, toDependencies,
  createUnitDependencies } from "mathjs";

import { customUnitsArray, deleteUnits, IUnit } from "./custom-mathjs-units";

export interface IMathLib {
  simplify: math.Simplify;
  unit: any;
  parse: math.ParseFunction;
  createUnit: (name: string, definition?: string | math.UnitDefinition | undefined, options?: math.CreateUnitOptions | undefined) => math.Unit;
  evaluate: (expr: math.MathExpression | math.MathExpression[], scope?: object | undefined) => any;
  number: (value?: string | number | boolean | math.MathArray | math.Matrix | math.Unit | math.BigNumber | math.Fraction | null | undefined) => number | math.MathArray | math.Matrix;
  isUnit: (x: unknown) => x is math.Unit;
  Unit: any;
}
function createMath(): IMathLib {
  // This reduces the size of the bundle, see:
  // https://mathjs.org/docs/custom_bundling.html
  const m = create({ simplifyDependencies, unitDependencies, parseDependencies,
    evaluateDependencies, toDependencies, createUnitDependencies });

  // When adding new features you might want to comment out the statements above and 
  // uncomment these 2 lines below. This way all of mathjs is available. After the 
  // code is working you can go back and figure out what specific dependencies are 
  // needed.
  // import { create , all } from "mathjs";
  // const m = create({ all });

  // The types don't give access to the Unit class object, but it is there.
  const mathUnit = (m as any).Unit;

  deleteUnits.forEach((u: string) => mathUnit.deleteUnit(u));
  customUnitsArray.forEach((u: IUnit) => m.createUnit(u.unit, u.options));

  const isAlphaOriginal = mathUnit.isValidAlpha;
  mathUnit.isValidAlpha = function (c: string): boolean {
    return isAlphaOriginal(c) || c === "$";
  };

  return {
    simplify: m.simplify,
    unit: m.unit,
    parse: m.parse,
    createUnit: m.createUnit,
    evaluate: m.evaluate,
    number: m.number,  
    isUnit: m.isUnit,
    Unit: mathUnit
  };
}

export { createMath, };
