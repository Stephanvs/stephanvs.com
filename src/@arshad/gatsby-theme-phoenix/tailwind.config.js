const merge = require("deepmerge");
const base = require("@arshad/gatsby-theme-phoenix/src/tailwind.config");

module.exports = merge(base, {
  theme: {
    colors: {
      primary: "#D42C68",
    },
  },
});
