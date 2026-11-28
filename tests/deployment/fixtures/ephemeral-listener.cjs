const { Server } = require('node:http');

const listen = Server.prototype.listen;
Server.prototype.listen = function () {
  this.once('listening', () => {
    process.send({ url: `http://127.0.0.1:${this.address().port}` });
  });
  return listen.call(this, 0, '127.0.0.1');
};
