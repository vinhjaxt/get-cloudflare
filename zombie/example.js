var request = require('.')

setInterval(function () {
  // First request
  console.time('ok1');
  request({
    method: 'GET',
    url: 'https://bittrex.com/',
    gzip: true
    }, function (e,r,b) {
      if (e) {
        console.error(e);
        return
      }
      console.timeEnd('ok1');
      console.log('OK1');
      
      // Other request
      console.time('ok2');
      request({
        method: 'GET',
        url: 'https://bittrex.com/?'+(+new Date()),
        gzip: true
        }, function (e,r,b) {
          if (e) {
            console.error(e);
            return
          }
          console.timeEnd('ok2');
          console.log('OK2');
      });


  });


  // First request
  console.time('ok3');
  request({
    method: 'GET',
    url: 'http://klassprof.org/',
    gzip: true
    }, function (e,r,b) {
      if (e) {
        console.error(e);
        return
      }
      console.timeEnd('ok3');
      console.log('OK3');
      
      // Other request
      console.time('ok4');
      request({
        method: 'GET',
        url: 'http://klassprof.org/?'+(+new Date()),
        gzip: true
        }, function (e,r,b) {
          if (e) {
            console.error(e);
            return
          }
          console.timeEnd('ok4');
          console.log('OK4');
      });


  });

  
},8000);

