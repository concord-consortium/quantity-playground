import { CreateUnitOptions, SymbolNode } from "mathjs";
import { action, makeObservable, observable } from "mobx";
import * as pluralize from "pluralize";
import { IMathLib } from "./utils/mathjs-utils";

export interface IUnit {
  unit: string;
  options?: CreateUnitOptions;
}

export class UnitsManager {
  // A list of custom units added to mathjs. This list will grow as a user adds custom units.
  // Built-in custom units can also be added here. They should look like:
  // { unit: "cat", options: { aliases: ["cats"] } }
  units: IUnit[] = observable.array<IUnit>();

  constructor() {
    makeObservable(this);
  }

  @action
  addUnit(unit: string, options?: CreateUnitOptions) {
    if (this.units.find((iunit: IUnit) => iunit.unit === unit)) return;
    this.units.push({ unit, options });   
  }

  // This is not an action because we want changes in the units to be observed
  // and trigger initializeMath to be run again
  initializeMath(m: math.MathJsStatic) {
    // The types don't give access to the Unit class object, but it is there.
    const mathUnit = (m as any).Unit;

    const isAlphaOriginal = mathUnit.isValidAlpha;
    mathUnit.isValidAlpha = function (c: string): boolean {
      return isAlphaOriginal(c) || c === "$" || c === "_";
    };
  
    deleteUnits.forEach((u: string) => mathUnit.deleteUnit(u));
    this.units.forEach((u: IUnit) => {
      // createUnit has two versions:
      //   createUnit(name: string, definition?: string | UnitDefinition, options?: CreateUnitOptions): Unit;
      //   createUnit(units: Record<string, string | UnitDefinition>, options?: CreateUnitOptions): Unit;
      // If u.options is undefined and we call `m.createUnit(u.unit, u.options);` Typescript's overloading
      // support fails for some reason. So this is split out to 2 function calls.
      try {
        if (u.options) {
          m.createUnit(u.unit, u.options);
        } else {
          m.createUnit(u.unit);
        }  
      } catch (e) {
        // Ignore any invalid units. If we remove them from the units array that will trigger loop.
        // In practice no invalid units should be added because they should be skipped during the call 
        // to `getMathUnit`.
      }
    });

    return mathUnit;
  }

