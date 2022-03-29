// Note: we can't use mathjs/number due to https://github.com/josdejong/mathjs/issues/2284
// import { create, simplifyDependencies, unitDependencies, parseDependencies } from "mathjs";
import { create, all } from "mathjs";

// https://mathjs.org/docs/custom_bundling.html
// const math = create({ simplifyDependencies, unitDependencies,
// parseDependencies });
const math = create({ all });
const { simplify, unit, parse, createUnit, evaluate, number } = math;

// The types don't give access to the Unit class object, but I think it is there.
const { Unit } = math as any;
export { simplify, unit, parse, createUnit, evaluate, number, Unit };
