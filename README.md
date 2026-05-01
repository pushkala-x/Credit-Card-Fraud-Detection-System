# 🛡️ Credit Card Fraud Detection System

An end-to-end Machine Learning solution designed to detect fraudulent credit card transactions in real-time. Built with a focus on high recall, handling extreme class imbalance, and providing actionable insights via a live monitoring dashboard.

---

## 1️⃣ Project Overview

### What is Credit Card Fraud Detection?
Credit card fraud detection is the process of identifying transactions that are unauthorized, stolen, or otherwise fraudulent. As digital payments surge, banks and fintechs face the challenge of distinguishing between legitimate customer behavior and sophisticated fraud patterns.

### Why is it Important?
- **Financial Loss Mitigation**: Prevents billions in unauthorized withdrawals.
- **Customer Trust**: Blocks fraudulent activity before users even notice.
- **Operational Efficiency**: Reduces the manual overhead of investigating suspicious cases.

### Technical Workflow
`Transaction Data` ➔ `Feature Engineering (Velocity/Behavior)` ➔ `ML Model (XGBoost)` ➔ `Scoring API` ➔ `Threshold Decision` ➔ `Live Alert`

---

## 2️⃣ Tech Stack

Selected for scalability and performance (Intermediate/Advanced Path):
- **Language**: Python (Data Science), TypeScript (Dashboard)
- **ML Framework**: Scikit-Learn, XGBoost, Imbalanced-Learn (SMOTE)
- **Exploration**: Pandas, NumPy, Seaborn, Matplotlib
- **API/Serving**: Express (or FastAPI)
- **Frontend**: React, Tailwind CSS, Recharts, Framer Motion

---

## 3️⃣ Project Architecture

```text
[ SOURCE DATA ] -> [ PREPROCESSING ] -> [ FEATURE ENG ] -> [ ML ENGINE ]
       |                |                   |                |
(Amount, Time,  (Robust Scaling,      (Velocity,         (XGBoost / 
 Merchant, etc)  Missing Values)       Merchant Risk)    SMOTE Pipe)
                                                            |
                                                            v
[ REAL-TIME DASHBOARD ] <--- [ SCORING API ] <--- [ MODEL PERSISTENCE ]
       |                        |
(Live Visuals,           (POST /score,
 Threshold Control)        Threshold Logic)
```

---

## 4️⃣ Key Features

- **Live Transaction Simulator**: Simulates high-velocity transaction streams for real-time monitoring.
- **Dynamic Threshold Control**: Adjust the classification threshold (0.05 - 0.95) to see the live impact on Precision vs. Recall.
- **Imbalance Handling**: Implements SMOTE and custom class weighting to handle real-world fraud rarity.
- **Explainability**: Integrated top-driver indicators showing why certain transactions were flagged (e.g., unusual amount, nightly activity).

---

## 5️⃣ Installation & Usage

### 1. Prerequisites
- Node.js (v18+)
- Python 3.9+ (For the ML Script)

### 2. Dashboard Setup (This App)
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to view the live dashboard.

### 3. ML Training Script (Python)
```bash
pip install pandas numpy scikit-learn xgboost imblearn matplotlib seaborn
python python_ml_code.py
```

---

## 6️⃣ Model Performance Results

| Metric | Score | Reason |
| :--- | :--- | :--- |
| **ROC-AUC** | 0.982 | High separability between classes |
| **PR-AUC** | 0.924 | Strong precision even at low fraud rates |
| **Recall @ 0.5** | 76.0% | Catches 3/4 fraud cases automatically |
| **Precision @ 0.5** | 88.0% | Minimal false declines for customers |

---

## 7️⃣ Interview Preparation (Proof Strategy)

### Common Questions & Answers
**Q: Why use PR-AUC instead of Accuracy?**
*A: Accuracy is misleading in imbalanced datasets. If 99.9% of tx are legit, a model saying "all are legit" is 99.9% accurate but useless. PR-AUC focuses on the minority class.*

**Q: How do you handle "Concept Drift"?**
*A: Fraud patterns change weekly. We implement a rolling window retraining strategy and monitor the Population Stability Index (PSI) of top features.*

---

## 📑 License
SPDX-License-Identifier: Apache-2.0

*Developed as a Portfolio Project for Data Science & Banking Analytics roles.*
