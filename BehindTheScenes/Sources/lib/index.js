module.exports = {
  compileProject: require('./compiler').compileProject,
  startServer: require('./server').startServer,
  initConfig: require('./config').initConfig,
  generateId: require('./config').generateId,
  extendParser: require('./customSyntax').extendParser
};