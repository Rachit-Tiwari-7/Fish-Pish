"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSSL = checkSSL;
const url_1 = require("url");
const https_1 = __importDefault(require("https"));
async function checkSSL(urlStr) {
    try {
        const url = new url_1.URL(urlStr);
        if (url.protocol !== 'https:') {
            return { secure: false, reason: 'Not HTTPS' };
        }
        return new Promise((resolve) => {
            const req = https_1.default.request({
                host: url.hostname,
                port: 443,
                method: 'HEAD',
                agent: new https_1.default.Agent({ rejectUnauthorized: false }) // Allow self-signed to detect them
            }, (res) => {
                const cert = res.socket.getPeerCertificate();
                if (!cert || Object.keys(cert).length === 0) {
                    resolve({ secure: false, reason: 'No Certificate' });
                    return;
                }
                const validFrom = new Date(cert.valid_from);
                const validTo = new Date(cert.valid_to);
                const now = new Date();
                const ageDays = (now.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24);
                const isSelfSigned = cert.issuer.CN === cert.subject.CN;
                resolve({
                    secure: true,
                    issuer: cert.issuer.O || cert.issuer.CN,
                    ageDays: Math.floor(ageDays),
                    isSelfSigned,
                    validTo: validTo.toISOString()
                });
            });
            req.on('error', () => {
                resolve({ secure: false, reason: 'Connection Failed' });
            });
            req.end();
        });
    }
    catch {
        return { secure: false, reason: 'Invalid URL' };
    }
}
