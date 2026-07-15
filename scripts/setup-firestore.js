/**
 * Setup Script - Initialize Firestore Collections
 * 
 * Run with:
 * npm install firebase-admin
 * node scripts/setup-firestore.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

// Check if serviceAccountKey.json exists
if (!require('fs').existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found in project root');
  console.log('\n📋 To get your service account key:');
  console.log('1. Go to https://console.firebase.google.com/u/0/project/finansarena-bdae9/settings/serviceaccounts/adminsdk');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save as: serviceAccountKey.json in project root');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath))
  });
} catch (e) {
  console.error('❌ Firebase initialization failed:', e.message);
  process.exit(1);
}

const db = admin.firestore();

// ============================================================
// DEFAULT PRICING DATA
// ============================================================
const DEFAULT_PRICING = {
  baseProductPrice: 5500,        // ₺ per ton (base silage price)
  shippingMinFee: 4000,           // ₺ minimum shipping fee
  shippingPerKm: 2.2,             // ₺ per km
  concentrateCost: 120,           // ₺ per unit
  forageCost: 60,                 // ₺ per unit
  silagePrice: 5.5,               // ₺ per unit
  milkPrice: 15,                  // ₺ per unit (market price)
  milkIncreasePerCow: 2.5,        // % per cow with silage
  concentrateReduction: 0.30,     // 30% reduction with silage
  lastUpdated: new Date().toISOString(),
  updatedBy: 'setup-script'
};

async function setupFirestore() {
  console.log('🚀 Initializing Firestore collections...\n');

  try {
    // ============================================================
    // STEP 1: Create demircan_pricing_rules/current
    // ============================================================
    console.log('📍 Creating demircan_pricing_rules/current document...');
    await db.collection('demircan_pricing_rules').doc('current').set(DEFAULT_PRICING);
    console.log('✅ Pricing document created successfully!\n');

    // ============================================================
    // STEP 2: Verify creation
    // ============================================================
    console.log('🔍 Verifying document...');
    const pricingDoc = await db.collection('demircan_pricing_rules').doc('current').get();
    
    if (pricingDoc.exists) {
      console.log('✅ Document verified! Data:');
      console.log(JSON.stringify(pricingDoc.data(), null, 2));
      console.log('\n');
    } else {
      console.error('❌ Document verification failed');
      process.exit(1);
    }

    // ============================================================
    // STEP 3: Summary
    // ============================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 Firestore Setup Complete!\n');
    console.log('Created Collections:');
    console.log('  • demircan_pricing_rules/current');
    console.log('  • demircan_admin_logs (rule-based, auto)');
    console.log('  • demircan_orders (rule-based, auto)');
    console.log('  • demircan_messages (rule-based, auto)');
    console.log('\n✅ System is ready for production');
    console.log('═══════════════════════════════════════════════════════');

    process.exit(0);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n📝 Possible solutions:');
    console.error('  1. Check serviceAccountKey.json permissions');
    console.error('  2. Verify Firestore is enabled in Firebase Console');
    console.error('  3. Check collection security rules in firestore.rules');
    console.error('  4. Ensure demircan_admin_logs security allows writes');
    process.exit(1);
  }
}

setupFirestore();
