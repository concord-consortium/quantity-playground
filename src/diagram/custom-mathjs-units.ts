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

export const customUnitsArray = [
  { unit: "cat", options: { aliases: ["cats"] } }
];

export const customUnitsMap: { [id: string]: number } = {};
customUnitsMap.cat = 0;

export const addCustomUnit = (unit: string, options?: any) => {
  if (unit in Object.keys(customUnitsMap)) return;

  customUnitsArray.push({ unit, options });
  customUnitsMap[unit] = customUnitsArray.length - 1;
};
