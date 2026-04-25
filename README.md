 🚗 Second-Hand Car Market Platform

A full-stack **used car marketplace system** where sellers list cars, admins manage verification, and buyers can compare, test drive, negotiate, and purchase vehicles through a secure workflow.


🌐 Overview

This platform connects:

* 🚘 **Sellers** → List second-hand cars
* 🛡️ **Admin** → Manages approval, verification, and transactions
* 🧑‍💻 **Buyers** → Browse, compare, test drive, and purchase cars
* 🔧 **Verification Team** → Physically verifies vehicles


⚙️ Tech Stack

* React.js (Frontend)
* Node.js (Backend)
* Express.js (API)
* MySQL (Database)
* JWT (Authentication)
* bcrypt (Security)


🚗 Core Workflow

1️⃣ Car Listing (Seller)

* Seller uploads car details:

  * Model, brand, year
  * Price
  * Images
  * Important documents
* Sent to **admin approval**


2️⃣ Admin Approval & Verification Scheduling

* Admin reviews listing
* Admin selects **verification date**
* Seller can:

  * Accept date
  * Request date change


3️⃣ Car Verification

* Verification team visits seller location
* Checks car condition & documents
* If approved → car moves to **Selling Page**


4️⃣ Car Marketplace (Buyer View)

Buyers can:

* Browse cars
* Use **filters (price, model, brand, etc.)**
* Compare multiple cars


5️⃣ Test Drive Request

* Buyer requests test drive
* Selects preferred date
* Admin coordinates between buyer and seller
* Final date is:

  * Approved
  * Or rescheduled


6️⃣ Purchase Options

Buyer can choose:

💰 Direct Purchase

* Immediate purchase at listed price

🤝 Negotiation Mode

* Buyer suggests new price
* Admin reviews:

  * ✔️ Accept → send to seller
  * ❌ Reject → negotiation ends


7️⃣ Payment System

* Buyer pays **10% platform commission**
* Remaining amount:

  * Sent directly to seller after completion


8️⃣ Delivery & Completion

* Seller marks car as **Delivered**
* Buyer confirms **Received**
* Admin verifies final completion status


🔥 Key Features

* 🚗 Second-hand car marketplace
* 🛡️ Admin-controlled verification system
* 📅 Test drive scheduling system
* 🤝 Negotiation & direct purchase flow
* 🔍 Advanced filter & compare cars
* 💰 Commission-based payment system
* 🔐 Secure login system (JWT + bcrypt)
* 📦 End-to-end transaction tracking


📊 System Flow

```text id="2x8m4k"
Seller Upload → Admin Approval → Verification Team Visit → Car Approved →
Listed on Market → Buyer Browse → Test Drive Request →
Negotiation / Direct Buy → Payment (10% commission) →
Seller Receives Payment → Delivery → Buyer Confirmation → Admin Close
```


🚀 Project Purpose

* Build real-world marketplace system
* Learn complex workflows (verification + negotiation)
* Practice full-stack system design
* Portfolio-ready advanced project


👨‍💻 Author

Built as a full-stack project focused on real-world used car marketplace operations and system design.


