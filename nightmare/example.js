var request = require('.')

setInterval(function () {
  // First request
  request({
    method: 'GET',
    url: 'https://bittrex.com/',
    gzip: true
    }, function (e,r,b) {
      if (e) {
        console.error(e);
        return
      }
      console.log(r.headers);
      console.log(request.getUa());
      console.log(request.getCookies());
      
      // Other request
      request({
        method: 'GET',
        url: 'https://bittrex.com/?'+(+new Date()),
        gzip: true
        }, function (e,r,b) {
          if (e) {
            console.error(e);
            return
          }
          console.log('OK2');
      });


  });


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
      console.log('OK3');
      
      // Other request
      request({
        method: 'GET',
        url: 'http://klassprof.org/?'+(+new Date()),
        gzip: true
        }, function (e,r,b) {
          if (e) {
            console.error(e);
            return
          }
          console.log('OK4');
      });


  });

  
},8000);

