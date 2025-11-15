let counter = 0;
export const createId = jest.fn(() => `mocked_cuid_${counter++}`);
export const cuid = createId; // cuid is an alias for createId
export const init = jest.fn(); // Some dependencies might expect this

export default {
  createId,
  cuid,
  init,
};
