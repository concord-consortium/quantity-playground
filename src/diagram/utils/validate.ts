export const kMaxNameCharacters = 30;
export const kMaxNotesCharacters = 255;

export const isValidNumber = (v: string) => !isNaN(+v);

export const processName = (name: string) => name.replace(/ /g, "");
