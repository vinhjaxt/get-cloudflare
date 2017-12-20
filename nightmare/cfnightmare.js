var Nightmare = require('nightmare');
require('nightmare-load-filter')(Nightmare);
const request = require('request');
const url = require('url');;

let lastCookies = {};

function browserCookieToRequest(cookies){
  if(cookies instanceof Array)
    return cookies.map(function (cookie){
      return cookie.name+'='+cookie.value;
    }).join('; ');
  else
    return ''
}

const UserAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36';

function getCloudFlareCookie(urlToGet, callback) {
  let nightmareEnded = false;
  let nightmare = Nightmare({
//      waitTimeout: 7000, // in ms .wait
//      gotoTimeout: 5000, // in ms .goto
//      loadTimeout: 6000, // in ms
//      executionTimeout: 10000, // in ms .evaluate
      width: 1000,
      height: 1200,
      webPreferences:{
        nodeIntegration: false,
        allowRunningInsecureContent: true,
        images: false,
        webgl: false,
        webaudio: false,
      },
      show: false,
      openDevTools: false,
      typeInterval: 0,
    }).useragent(UserAgent);

  const parseURL = url.parse(urlToGet,true);
  const hostname = parseURL.hostname;
  if(!lastCookies[hostname]) lastCookies[hostname] = [];
  let timeout;
  nightmare.then(function (){
    timeout = setTimeout(function (){
      try{
        if(!nightmareEnded){
          nightmare.end().then(function (){
            nightmareEnded = true;
          })
        }
      }catch(e){}
    }, 15000);
  }).then(function (){
    nightmare.filter({
      urls: ['*'],
    }, function(details, cb) {
      let cancel = false;
      if(/\.css$/i.test(details.url)) cancel = true;
      return cb({ cancel: cancel });
    }).goto(urlToGet,{
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': urlToGet,
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1'
    })
    .wait(6000)
    .then(function() {
      return nightmare.cookies.get({ url: urlToGet }).then(function (cookies){
        lastCookies[hostname] = cookies;
        callback(null, browserCookieToRequest(cookies));
      }).catch(function (error){
        callback(error, null);
      });
    })
    .then(function (){
      try{
        if(!nightmareEnded){
          nightmare.end().then(function (){
            nightmareEnded = true;
            clearTimeout(timeout);
          })
        }
      }catch(e){}
    })
    .catch(function(error) {
      callback(error, null);
      try{
        if(!nightmareEnded){
          nightmare.end().then(function (){
            nightmareEnded = true;
            clearTimeout(timeout);
          })
        }
      }catch(e){}
    });
  })
  .catch(function(error) {
    callback(error, null);
    try{
      if(!nightmareEnded){
        nightmare.end().then(function (){
          nightmareEnded = true;
          clearTimeout(timeout);
        })
      }
    }catch(e){}
  });
}

function requestCaller(options, callback) {
  let args = arguments;
  let self = this;
  if(typeof(options) === "string") options = {
    url: options
  };
  const parseURL = url.parse(options['url']);
  const hostname = parseURL.hostname;
  let requesOptions = Object.assign({},options);
  requesOptions = Object.assign(requesOptions, {
    'headers': {
      'Cookie': browserCookieToRequest(lastCookies[hostname]),
      'User-Agent': UserAgent,
      'Accept-Language': 'en-US,en;q=0.5',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1'
    },
    gzip: true
  });
  requesOptions['headers']['Referer'] = requesOptions['url'];
  request(requesOptions, function(e,r,b) {
    if(~b.indexOf('id="challenge-form"') && ~b.indexOf('id="jschl-answer"')){
      getCloudFlareCookie(requesOptions['url'], function (e, cookie){
        if(e){
          return callback('Error, cant get cloudflare cookie: '+ e);
        }
        requestCaller.apply(self,args);
      });
      return
    }
    return callback.apply(callback, arguments);
  });
}

requestCaller.getUa = function () {
  return UserAgent;
}

requestCaller.getUserAgent = function () {
  return UserAgent;
}

requestCaller.getCookie = function (domain) {
  return requestCaller.getCookies(domain);
}
requestCaller.getCookies = function (domain) {
  if(typeof(domain) === 'undefined') {
    let cookies = {};
    for(domain in lastCookies) {
      cookies[domain] = browserCookieToRequest(lastCookies[domain]);
    }
    return cookies;
  }
  return browserCookieToRequest(lastCookies[domain]);
}

module.exports = requestCaller;
