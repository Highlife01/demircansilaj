/**
 * DEMIRCAN SİLAJ — Email Notification Cloud Function
 * 
 * Deploy: firebase deploy --only functions:sendEmailOnNewOrder
 * 
 * Firestore trigger: demircan_orders koleksiyonuna yeni dokument eklendiğinde
 * Amaç: Admin ve customer'a email gönder
 * 
 * Kurulum:
 * 1. firebase-admin ve nodemailer paketlerini yükle:
 *    npm install firebase-admin nodemailer
 * 
 * 2. Ortam değişkenleri (.env.local):
 *    SENDGRID_API_KEY=SG.xxxxx (veya SMTP credentials)
 *    ADMIN_EMAIL=info@demircansilaj.com.tr
 * 
 * 3. Firebase Functions generate et:
 *    firebase init functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase
admin.initializeApp();
const db = admin.firestore();

// Email transporter (SendGrid veya SMTP)
// Option 1: SendGrid kullanımı (önerilir — daha güvenli)
const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY || 'SG.xxxx'
  }
});

// Option 2: Gmail SMTP (test amaçlı)
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASSWORD // App password, not account password
//   }
// });

// Trigger: demircan_orders koleksiyonuna yeni dokument eklendiğinde
exports.sendEmailOnNewOrder = functions.firestore
  .document('demircan_orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = snap.id;

    try {
      // Admin email
      const adminEmail = process.env.ADMIN_EMAIL || 'info@demircansilaj.com.tr';
      
      // Admin'e email (yeni sipariş bildirimi)
      const adminEmailContent = `
        <h2>Yeni Sipariş Bildirimi</h2>
        <p><strong>Sipariş ID:</strong> ${orderId}</p>
        <p><strong>Müşteri Adı:</strong> ${order.name}</p>
        <p><strong>Telefon:</strong> ${order.phone}</p>
        <p><strong>E-mail:</strong> ${order.email || 'Belirtilmemiş'}</p>
        <p><strong>İl:</strong> ${order.province}</p>
        <p><strong>İlçe:</strong> ${order.district}</p>
        <p><strong>Miktar:</strong> ${order.quantity} Ton</p>
        <p><strong>Ürün Tipi:</strong> ${order.productType || 'Standart'}</p>
        <p><strong>Notlar:</strong> ${order.notes || 'Yok'}</p>
        <p><strong>Durum:</strong> ${order.status}</p>
        <hr />
        <p><a href="https://www.demircansilaj.com.tr/admin">Panele git</a></p>
      `;

      await transporter.sendMail({
        from: 'noreply@demircansilaj.com.tr',
        to: adminEmail,
        subject: `[YENİ SİPARİŞ] ${order.name} - ${order.quantity} Ton`,
        html: adminEmailContent,
        text: `Yeni sipariş: ${order.name}, ${order.quantity} Ton, ${order.province}`
      });

      // Customer'a email (sipariş onayı)
      if (order.email) {
        const customerEmailContent = `
          <h2>Demircan Silaj — Sipariş Onayı</h2>
          <p>Değerli ${order.name},</p>
          <p>Sicak İşletme Yönetimi tarafından alındı. En kısa sürede sizinle iletişime geçeceğiz.</p>
          <hr />
          <h3>Sipariş Özeti</h3>
          <ul>
            <li><strong>Sipariş ID:</strong> ${orderId}</li>
            <li><strong>Ürün Tipi:</strong> ${order.productType || 'Standart'}</li>
            <li><strong>Miktar:</strong> ${order.quantity} Ton</li>
            <li><strong>İl:</strong> ${order.province}</li>
            <li><strong>İlçe:</strong> ${order.district}</li>
          </ul>
          <p>Teknik destek için: <strong>+90 532 327 23 83</strong></p>
          <p>E-mail: <strong>info@demircansilaj.com.tr</strong></p>
        `;

        await transporter.sendMail({
          from: 'noreply@demircansilaj.com.tr',
          to: order.email,
          subject: 'Demircan Silaj — Sipariş Onaylandı',
          html: customerEmailContent,
          text: `Siparişiniz alındı. Sipariş ID: ${orderId}`
        });
      }

      console.log(`✅ Email sent for order ${orderId}`);
      return { success: true, orderId };

    } catch (error) {
      console.error(`❌ Error sending email for order ${orderId}:`, error);
      // Don't throw — just log. Firestore trigger başarılı sayılsın.
      return { success: false, error: error.message };
    }
  });

// Opsiyonel: Message (iletişim) form'da da email gönder
exports.sendEmailOnNewMessage = functions.firestore
  .document('demircan_messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const messageId = snap.id;

    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'info@demircansilaj.com.tr';

      // Admin'e email
      const adminEmailContent = `
        <h2>Yeni İletişim Formu Mesajı</h2>
        <p><strong>Gönderen Adı:</strong> ${message.name}</p>
        <p><strong>Telefon:</strong> ${message.phone}</p>
        <p><strong>E-mail:</strong> ${message.email || 'Belirtilmemiş'}</p>
        <p><strong>Mesaj:</strong></p>
        <blockquote>${(message.message || '').replace(/\n/g, '<br>')}</blockquote>
        <hr />
        <p><a href="https://www.demircansilaj.com.tr/admin">Panele git</a></p>
      `;

      await transporter.sendMail({
        from: 'noreply@demircansilaj.com.tr',
        to: adminEmail,
        subject: `[YENİ MESAJ] ${message.name}`,
        html: adminEmailContent
      });

      console.log(`✅ Contact form email sent for message ${messageId}`);
      return { success: true, messageId };

    } catch (error) {
      console.error(`❌ Error sending contact email for message ${messageId}:`, error);
      return { success: false, error: error.message };
    }
  });

/**
 * KURULUM STEPS:
 * 
 * 1. Firebase CLI'de functions klasörünü init et:
 *    firebase init functions --project finansarena-bdae9
 * 
 * 2. functions/package.json'a ekle:
 *    npm install nodemailer --save
 * 
 * 3. Ortam değişkenlerini ayarla:
 *    firebase functions:config:set sendgrid.api_key="SG.xxxxx"
 *    firebase functions:config:set app.admin_email="info@demircansilaj.com.tr"
 * 
 * 4. Deploy et:
 *    firebase deploy --only functions
 * 
 * 5. Firestore kurallarında demircan_orders create access'ı public yap (zaten yapılmış)
 */
