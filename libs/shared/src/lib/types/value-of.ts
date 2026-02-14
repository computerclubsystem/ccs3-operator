// TODO: shared library depends on other libraries like messages
// and it is a problem exposing something that must be used in messages library

// export const __dummy = {}; // keeps the module so it is not tree-shaken

// // For usage with enums:
// // export const MyType = {
// //   prop1: 'prop1',
// // } as const;
// // export type MyType = ValueOf<typeof MyType>;
// export type ValueOf<T> = T[keyof T];
