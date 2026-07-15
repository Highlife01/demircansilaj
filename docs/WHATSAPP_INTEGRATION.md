# WhatsApp Entegrasyonu — Demircan Silaj

## Mevcut Durum
Sipariş ve iletişim formları Firestore'a kaydediliyor, ancak WhatsApp'a otomatik mesaj gönderme mekanizması henüz yazılmamış veya konfigüre edilmemiş.

## Önerilen Çözüm: Zapier + Firestore Trigger

### Adım 1: Zapier'da Zap Oluştur
1. [Zapier.com](https://zapier.com) → "Create Zap"
2. **Trigger:** "Firestore" (by Zapier)
   - Event: "New Document"
   - Collection: `demircan_orders`
   - Project: `finansarena-bdae9`
3. **Action:** "WhatsApp Business API" (veya "Send WhatsApp message via Twilio")

### Adım 2: WhatsApp Business API Seçenekleri

#### **Option 1: Meta Business Manager + Official WhatsApp API**
- **Avantaj:** Resmi, teyitli, yüksek deliverability
- **Dezavantaj:** Setup karmaşık, ciro kontrollü, approval gerekir
- **Kurulum:**
  1. Meta Business Manager hesabı oluştur
  2. WhatsApp Business Account'u bağla
  3. WhatsApp Cloud API access al
  4. Zapier'da "WhatsApp Business Cloud API" seç

#### **Option 2: Twilio (Önerilir)**
- **Avantaj:** Kolay, hızlı, 24/7 support
- **Dezavantaj:** Pay-per-message model
- **Kurulum:**
  1. [Twilio.com](https://twilio.com) hesabı oluştur
  2. WhatsApp Sandbox'a customer numarasını approve et
  3. Message template oluştur (admin approval gerekli değil)
  4. Zapier'da Twilio integrationini seç

#### **Option 3: Cloud Function + Twilio SDK**
- **Avantaj:** Programmatic control, custom logic
- **Dezavantaj:** Code writing gerekli
- **Kurulum:**
```javascript
// functions/sendWhatsAppOnNewOrder.js
const functions = require('firebase-functions');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // +14155552671

const client = twilio(accountSid, authToken);

exports.sendWhatsAppOnNewOrder = functions.firestore
  .document('demircan_orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const toNumber = `whatsapp:+90${order.phone.replace(/\D/g, '').slice(-10)}`;

    try {
      const message = await client.messages.create({
        from: fromNumber,
        to: toNumber,
        body: `Merhaba ${order.name}!\n\nDemircan Silaj'a sipariş verdiğiniz için teşekkür ederiz.\n\nSipariş Detayları:\n- Miktar: ${order.quantity} Ton\n- İl: ${order.province}\n- Ürün: ${order.productType || 'Standart'}\n\nEn kısa sürede sizinle iletişime geçeceğiz.\n\n+90 532 327 23 83\ninfo@demircansilaj.com.tr`
      });

      console.log(`✅ WhatsApp sent to ${toNumber}: ${message.sid}`);
      return { success: true, messageSid: message.sid };
    } catch (error) {
      console.error(`❌ WhatsApp error: ${error.message}`);
      return { success: false, error: error.message };
    }
  });
```

**Deploy:**
```bash
firebase functions:config:set twilio.account_sid="ACxxxxxx" twilio.auth_token="xxxxx" twilio.whatsapp_number="+14155552671"
firebase deploy --only functions:sendWhatsAppOnNewOrder
```

## Tavsiye Edilen Implementasyon

### Hızlı: Zapier + Twilio
**Avantaj:** 
- Setup 15 dakika
- No coding required
- Immediate deployment
- Good for MVP

**Cost:** ~$25-50/month (Zapier) + Twilio pay-per-message

### Production: Cloud Function + Official Meta API
**Avantaj:**
- Native integration
- Better control
- Cheaper long-term
- Better deliverability

**Cost:** ~$0.01-0.05 per message (Meta pricing)

## Message Template Examples

### Sipariş Onayı
```
Merhaba {customer_name}!

Demircan Silaj'a sipariş verdiğiniz için teşekkür ederiz.

📋 Sipariş Detayları:
- Miktar: {quantity} Ton
- İl: {province}
- Ürün Tipi: {product_type}
- Tahmini Nakliye: {estimated_shipping} ₺

En kısa sürede sizinle iletişime geçeceğiz.

📞 +90 532 327 23 83
📧 info@demircansilaj.com.tr
🌐 www.demircansilaj.com.tr
```

### İletişim Formu Alındı
```
Merhaba {name}!

Mesajınız başarıyla alındı. 

En kısa sürede size geri dönüş yapacağız.

Demircan Silaj Ekibi
```

## Security Notes

✅ **WhatsApp numbers'ı hash'le** — Direct DB'de saklamayın  
✅ **Rate limiting** — Same phone number'dan excessive messages engelle  
✅ **Consent management** — KVKK compliance için opt-in/out mekanizması kur  
✅ **Message template approval** — Meta API için message templates pre-approve et  
✅ **Cost monitoring** — Zapier/Twilio spend alerts kur

## Implementation Checklist

- [ ] Twilio vs Meta API karar ver
- [ ] API credentials'ı Firebase Secret Manager'a koy
- [ ] Message templates approve et
- [ ] Test customer'a test mesaj gönder
- [ ] Production deployment
- [ ] Admin panel'de WhatsApp status log'u ekle
- [ ] Monitoring setup (Sentry, Cloud Logging)

## Referanslar
- [Twilio WhatsApp API](https://www.twilio.com/whatsapp)
- [Meta Business Messaging](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Zapier Firestore Integration](https://zapier.com/apps/firestore/integrations)
