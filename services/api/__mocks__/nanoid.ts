let counter = 0;

export const nanoid = (size?: number): string => {
  counter++;
  const id = `mock-id-${counter}`;
  return size ? id.substring(0, size) : id;
};
