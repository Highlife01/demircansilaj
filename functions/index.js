/**
 * DEMIRCAN SİLAJ — Cloud Functions
 * 
 * Entry point for all Firebase Cloud Functions
 * Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Email transporter configuration
// Using SendGrid for reliable email delivery
const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: functions.config().sendgrid?.api_key || process.env.SENDGRID_API_KEY || ''
  }
});

const ADMIN_EMAIL = functions.config().admin?.email || 'info@demircansilaj.com.tr';

// ============================================================
// FUNCTION 1: Send Email on New Order
// Trigger: Firestore onCreate -> demircan_orders
// ============================================================
exports.sendEmailOnNewOrder = functions.firestore
  .document('demircan_orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = snap.id;

    try {
      // Email to admin
      const adminEmailHtml = `
        <h2 style="color: #15803d;">🎉 Yeni Sipariş Alındı!</h2>
        <p><strong>Sipariş ID:</strong> ${orderId}</p>
        <hr />
        <h3>📋 Müşteri Bilgileri</h3>
        <p><strong>Ad/Şirket:</strong> ${order.name || '-'}</p>
        <p><strong>Telefon:</strong> ${order.phone || '-'}</p>
        <p><strong>E-mail:</strong> ${order.email || '-'}</p>
        <hr />
        <h3>📦 Sipariş Detayları</h3>
        <p><strong>İl:</strong> ${order.province || '-'}</p>
        <p><strong>İlçe:</strong> ${order.district || '-'}</p>
        <p><strong>Miktar:</strong> <strong style="color: #15803d; font-size: 1.2em;">${order.quantity} Ton</strong></p>
        <p><strong>Ürün Tipi:</strong> ${order.productType || 'Standart'}</p>
        <p><strong>Notlar:</strong> ${(order.notes || 'Yok').substring(0, 200)}</p>
        <hr />
        <p><strong>Durum:</strong> ${order.status}</p>
        <p style="font-size: 0.9em; color: #666;">
          <strong>Oluşturulma Saati:</strong> ${new Date().toLocaleString('tr-TR')}
        </p>
        <hr />
        <p>
          <a href="https://www.demircansilaj.com.tr/admin" style="background-color: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            ➜ Admin Panele Git
          </a>
        </p>
      `;

      await transporter.sendMail({
        from: `Demircan Silaj <noreply@demircansilaj.com.tr>`,
        to: ADMIN_EMAIL,
        subject: `[🔔 YENİ SİPARİŞ] ${order.name} - ${order.quantity}T - ${order.province}`,
        html: adminEmailHtml,
        text: `Yeni sipariş: ${order.name}, ${order.quantity} Ton, ${order.province}, Tel: ${order.phone}`
      });

      console.log(`✅ Admin email sent for order ${orderId}`);

      // Email to customer (if provided)
      if (order.email) {
        const customerEmailHtml = `
          <h2 style="color: #15803d;">✅ Demircan Silaj — Sipariş Onaylandı</h2>
          <p>Merhaba <strong>${order.name}</strong>,</p>
          <p>Sipariş talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.</p>
          <hr />
          <h3>📦 Sipariş Özeti</h3>
          <ul>
            <li><strong>Sipariş ID:</strong> ${orderId}</li>
            <li><strong>Ürün Tipi:</strong> ${order.productType || 'Standart'}</li>
            <li><strong>Miktar:</strong> <strong style="color: #15803d;">${order.quantity} Ton</strong></li>
            <li><strong>Teslimat Yeri:</strong> ${order.province}, ${order.district}</li>
          </ul>
          <hr />
          <h3>📞 İletişim</h3>
          <p>
            <strong>Telefon:</strong> +90 532 327 23 83<br>
            <strong>E-mail:</strong> <a href="mailto:info@demircansilaj.com.tr">info@demircansilaj.com.tr</a><br>
            <strong>Web:</strong> <a href="https://www.demircansilaj.com.tr">www.demircansilaj.com.tr</a>
          </p>
          <hr />
          <p style="font-size: 0.85em; color: #666;">
            Bu e-mail otomatik olarak gönderilmiştir. Lütfen yanıt vermeyiniz.
          </p>
        `;

        await transporter.sendMail({
          from: `Demircan Silaj <noreply@demircansilaj.com.tr>`,
          to: order.email,
          subject: `Demircan Silaj — Sipariş Onaylandı (ID: ${orderId})`,
          html: customerEmailHtml,
          text: `Siparişiniz alındı. Sipariş ID: ${orderId}`
        });

        console.log(`✅ Customer email sent to ${order.email}`);
      }

      return { success: true, orderId };

    } catch (error) {
      console.error(`❌ Error sending email for order ${orderId}:`, error.message);
      // Don't throw — allow the function to complete successfully
      // but log the error for monitoring
      return { success: false, error: error.message, orderId };
    }
  });

// ============================================================
// FUNCTION 2: Send Email on New Contact Message
// Trigger: Firestore onCreate -> demircan_messages
// ============================================================
exports.sendEmailOnNewMessage = functions.firestore
  .document('demircan_messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const messageId = snap.id;

    try {
      const adminEmailHtml = `
        <h2 style="color: #15803d;">📨 Yeni İletişim Mesajı</h2>
        <p><strong>Gönderen Ad:</strong> ${message.name || '-'}</p>
        <p><strong>Telefon:</strong> ${message.phone || '-'}</p>
        <p><strong>E-mail:</strong> ${message.email || '-'}</p>
        <hr />
        <h3>💬 Mesaj</h3>
        <blockquote style="border-left: 4px solid #15803d; padding-left: 15px; margin: 15px 0;">
          ${(message.message || '').replace(/\n/g, '<br>')}
        </blockquote>
        <hr />
        <p style="font-size: 0.9em; color: #666;">
          <strong>Mesaj ID:</strong> ${messageId}<br>
          <strong>Oluşturulma:</strong> ${new Date().toLocaleString('tr-TR')}
        </p>
        <hr />
        <p>
          <a href="https://www.demircansilaj.com.tr/admin" style="background-color: #15803d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            ➜ Admin Panele Git
          </a>
        </p>
      `;

      await transporter.sendMail({
        from: `Demircan Silaj <noreply@demircansilaj.com.tr>`,
        to: ADMIN_EMAIL,
        subject: `[📨 YENİ MESAJ] ${message.name}`,
        html: adminEmailHtml,
        text: `Yeni mesaj: ${message.name}, Telefon: ${message.phone}`
      });

      console.log(`✅ Admin email sent for message ${messageId}`);
      return { success: true, messageId };

    } catch (error) {
      console.error(`❌ Error sending email for message ${messageId}:`, error.message);
      return { success: false, error: error.message, messageId };
    }
  });

// ============================================================
// OPTIONAL: HTTP Function for Manual Testing
// ============================================================
exports.testEmail = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Simple security: require authorization header
  const token = req.headers.authorization;
  if (token !== `Bearer ${functions.config().admin?.token}`) {
    return res.status(401).send('Unauthorized');
  }

  try {
    await transporter.sendMail({
      from: `Demircan Silaj <noreply@demircansilaj.com.tr>`,
      to: ADMIN_EMAIL,
      subject: '[TEST] Demircan Silaj Email Test',
      html: '<p>Bu bir test e-maildir. Email sistemi çalışıyor! ✅</p>',
      text: 'Test email successful'
    });

    return res.status(200).json({ success: true, message: 'Test email sent' });
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

console.log('✅ Cloud Functions initialized successfully');
