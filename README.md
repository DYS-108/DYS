# Discover Your Self (DYS) - Bhagavad Gita Quiz & Course Registration Portal

Official web portal for the **Discover Your Self (DYS)** course based on *Bhagavad Gita As It Is*. This application provides an engaging 10-question spiritual quiz stepper, automated scholarship fee calculation, seamless UPI/Razorpay payment processing, candidate registration, and instant course pass ticket generation.

---

## 🌟 Key Features

- **📖 10-Question Bhagavad Gita Quiz**:
  - Interactive stepper with scriptural explanations for every question.
  - Question Navigator Palette (Buttons 1–10) allowing participants to view progress (answered vs. unanswered) and jump directly to any question to revise answers.
  - Dynamic scoring system (+2 for correct, -1 for incorrect, 0 for unattempted).

- **🎓 Automated Scholarship Fee Engine**:
  - Automatically calculates candidate score percentages.
  - Dynamically awards up to **50% scholarship discounts** based on quiz performance.

- **💳 Integrated Payment System**:
  - **Razorpay Checkout SDK** integration supporting Cards, NetBanking, GPay, and PhonePe.
  - **Dynamic UPI QR Code Generator** rendered via client-side canvas.
  - One-tap mobile deep links for **GPay**, **PhonePe**, **Paytm**, and **BHIM UPI**.
  - Manual UTR/Reference number input verification option.

- **📝 Candidate Registration Portal**:
  - Dual occupation profiles: **Student** (College, Degree, Branch) vs. **Job / Self-Employed** (Company, Role).
  - Demographics selection (Marital Status & Gender).
  - Optional address and remarks input.

- **🎫 Digital Course Pass Ticket**:
  - Instant official course enrollment pass ticket upon registration.
  - Displays Pass ID (`ISKCON-REG-XXXX`), Participant Name, Quiz Score, Fee Paid, Occupation, and Timestamp.
  - Built-in **Print / Download PDF Pass** function (`window.print()`).
  - Targeted WhatsApp group joining link.

- **🌐 Complete Dual-Language Support**:
  - Instant one-click toggle between **English** and **Hindi (हिंदी)** across all screens.

- **☁️ Data Persistence & Cloud DB Integration**:
  - **Supabase Cloud DB** real-time registration record saving.
  - LocalStorage and SessionStorage state recovery across browser redirects and payment apps.

---

## 📁 Project Structure

```
DYS-main/
├── index.html          # Main Single-Page Application (SPA) structure
├── app.js              # Core application engine, quiz state, Supabase & payment logic
├── style.css           # Devotional dark theme, responsive layouts & print media CSS
├── qrcode.min.js       # Client-side QR Code generation library
├── iskcon_logo.png     # Official ISKCON Pune logo asset
├── prabhupada.png      # Srila Prabhupada portrait asset
├── dys_poster_new.png  # 8-Session DYS course journey poster
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

### Local Development
Since this is a lightweight vanilla JavaScript / HTML5 web application, no build steps are required.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DYS-108/DYS.git
   cd DYS
   ```

2. **Run locally**:
   - Open `index.html` directly in any web browser.
   - Alternatively, serve using Python HTTP server:
     ```bash
     python -m http.server 8000
     ```
     Then open `http://localhost:8000` in your browser.

---

## ⚙️ Organizer / Admin Settings

Click 5 times on the **Discover Your Self** header brand title (`#brand-badge`) to access the secret Organizer Admin Panel to configure:
- Base Course Fee (₹)
- Organizer UPI ID (VPA) & Payee Name
- Supabase Project URL & Anon Key
- Razorpay Key ID (Test or Live mode)

---

## 📜 License & Credits

© **Discover Your Self Course** — Based on *Bhagavad Gita As It Is* by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada.
