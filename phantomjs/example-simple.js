var request = require('.');
// First request
request({
  method: 'GET',
  url: 'http://klassprof.org/',
  gzip: true
  }, function (e,r,b) {
    if (e) {
      console.error(e);
      return
    }
    console.log(r.headers);
    console.log(b);
    console.log(request.getUa());
    console.log(request.getCookies());
    request.closePhantomjs();
});
