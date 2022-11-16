export const kMaxNameCharacters = 30;
export const kMaxNotesCharacters = 255;

// We specifically disallow "", which converts to 0 when cast as a number
export const isValidNumber = (v: string) => v !== "" && !isNaN(+v);

export const processName = (name: string) => name.replace(/ /g, "");
