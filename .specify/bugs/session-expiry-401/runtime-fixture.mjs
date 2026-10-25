// Work-only synthetic HTTP fixture: never a substitute for backend/DB evidence.
import http from 'node:http';
const user = { id: 'demo-user', name: 'Demo User', userSe: 'GNR', uniqId: 'synthetic', roles: ['ROLE_ADMIN'] };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const loggedIn = (req.headers.cookie || '').includes('SYNTHETIC_SESSION=active');
  res.setHeader('Content-Type', 'application/json');
  if (url.pathname === '/auth/me') {
    res.end(JSON.stringify(loggedIn ? {resultCode: 200, resultVO: user} : {resultCode: '401', resultMessage: 'not authenticated'}));
  } else if (url.pathname === '/mainPage') {
    res.end(JSON.stringify({resultCode: 200, result: {notiList: [], galList: []}}));
  } else if (url.pathname === '/bbsMaster' || url.pathname === '/fixture/expired') {
    res.statusCode = 401;
    res.end(JSON.stringify({resultCode: '401', resultMessage: 'invalid or expired token'}));
  } else if (url.pathname === '/fixture/probe401') {
    res.statusCode = 401;
    res.end('');
  } else {
    res.end(JSON.stringify({resultCode: 200, result: {}}));
  }
}).listen(8080, '127.0.0.1', () => console.log('Synthetic HTTP fixture on 127.0.0.1:8080'));