  // NOTE: This method functions both as an action and a view. Technically it is only a MobX action because
  // it is tagged as an action. It is updating `this.units` which is an observable array, so it needs to
  // be an action so MobX is happy with this update. 
  // But it is functioning a view because it is called by other views. Specifically the MST views:
  // `Variable#mathValue` and `Variable#mathValueWithValueOr1` call it. Views should not call actions
  // because that can cause an infinite loop.
  // Even though getMathUnit is reading `this.units`, it won't *directly* 
  // trigger updates when `this.units` changes because it is tagged as an action.
  // However, it can trigger updates because it is updating `this.units`. 
  //
  // The interaction of this within the full system is complex. Below is a list of what happens currently.
  // However if the code is changed slightly, this might be out of date. When an equation is entered that uses
  // an input variable that has units:
  // - `computedValueIncludingMessageAndError` is called on equation variable 
  // - this calls `mathValue` on the input variable
  // - `mathValue` calls `self.math` which causes `unitsManager.initializeMath` to be called on the 
  //   mathLib of the input variable.
  // - then `unitsManager.getMathUnit` is called with this mathLib from the input variable
  // - this adds the units of the input variable to the unitsManager.units array.
  // - a temporary `mathValue` is returned for the input variable
  // - `computedValueIncludingMessageAndError` returns a value for the equation variable.
  // - because the units array was updated, and `self.math` is used by `mathValue`, this triggers
  //   any observers of the mathValue to be recomputed.
  // - this includes the `computedValueIncludingMessageAndError` called on the equation variable.
  // - so in other words a call to the view `computedValueIncludingMessageAndError` is triggering 
  //   update which means `computedValueIncludingMessageAndError` needs to be called again.
  // - in this second call, `unitsManager.getMathUnit` is called again, but this time the units exist
  //   so an endless loop does not happen.
  // 
  // TODO: Find a way to separate the action and view so the complex interaction above is simplified.
  // With the current setup I think the only way to do that is to add the units to the UnitsManager
  // as they are defined in the variables. And if we do that we probably should also clean up units
  // that are no longer used by variables. With that change, this `getMathUnit` could just be a 
  // "view".
  @action
  getMathUnit(value: number, unitString: string, mathLib: IMathLib): math.Unit | undefined {
    try {
      const isValidUnknownUnitName = (name: string) => {
        // MathJS doesn't handle empty string units.        
        // NOTE: this isn't really checking if the string is valid, it is just making sure it isn't
        // empty and is unknown. The Unit library is more strict about what is a valid unit,
        // however there isn't an easy way to access this without just trying to create a Value
        return name && !mathLib.Unit.isValuelessUnit(name);
      };

      const isNamePluralizeCanHandle = (name: string) => {
        return /^[a-zA-Z]\w*$/.test(name);
      };
      
      const registerUnit = (name: string, options?: CreateUnitOptions) => {
        // NOTE: this `createUnit` call only adds the unit to the passed in mathLib. 
        // Each variable has its own mathLib, so the other variable's mathLibs are not
        // updated here.
        // The system relies on MobX observing so those other variables can update their mathLibs
        // when a new unit is added by the `this.addUnit` above.
        if (options) {
          mathLib.createUnit(name, options);
        } else {
          // mathLib.createUnit fails if options is undefined
          mathLib.createUnit(name);
        }

        // This is called after the createUnit call on purpose. The createUnit call above will
        // throw an exception if the unit is invalid. In that case this addUnit call will never
        // happen. So the invalid unit will not be added to the unit manager.
        this.addUnit(name, options);
      };

      // Look for unknown units in the unit string
      const unitNode = mathLib.parse(unitString);
      const symbols = unitNode.filter(node => "isSymbolNode" in node && node.isSymbolNode) as SymbolNode[];
      for(const symbol of symbols) {
        // if the symbol isn't already a unit, make a unit for it
        if (isValidUnknownUnitName(symbol.name)) {
          if (isNamePluralizeCanHandle(symbol.name)) {
            const singular = pluralize.singular(symbol.name);
            const plural = pluralize.plural(symbol.name);
            if (!isValidUnknownUnitName(singular) || !isValidUnknownUnitName(plural)) {
              // If the singular or plural is already a unit or not a valid unit, just add the initial name
              registerUnit(symbol.name);
            } else {
              // Otherwise, add them both as synonyms
              registerUnit(singular, { aliases: [plural] });
            }
          } else {
            registerUnit(symbol.name);
          }
        }
      }
      return mathLib.unit(value, unitString);
    } catch (e: any) {
      // Do nothing just return undefined
    }
  }  
}


// A list of built-in units to delete.
export const deleteUnits = [
  // Length
  "link", "links", "li", "rod", "rods", "rd", "chain", "chains", "ch",
  "angstrom", "angstroms", "mil",

  // Surface area
  "sqch", "sqmil",

  // Volume
  "l", "lt",

  // Liquid volume
  "minim", "minims", "fluiddram", "fluiddrams", "fldr", "gill", "gills", "gi", "cp", "beerbarrel",
  "beerbarrels", "bbl", "oilbarrel", "oilbarrels", "obl", "hogshead", "hogsheads", "drop", "gtt",

  // Angles
  "grad", "gradian", "gradians", "cycle", "cycles", "arcsec", "arcsecond", "arcseconds",
  "arcmin", "arcminute", "arcminutes",

  // Frequency
  "Hertz", "Hz", "hertz",

  // Mass
  "grain", "grains", "gr", "dram", "drams", "dr", "lbm", "hundredweight", "hundredweights", "cwt",
  "stick", "sticks", "stone",

  // Electric current
  "A", "ampere", "amperes",

  // Temperature
  "rankine", "degR",

  // Amount of substance
  "mol", "mole", "moles",

  // Luminous intensity
  "cd", "candela",

  // Force
  "N", "newton", "dyn", "dyne", "lbf", "poundforce", "kip", "kips", "kilogramforce", "kgf",

  // Energy
  "J", "joule", "joules", "erg", "Wh", "BTU", "BTUs", "eV", "electronvolt", "electronvolts",

  // Power
  "W", "watt", "watts", "hp",

  // Electrical power units
  "VAR", "VA",

  // Pressure
  "PA", "psi", "atm", "bar", "torr", "mmHg", "mmhg", "mmH2O", "mmh2o", "cmH2O", "cmh2o",

  // Electricity and magnetism
  "coulomb", "coulombs", "C", "farad", "farads", "F", "volt", "volts", "V", "ohm", "ohms",
  "henry", "H", "siemens", "S", "weber", "webers", "Wb", "tesla", "teslas", "T",

  // Binary
  "b", "bit", "bits", "B", "byte", "bytes",
];
