require("@babel/register");
require("@babel/polyfill/noConflict");
require("dotenv").config();

const server = require("../../src/server").default;

export default () => {
  global.httpTestServer = server
    .listen({
      port: process.env.PORT || 4000,
    })
    .then(({ url }) => console.log(`Test server up and running at ${url}`));
};
