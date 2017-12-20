var requestCF = require('.')

// Other request
console.time('crawl');
var requester = new requestCF();
requester.config({
  userAgent: 'my User agent'
});

requester.request({
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
    console.log(requester.getCookie('https://bittrex.com/'));
    console.log(requester.getUa());
});
