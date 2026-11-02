export const StyleSheet = {
  create: () => new Proxy({}, { get: () => ({}) }),
};
