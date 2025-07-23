const crypto = require('crypto');

module.exports = {
  tmnCode: '10PDMKDB',
  secretKey: 'XQ715JX17ERO040AQV9OLC23NW7DHKF1',
  vnpUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl: 'http://localhost:3000/payment-result',

  createSignature(params) {
    const sorted = Object.keys(params).sort();
    const signData = sorted.map(key => `${key}=${params[key]}`).join('&');
    return crypto.createHmac('sha512', this.secretKey)
      .update(signData, 'utf-8')
      .digest('hex')
      .toUpperCase();
  },

  verifySignature(params) {
    const { vnp_SecureHash, vnp_SecureHashType, ...rest } = params;

    // Sắp xếp key theo thứ tự alphabet
    const sorted = Object.keys(rest).sort();

    // Encode giá trị theo chuẩn RFC3986 (an toàn cho VNPay)
    const signData = sorted
      .map(k => `${k}=${encodeURIComponent(rest[k]).replace(/%20/g, '+')}`) // dùng + như PHP
      .join('&');

    const hash = crypto.createHmac('sha512', this.secretKey)
      .update(signData, 'utf-8')
      .digest('hex')
      .toUpperCase();

    return hash === vnp_SecureHash?.toUpperCase();
  }
}; 