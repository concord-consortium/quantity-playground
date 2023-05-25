export const kMaxNameCharacters = 27;
export const kMaxNotesCharacters = 255;

// We specifically disallow "", which converts to 0 when cast as a number
export const isValidNumber = (v: string) => v !== "" && !isNaN(+v);

// Only letters, digits, and underscores are allowed in variable names,
// and the first character must be a letter.
export const processName: (name: string) => string = name => (
  // name.length > 0 && name.match(/^[^a-zA-Z]\W*/)
  name.length > 0 && name.match(/^[^a-zA-Z]/)
  ? processName(name.slice(1))
  : name.replace(/\W/g, "")
);
