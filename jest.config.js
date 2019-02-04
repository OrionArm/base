module.exports = {
    testEnvironment: "jest-environment-jsdom",
    testRegex: "(src/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    testMatch: null,
    moduleNameMapper: {
        "\\.(css|scss)$": "<rootDir>/__mocks__/style-mock.ts",
    },
    moduleDirectories: ["node_modules", "src"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    setupFiles: [
        "<rootDir>/__tests__/setup.ts",
        "<rootDir>/__mocks__/browser-mocks.ts",
    ],
    transform: {
        ".(ts|tsx)": "ts-jest",
        "^.+\\.jsx?$": "babel-jest",
    },
    transformIgnorePatterns: [
        "<rootDir>/node_modules/(?!react-popper|reactstrap|jest-runtime)",
    ],
    modulePathIgnorePatterns: ["<rootDir>/build"],
    snapshotSerializers: ["enzyme-to-json/serializer"],
}
