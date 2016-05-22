'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _request=require('request');var _request2=_interopRequireDefault(_request);var _chalk=require('chalk');var _chalk2=_interopRequireDefault(_chalk);var _fs=require('fs');var _fs2=_interopRequireDefault(_fs);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}var callback=function callback(resolve,reject){return function(error,response,body){if(error){reject('Resource temporarily unavailable');}if(body){var bodyParse=JSON.parse(body);if(!bodyParse||bodyParse.error){reject(bodyParse.error);}resolve(bodyParse);}resolve(true);};};var http={post:function post(url){var data=arguments.length<=1||arguments[1]===undefined?[]:arguments[1];return new Promise(function(resolve,reject){_request2.default.post(url,data,callback(resolve,reject));}).catch(function(error){console.error(_chalk2.default.red(error));process.exit();});},get:function get(url){var delay=arguments.length<=1||arguments[1]===undefined?0:arguments[1];return new Promise(function(resolve,reject){setTimeout(function(){(0,_request2.default)(url,callback(resolve,reject));},delay);}).catch(function(error){console.error(_chalk2.default.red(error));process.exit();});},put:function put(url,file){return new Promise(function(resolve,reject){_fs2.default.createReadStream(file).pipe(_request2.default.put(url,{},callback(resolve,reject)));}).catch(function(error){console.error(_chalk2.default.red(error));process.exit();});}};exports.default=http;