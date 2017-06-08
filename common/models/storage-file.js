'use strict';

var CONTAINER_URL = '/api/containers/';

module.exports = function(StorageFile) {
  StorageFile.upload = function(ctx, options, cb) {
    options = options || {};
    // 首先创建好目录 /server/storage/common
    ctx.req.params.container = 'common';
    /**
     * ctx.req    express request object
     * ctx.result express response object
     */
    StorageFile.app.models.Container.upload(ctx.req, ctx.result,
      options, function(err, fileObj) {
        if (err) {
          return cb(null, {
            status: 'failed',
            message: err.message,
          });
        } else {
          // 此处 “file” 应当与表单中的 field name 相同
          var fileInfoArr = fileObj.files.file;
          var objs = [];
          fileInfoArr.forEach(function(item) {
            objs.push({
              name: item.name,
              type: item.type,
              url: CONTAINER_URL + item.container +
                    '/download/' + item.name,
            });
          });
          StorageFile.create(objs, function(err, instances) {
            if (err) {
              return cb(null, {
                message: err.message,
              });
            } else {
              cb(null, instances);
            }
          });
        }
      });
  };

  StorageFile.remoteMethod(
    'upload', {
      description: 'Upload a file or more files',
      accepts: [
        {arg: 'ctx', type: 'object', http: {source: 'context'}},
        {arg: 'options', type: 'object', http: {source: 'query'}},
      ],
      returns: {
        arg: 'fileObject', type: 'object', root: true,
      },
      http: {verb: 'post'},
    }
  );
};
