
process.argv.reduce((param, current) => {
    if (param.length) {
        process.argv[param] = current;
        current = '';
    } else if (current[0] == '-') {
        current = current.replace(/^-+/, '');
        process.argv[current] = true;
    }
    return current;
}, '');

if (process.argv.help) {
    console.log(`Penggunaan:
    ${process.argv.self || 'qcdesa'} [--listen 80] [--passcode ADMIN_PASSWORD]

--listen    Port untuk diakses client via browser, default 80
--passcode  Password admin, default admin

Contoh:
    ${process.argv.self || 'qcdesa'} --listen 80 --passcode rahasia

`)
    process.exit();
}

const path = require('path');
const fs = require('fs');
if (path.basename(__dirname) === 'js') {
    process.chdir(path.resolve(__dirname, '..'));
} else {
    process.chdir(__dirname);
}

let SERVER_DIR, CLIENT_DIR;

if (fs.existsSync('server')) {
    // Guest from dist folder
    SERVER_DIR = path.join(__dirname, '../server');
    CLIENT_DIR = path.join(__dirname, '../client');
} else {
    SERVER_DIR = path.resolve(__dirname, '../../dist/server');
    CLIENT_DIR = path.resolve(__dirname, '../../dist/client');
}
const SERVER_JS = `${SERVER_DIR}/index.js`;

if (!fs.existsSync(SERVER_DIR) || !fs.existsSync(CLIENT_DIR)) {
    console.error('Tidak dapat menemukan direktori aplikasi JS qcdesa');
    process.exit(1);
}

console.log('Menjalankan Server..');
const caller = require('vm').runInThisContext(require('module').wrap(fs.readFileSync(SERVER_JS)));
try {
    caller(exports, require, module, SERVER_JS, SERVER_DIR);
    console.log('Server OK')
} catch (error) {
    console.error('Server ERROR: ', error);
}
console.log('Menjalankan Client..');
const http = require('http'),
    static = require('node-static'),
    httpProxy = require('http-proxy'),
    listen = process.argv.listen || 80;

const clientRoot = new static.Server(CLIENT_DIR);
const apiRoot = new static.Server(path.join(process.cwd(), 'data/public'), {
    
});
console.log("Public path", path.join(process.cwd(), 'data/public'));

const apiProxy = httpProxy.createProxyServer({ target: 'http://127.0.0.1:8888' })

/** @type {http.RequestListener} */
const requestHandler = (request, response) => {
    const urls = request.url.split('/').slice(1);
    console.log(urls);
    if (urls[0] == 'public') {
        request.url = request.url.replace(/^\/public/,'');
        apiRoot.serve(request, response);
    } else if (urls[0] == 'api') {
        if (urls[1] == 'public') {
            request.url = request.url.replace(/^\/api\/public/,'');
            apiRoot.serve(request, response);
        } else {
            apiProxy.web(request, response);
        }
    } else {
        request.addListener('end', function () {
            clientRoot.serve(request, response, (e, res) => {
                if (e && (e.status === 404)) { // Fallback index.html
                    clientRoot.serveFile('/index.html', 200, {}, request, response);
                }
            });
        }).resume();
    }
}

const server = http.createServer(requestHandler)
server.listen(listen, (err) => {
    if (err) {
        console.error(err);
        process.exit();
    }
    console.log(`Buka browser pada http://localhost${listen == 80 ? '' : ':' + listen}/`);
})