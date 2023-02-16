// Note: we can't use mathjs/number due to https://github.com/josdejong/mathjs/issues/2284
import { create, simplifyDependencies, unitDependencies, 
  parseDependencies, evaluateDependencies, toDependencies,
  createUnitDependencies } from "mathjs";

// This reduces the size of the bundle, see:
// https://mathjs.org/docs/custom_bundling.html
const math = create({ simplifyDependencies, unitDependencies, parseDependencies, 
  evaluateDependencies, toDependencies, createUnitDependencies });

const deleteUnits: string[] = [];
// const deleteUnits = ["b", "hour", "hours", "hr", "minute"];
deleteUnits.forEach((u: string) => (math as any).Unit.deleteUnit(u));

// When adding new features you might want to comment out the statements above and 
// uncomment these 2 lines below. This way all of mathjs is available. After the 
// code is working you can go back and figure out what specific dependencies are 
// needed.
// import { create , all } from "mathjs";
// const math = create({ all });

const { simplify, unit, parse, createUnit, evaluate, number, isUnit } = math;

// The types don't give access to the Unit class object, but it is there.
const { Unit } = math as any;

const isAlphaOriginal = Unit.isValidAlpha;
Unit.isValidAlpha = function (c: string) : boolean{
  return isAlphaOriginal(c) || c === "$";
};

export { simplify, unit, parse, createUnit, evaluate, number, isUnit, Unit };
