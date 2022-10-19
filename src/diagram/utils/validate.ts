export const validateName = (name: string) => {
  return name.length <= 30;
};

export const validateNotes = (notes: string) => {
  return notes.length <= 255;
};
