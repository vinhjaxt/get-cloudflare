var requestCF = require('.')

// Other request
console.time('crawl');
var request = new requestCF({
  userAgent: 'my User agent',
  method: 'GET',
  url: 'https://bittrex.com/?'+(+new Date()),
  gzip: true
  }, function (e,r,b) {
    if (e) {
      console.error(e);
      return
    }
    console.timeEnd('crawl');
    console.log('OK');
    console.log(r.headers,b);
    console.log(request.getCookie('https://bittrex.com/'));
    console.log(request.getUa());
});
