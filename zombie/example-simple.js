var request = require('.')

// Other request
console.time('crawl');
request({
  cookies: 'myCookie=hihi; myOtherCookie=loveYou',
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
