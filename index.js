module.exports = {
  nighmare: function () {
    return require('./nightmare');
  },
  phantomjs: function () {
    return require('./phantomjs');
  },
  zombie: function () {
    return require('./zombie');
  },
};