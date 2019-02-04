const myGlobal: any = global
// myGlobal.Headers = require("node-fetch").Headers

const createMyStorage = () => ({
  removeItem: jest.fn(),
  setItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn(),
})

myGlobal.localStorage = createMyStorage()
myGlobal.sessionStorage = createMyStorage()
