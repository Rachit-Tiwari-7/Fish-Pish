import { URL } from 'url';
import https from 'https';

export async function checkSSL(urlStr: string) {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'https:') {
      return { secure: false, reason: 'Not HTTPS' };
    }

    return new Promise((resolve) => {
      const req = https.request(
        {
          host: url.hostname,
          port: 443,
          method: 'HEAD',
          agent: new https.Agent({ rejectUnauthorized: false }) // Allow self-signed to detect them
        },
        (res) => {
          const cert = (res.socket as any).getPeerCertificate();
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
        }
      );

      req.on('error', () => {
        resolve({ secure: false, reason: 'Connection Failed' });
      });

      req.end();
    });
  } catch {
    return { secure: false, reason: 'Invalid URL' };
  }
}
