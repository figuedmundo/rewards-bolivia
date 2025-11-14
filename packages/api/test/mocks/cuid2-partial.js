let counter = 0;
export const createId = jest.fn(() => `mocked_cuid_${counter++}`);

export default {
  createId,
};