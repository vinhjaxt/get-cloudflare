var request = require('.')
process.on('uncaughtException', function (err){
  console.error('process.uncaughtException: ',err);
});

var i=0;
setInterval(function () {
  i++;
  let ok1 = i.toString()+'ok1';
  let ok2 = i.toString()+'ok2';
  let ok3 = i.toString()+'ok3';
  let ok4 = i.toString()+'ok4';

  // First request
  console.time(ok1);
  request({
    method: 'GET',
    url: 'https://bittrex.com/',
    gzip: true
    }, function (e,r,b) {
      if (e) {
        console.error(e);
        return
      }
      console.timeEnd(ok1);
      
      // Other request
      console.time(ok2);
      request({
        method: 'GET',
        url: 'https://www.bittrex.com/?'+(+new Date()),
        gzip: true
        }, function (e,r,b) {
          if (e) {
            console.error(e);
            return
          }
          console.timeEnd(ok2);
      });
  });


  // First request
  console.time(ok3);
  request({
    method: 'GET',
    url: 'http://klassprof.org/',
    gzip: true
    }, function (e,r,b) {
      if (e) {
        console.error(e);
        return
      }
      console.timeEnd(ok3);
      
      // Other request
      console.time(ok4);
      request({
        method: 'GET',
        url: 'http://klassprof.org/?'+(+new Date()),
        gzip: true
        }, function (e,r,b) {
          if (e) {
            console.error(e);
            return
          }
          console.timeEnd(ok4);
      });
  });

  
},8000);

