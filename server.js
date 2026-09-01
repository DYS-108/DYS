require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { readDB, writeDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment Config (Never exposed directly to frontend)
const UPI_ID = process.env.UPI_ID || '9892961661@okbizaxis';
const UPI_PAYEE_NAME = process.env.UPI_PAYEE_NAME || 'Discover Your Self';
const BASE_FEE = parseInt(process.env.BASE_FEE || '300', 10);
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://phiuzlbeizzxqzxgpbiq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoaXV6bGJlaXp6eHF6eGdwYmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MjExNDEsImV4cCI6MjEwMzI5NzE0MX0.cggUAxqSe4FsfvPvEsPQUKVJy5e_t9kus1KInViXaKU';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TUMKfqBFQVTqvw';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  } catch (e) {
    console.warn("Razorpay SDK Initialization Notice:", e.message);
  }
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Quiz Correct Answer Key
const QUIZ_ANSWER_KEY = {
  0: 'C',
  1: 'D',
  2: 'C',
  3: 'D',
  4: 'D',
  5: 'C',
  6: 'D',
  7: 'D',
  8: 'D',
  9: 'D'
};

// Calculate Fee from Score (Trusted Backend Rule)
function calculateTrustedFee(answers) {
  let netScore = 0;
  for (let i = 0; i < 10; i++) {
    const userAns = answers[i];
    if (userAns) {
      if (userAns === QUIZ_ANSWER_KEY[i]) {
        netScore += 2;
      } else {
        netScore -= 1;
      }
    }
  }

  const maxMarks = 20;
  const rawPercent = (netScore / maxMarks) * 100;
  const finalPercent = Math.max(0, Math.round(rawPercent));

  let discountPercentage = 0;
  if (finalPercent >= 95) discountPercentage = 50;
  else if (finalPercent >= 90) discountPercentage = 45;
  else if (finalPercent >= 85) discountPercentage = 40;
  else if (finalPercent >= 80) discountPercentage = 35;
  else if (finalPercent >= 75) discountPercentage = 30;
  else if (finalPercent >= 70) discountPercentage = 25;
  else if (finalPercent >= 65) discountPercentage = 20;
  else if (finalPercent >= 60) discountPercentage = 15;

  const discountAmount = Math.round((BASE_FEE * discountPercentage) / 100);
  // For live testing, set payableAmount to ₹1 (or Math.max(1, BASE_FEE - discountAmount))
  const payableAmount = 1;

  return {
    netScore,
    finalPercent,
    discountPercentage,
    payableAmount
  };
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// 1. Submit Quiz & Register Candidate Session (Trusted Backend Calculation)
app.post('/api/quiz/submit', (req, res) => {
  try {
    const { answers, studentInfo } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid answers payload.' });
    }

    const feeResult = calculateTrustedFee(answers);
    const db = readDB();

    db.counters.registration_seq++;
    const regSeq = db.counters.registration_seq;
    const registration_id = `REG${regSeq}`;

    const newRegistration = {
      registration_id,
      full_name: (studentInfo && studentInfo.name) || 'Candidate',
      age: (studentInfo && studentInfo.age) || null,
      whatsapp_number: (studentInfo && studentInfo.phone) || null,
      occupation: (studentInfo && studentInfo.occupation) || 'student',
      institution_or_company: (studentInfo && (studentInfo.college || studentInfo.company)) || null,
      degree_or_position: (studentInfo && (studentInfo.degree || studentInfo.position)) || null,
      branch: (studentInfo && studentInfo.branch) || null,
      marital_status: (studentInfo && studentInfo.maritalStatus) || 'single',
      gender: (studentInfo && studentInfo.gender) || 'male',
      address: (studentInfo && studentInfo.address) || null,
      remarks: (studentInfo && studentInfo.remarks) || null,
      quiz_score: feeResult.netScore,
      max_score: 20,
      percentage: feeResult.finalPercent,
      course_name: "Discover Your Self Course",
      calculated_fee: feeResult.payableAmount,
      discount_percentage: feeResult.discountPercentage,
      status: 'PAYMENT_PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.registrations.push(newRegistration);
    writeDB(db);

    return res.json({
      registration_id,
      score: feeResult.netScore,
      percentage: feeResult.finalPercent,
      course_name: newRegistration.course_name,
      calculated_fee: feeResult.payableAmount,
      discount_percentage: feeResult.discountPercentage,
      upi_id: UPI_ID,
      upi_payee_name: UPI_PAYEE_NAME
    });
  } catch (err) {
    console.error("Quiz Submit Error:", err);
    return res.status(500).json({ error: 'Internal server error submitting quiz.' });
  }
});

// 2. Create Dynamic UPI Intent Payment (Trusted Backend Execution)
app.post('/api/payments/create', (req, res) => {
  try {
    const { registration_id } = req.body;
    if (!registration_id) {
      return res.status(400).json({ error: 'registration_id is required.' });
    }

    const db = readDB();
    const reg = db.registrations.find(r => r.registration_id === registration_id);

    if (!reg) {
      return res.status(404).json({ error: 'Registration record not found.' });
    }

    // Check if payment already exists
    let existingPayment = db.payments.find(p => p.registration_id === registration_id);

    if (existingPayment) {
      if (existingPayment.status === 'VERIFIED') {
        return res.json({
          registration_id,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          upi_id: existingPayment.upi_id,
          payment_reference: existingPayment.payment_reference,
          upi_uri: existingPayment.upi_uri,
          status: 'VERIFIED',
          message: 'Payment verified ✓ Registration Confirmed ✓'
        });
      }

      if (existingPayment.status === 'UTR_SUBMITTED') {
        return res.json({
          registration_id,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          upi_id: existingPayment.upi_id,
          payment_reference: existingPayment.payment_reference,
          upi_uri: existingPayment.upi_uri,
          utr: existingPayment.utr,
          status: 'UTR_SUBMITTED',
          message: 'Your UTR has been submitted. Our team will verify your payment.'
        });
      }

      // Reuse existing PENDING payment reference
      return res.json({
        registration_id,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        upi_id: existingPayment.upi_id,
        payment_reference: existingPayment.payment_reference,
        upi_uri: existingPayment.upi_uri,
        status: existingPayment.status
      });
    }

    // Generate new payment reference & dynamic UPI URI
    db.counters.payment_seq++;
    const paySeq = String(db.counters.payment_seq).padStart(3, '0');
    const payment_reference = `${registration_id}-PAY-${paySeq}`;
    const amount = reg.calculated_fee;

    const encodedPayeeName = encodeURIComponent(UPI_PAYEE_NAME);
    const upi_uri = `upi://pay?pa=${UPI_ID}&pn=${encodedPayeeName}&am=${amount}&cu=INR`;

    const newPayment = {
      id: `PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      registration_id,
      user_id: reg.whatsapp_number || registration_id,
      amount,
      currency: 'INR',
      upi_id: UPI_ID,
      payment_reference,
      upi_uri,
      utr: null,
      status: 'PAYMENT_PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      verified_at: null,
      verified_by: null
    };

    db.payments.push(newPayment);
    writeDB(db);

    return res.json({
      registration_id,
      amount,
      currency: 'INR',
      upi_id: UPI_ID,
      payment_reference,
      upi_uri,
      status: 'PAYMENT_PENDING'
    });
  } catch (err) {
    console.error("Create Payment Error:", err);
    return res.status(500).json({ error: 'Internal server error creating payment.' });
  }
});

// 3. Submit UTR / Transaction ID (User Post-Payment Action)
app.post('/api/payments/submit-utr', (req, res) => {
  try {
    const { registration_id, utr } = req.body;

    if (!registration_id || !utr) {
      return res.status(400).json({ error: 'registration_id and utr are required.' });
    }

    const cleanUtr = String(utr).trim();
    if (cleanUtr.length < 6 || cleanUtr.length > 24) {
      return res.status(400).json({ error: 'Please enter a valid 6 to 24 digit UTR / Transaction ID.' });
    }

    const db = readDB();

    // Check duplicate UTR across other payments
    const duplicateUtr = db.payments.find(p => p.utr === cleanUtr && p.registration_id !== registration_id && p.status !== 'REJECTED');
    if (duplicateUtr) {
      return res.status(400).json({ error: 'This UTR has already been submitted for another registration. Please check your transaction details.' });
    }

    const payment = db.payments.find(p => p.registration_id === registration_id);
    if (!payment) {
      return res.status(404).json({ error: 'No active payment record found for this registration.' });
    }

    if (payment.status === 'VERIFIED') {
      return res.json({
        success: true,
        status: 'VERIFIED',
        message: 'Payment already verified ✓ Registration Confirmed ✓',
        payment
      });
    }

    // Update payment record
    payment.utr = cleanUtr;
    payment.status = 'UTR_SUBMITTED';
    payment.updated_at = new Date().toISOString();

    // Update registration record
    const reg = db.registrations.find(r => r.registration_id === registration_id);
    if (reg) {
      reg.status = 'UTR_SUBMITTED';
      reg.updated_at = new Date().toISOString();
    }

    writeDB(db);

    return res.json({
      success: true,
      status: 'UTR_SUBMITTED',
      message: 'Your UTR has been submitted. Our team will verify your payment.',
      payment
    });
  } catch (err) {
    console.error("Submit UTR Error:", err);
    return res.status(500).json({ error: 'Internal server error submitting UTR.' });
  }
});

// 3.5. Razorpay Backend Order Creation
app.post('/api/payments/razorpay/create-order', async (req, res) => {
  try {
    const { registration_id } = req.body;
    if (!registration_id) {
      return res.status(400).json({ error: 'registration_id is required.' });
    }

    const db = readDB();
    const reg = db.registrations.find(r => r.registration_id === registration_id);
    if (!reg) {
      return res.status(404).json({ error: 'Registration record not found.' });
    }

    const amountInPaise = Math.round((reg.calculated_fee || 150) * 100);

    if (razorpayInstance) {
      try {
        const options = {
          amount: amountInPaise,
          currency: "INR",
          receipt: `${registration_id}_${Date.now()}`.slice(0, 40),
          notes: {
            registration_id: reg.registration_id,
            full_name: reg.full_name || 'Participant'
          }
        };

        const rzpOrder = await razorpayInstance.orders.create(options);
        return res.json({
          success: true,
          key_id: RAZORPAY_KEY_ID,
          order_id: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          registration_id
        });
      } catch (orderErr) {
        console.warn("Razorpay API Order Error (Fallback to Direct Key):", orderErr.message);
      }
    }

    // Direct mode fallback (returns key_id and amount for client checkout)
    return res.json({
      success: true,
      key_id: RAZORPAY_KEY_ID,
      order_id: null,
      amount: amountInPaise,
      currency: "INR",
      registration_id
    });
  } catch (err) {
    console.error("Razorpay Order Endpoint Exception:", err);
    return res.status(500).json({ error: 'Failed to create Razorpay payment order.' });
  }
});

// 3.6. Razorpay Payment Verification (Signature Validation)
app.post('/api/payments/razorpay/verify', (req, res) => {
  try {
    const { registration_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!registration_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing required Razorpay payment parameters.' });
    }

    if (RAZORPAY_KEY_SECRET && razorpay_order_id && razorpay_signature) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid Razorpay payment signature.' });
      }
    }

    const db = readDB();
    let payment = db.payments.find(p => p.registration_id === registration_id);
    if (!payment) {
      payment = {
        id: `PAY_${Date.now()}`,
        registration_id,
        amount: 150,
        currency: 'INR',
        upi_id: UPI_ID,
        status: 'VERIFIED',
        created_at: new Date().toISOString()
      };
      db.payments.push(payment);
    }

    payment.status = 'VERIFIED';
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_order_id = razorpay_order_id || null;
    payment.verified_at = new Date().toISOString();
    payment.verified_by = 'Razorpay Payment Gateway';

    const reg = db.registrations.find(r => r.registration_id === registration_id);
    if (reg) {
      reg.status = 'VERIFIED';
      reg.updated_at = new Date().toISOString();
      syncToSupabase(reg, payment);
    }

    writeDB(db);

    return res.json({
      success: true,
      status: 'VERIFIED',
      message: 'Payment verified via Razorpay Gateway! Registration confirmed.',
      payment
    });
  } catch (err) {
    console.error("Razorpay Payment Verification Exception:", err);
    return res.status(500).json({ error: 'Failed to verify Razorpay payment.' });
  }
});

// 4. Check Registration & Payment Status
app.get('/api/payments/status/:registration_id', (req, res) => {
  try {
    const { registration_id } = req.params;
    const db = readDB();

    const reg = db.registrations.find(r => r.registration_id === registration_id);
    const payment = db.payments.find(p => p.registration_id === registration_id);

    if (!reg && !payment) {
      return res.status(404).json({ error: 'Record not found.' });
    }

    return res.json({
      registration_id,
      registration: reg || null,
      payment: payment || null,
      status: (payment && payment.status) || (reg && reg.status) || 'PAYMENT_PENDING'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching status.' });
  }
});

// 5. Update Candidate Details (Post-Payment / Registration Form)
app.post('/api/registration/complete', (req, res) => {
  try {
    const { registration_id, studentData } = req.body;
    if (!registration_id || !studentData) {
      return res.status(400).json({ error: 'registration_id and studentData are required.' });
    }

    const db = readDB();
    const reg = db.registrations.find(r => r.registration_id === registration_id);
    if (!reg) {
      return res.status(404).json({ error: 'Registration record not found.' });
    }

    reg.full_name = studentData.name || reg.full_name;
    reg.age = studentData.age || reg.age;
    reg.whatsapp_number = studentData.phone || reg.whatsapp_number;
    reg.occupation = studentData.occupation || reg.occupation;
    reg.institution_or_company = studentData.occupation === 'student' ? studentData.college : studentData.company;
    reg.degree_or_position = studentData.occupation === 'student' ? studentData.degree : studentData.position;
    reg.branch = studentData.branch || reg.branch;
    reg.marital_status = studentData.maritalStatus || reg.marital_status;
    reg.gender = studentData.gender || reg.gender;
    reg.address = studentData.address || reg.address;
    reg.remarks = studentData.remarks || reg.remarks;
    reg.updated_at = new Date().toISOString();

    writeDB(db);

    // Sync to Supabase Cloud Database asynchronously
    const payment = db.payments.find(p => p.registration_id === registration_id);
    syncToSupabase(reg, payment);

    return res.json({ success: true, registration: reg });
  } catch (err) {
    return res.status(500).json({ error: 'Error updating registration details.' });
  }
});

// Helper: Server-side Supabase Cloud DB Sync
async function syncToSupabase(reg, payment) {
  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL') return;
  try {
    const cleanUrl = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '') + '/rest/v1/registrations';
    const payload = {
      pass_id: reg.registration_id,
      full_name: reg.full_name || 'Participant',
      age: parseInt(reg.age) || 0,
      whatsapp_number: reg.whatsapp_number || '',
      occupation: reg.occupation || 'student',
      institution_or_company: reg.institution_or_company || '',
      degree_or_position: reg.degree_or_position || '',
      branch: reg.branch || null,
      marital_status: reg.marital_status || 'single',
      gender: reg.gender || null,
      quiz_score: reg.quiz_score || 20,
      percentage: reg.percentage || 100,
      paid_amount: (payment && payment.amount) || reg.calculated_fee || 150,
      utr_number: (payment && payment.utr) || null,
      language: reg.language || 'en',
      remarks: reg.remarks || null
    };

    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`[Supabase Sync Success] Registration ${reg.registration_id} saved to Supabase.`);
    } else {
      const errText = await response.text();
      console.warn(`[Supabase Sync Warning] Status ${response.status}:`, errText);
    }
  } catch (e) {
    console.error("[Supabase Sync Exception]:", e.message);
  }
}

// -----------------------------------------------------------------------------
// Admin Verification Endpoints
// -----------------------------------------------------------------------------

function verifyAdminAuth(req, res, next) {
  const secret = req.headers['x-admin-secret'] || req.query.admin_secret;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin secret token.' });
  }
  next();
}

// Admin: Get All Registrations & Payments
app.get('/api/admin/payments', verifyAdminAuth, (req, res) => {
  try {
    const db = readDB();

    const list = db.registrations.map(reg => {
      const pay = db.payments.find(p => p.registration_id === reg.registration_id) || {};
      return {
        registration_id: reg.registration_id,
        full_name: reg.full_name,
        whatsapp_number: reg.whatsapp_number,
        quiz_score: reg.quiz_score,
        percentage: reg.percentage,
        course_name: reg.course_name,
        calculated_fee: reg.calculated_fee,
        discount_percentage: reg.discount_percentage,
        occupation: reg.occupation,
        institution_or_company: reg.institution_or_company,
        payment_reference: pay.payment_reference || '-',
        amount: pay.amount || reg.calculated_fee,
        utr: pay.utr || null,
        status: pay.status || reg.status || 'PAYMENT_PENDING',
        created_at: reg.created_at,
        verified_at: pay.verified_at || null,
        verified_by: pay.verified_by || null
      };
    });

    return res.json({
      success: true,
      count: list.length,
      registrations: list
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching admin payments list.' });
  }
});

// Admin: Verify or Reject Payment
app.post('/api/admin/payments/verify', verifyAdminAuth, (req, res) => {
  try {
    const { registration_id, action, admin_name } = req.body;
    if (!registration_id || !action || !['VERIFY', 'REJECT'].includes(action)) {
      return res.status(400).json({ error: 'Invalid registration_id or action (VERIFY or REJECT required).' });
    }

    const db = readDB();
    const payment = db.payments.find(p => p.registration_id === registration_id);
    const reg = db.registrations.find(r => r.registration_id === registration_id);

    if (!payment && !reg) {
      return res.status(404).json({ error: 'Registration / Payment record not found.' });
    }

    const newStatus = action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';
    const nowIso = new Date().toISOString();
    const verifier = admin_name || 'Admin';

    if (payment) {
      payment.status = newStatus;
      payment.updated_at = nowIso;
      if (action === 'VERIFY') {
        payment.verified_at = nowIso;
        payment.verified_by = verifier;
      }
    }

    if (reg) {
      reg.status = newStatus;
      reg.updated_at = nowIso;
    }

    writeDB(db);

    return res.json({
      success: true,
      registration_id,
      status: newStatus,
      message: `Payment ${newStatus} successfully for ${registration_id}.`,
      verified_at: action === 'VERIFY' ? nowIso : null,
      verified_by: action === 'VERIFY' ? verifier : null
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error processing admin verification action.' });
  }
});

// Fallback: Catch-all to serve index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 DYS Portal Server Running on http://localhost:${PORT}`);
  console.log(`💳 UPI ID: ${UPI_ID}`);
  console.log(`👤 Payee: ${UPI_PAYEE_NAME}`);
  console.log(`=======================================================`);
});
