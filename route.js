let imp = require("directory-import");
let lodash = require("lodash");
let path = require("path");
/**
 *
 * @param {String} dirRoutes
 * @param {String} dirSchemas
 * @param {Boolean} dirAsPrefix
 */

function routes(dirRoutes = "./routes",dirSchemas = "./schemas", dirAsPrefix = false){
  return function (fastify, opt, done) {
    let schemas = imp({
      directoryPath: dirSchemas,
      importMethod: "sync",
    });

    imp({ directoryPath: dirRoutes, importMethod: "sync" },(routeName, routePath, routeMethod) => {
        let isModule = path.extname(routePath) === ".js";
        if (!isModule) throw new Error(`${routePath} not a module. The extension must be .js`);
        if (Object.prototype != routeMethod.__proto__)throw new Error("There must be an object. Example export module = {post: foo OR post:[{options},foo}]" );
        const url =
          routeName === "index"
            ? routePath.replace("index.js", "")
            : routePath.replace(".js", "");

        lodash.forEach(routeMethod, (methodArgs, methodName) => {
          let findSchema = routePath.replace(".js", "");
          let schema = lodash.has(schemas[`${findSchema}.json`], methodName)
            ? schemas[`${findSchema}.json`][methodName]
            : {};
          if (lodash.isFunction(methodArgs)) {
            if (!dirAsPrefix) {
              let index = routePath.indexOf(`/${routeName}`)
              let urlWithoutPrefix = routePath.slice(index,-3)
              
              fastify[methodName](urlWithoutPrefix,schema,routeMethod[methodName]);
            } else {
              fastify[methodName](url, schema, routeMethod[methodName]);
            }
          } else if (lodash.isArray(methodArgs)) {
            const [options] = methodArgs;

            if (!options.params) options.params = "";
            if (!options.prefix) options.prefix = "";
            if (!options.schema) options.schema = lodash.isEmpty(schema) ? {} : schema.schema;
            if (!dirAsPrefix) {
              let index = routePath.indexOf(`/${routeName}`)
              let urlWithoutPrefix = routePath.slice(index,-3)
              fastify[methodName](`${options.prefix}${urlWithoutPrefix}${options.params}`, ...methodArgs);
            } else {
              fastify[methodName](`${options.prefix}${url}${options.params}`,...methodArgs);
            }
          } else return new Error(`Route ${routePath} has invalid argumets`);
        });
      }
    );
    done();
  };
}
module.exports = routes;
