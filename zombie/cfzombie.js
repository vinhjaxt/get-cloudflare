const Zombie = require('zombie');
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
  let browser = new Zombie({
    userAgent: UserAgent,
    loadCSS: false,
    runScripts: true,
    headers: {
      'User-Agent': UserAgent,
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': urlToGet,
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1'
    }
  });
  const parseURL = url.parse(urlToGet,true);
  const hostname = parseURL.hostname;

  if(!lastCookies[hostname]) lastCookies[hostname] = [];

  browser.visit(urlToGet)
  .then(function() {
    browser.tabs.closeAll();
    callback(null, browserCookieToRequest(lastCookies[hostname]));
  })
  .catch(function(error) {
    // code 502 is expected
    let html = browser.html();
    if(~html.indexOf('id="challenge-form"') && ~html.indexOf('id="jschl-answer"')){
      browser.wait({ duration: 6000 }, function () {
        browser.tabs.closeAll()
      });
    }else{
      callback(error, html);
      browser.tabs.closeAll()
    }
  });
  browser.on('redirect', function(req, res) {
    res.text().then(function(content){
      lastCookies[hostname] = browser.cookies.map(function (cookie){
        return {
          name: cookie.key,
          value: cookie.value,
          path: cookie.path,
          domain: cookie.domain
        }
      });
      callback(null, browserCookieToRequest(lastCookies[hostname]));
      browser.tabs.closeAll()
    }).catch(function(e){
      callback(e, null);
      browser.tabs.closeAll()
    });
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
