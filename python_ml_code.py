"""
Credit Card Fraud Detection System
Implementation using Scikit-Learn, XGBoost, and Imbalanced-Learn
For Portfolio & GitHub

Author: AI Solution Specialist
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.metrics import (
    precision_recall_curve, average_precision_score, 
    confusion_matrix, classification_report, roc_auc_score
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

# 1. Dataset Simulation / Loading
def load_data():
    # In a real scenario, use pd.read_csv('creditcard.csv')
    # For this demo, we simulate the structure
    n_samples = 10000
    n_features = 28
    
    X = np.random.randn(n_samples, n_features)
    # Target with high imbalance (0.1% fraud)
    y = np.random.choice([0, 1], size=n_samples, p=[0.99, 0.01])
    
    # Add some pattern to fraud
    # High amount and specific feature spikes
    X[y == 1, 0] = X[y == 1, 0] * 5 + 10 # Feature V1
    X[y == 1, 10] = X[y == 1, 10] * 3 - 5 # Feature V11
    
    df = pd.DataFrame(X, columns=[f'V{i+1}' for i in range(n_features)])
    df['Amount'] = np.random.exponential(scale=100, size=n_samples)
    df.loc[y == 1, 'Amount'] = df.loc[y == 1, 'Amount'] * 10
    df['Class'] = y
    
    return df

# 2. Preprocessing & Feature Engineering
def preprocess_data(df):
    # Time and Amount require scaling
    # RobustScaler is better for data with outliers
    df['scaled_amount'] = RobustScaler().fit_transform(df['Amount'].values.reshape(-1,1))
    df.drop(['Amount'], axis=1, inplace=True)
    
    X = df.drop('Class', axis=1)
    y = df['Class']
    
    return train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# 3. Model Training with Handling Imbalance
def train_model(X_train, y_train):
    # We use a Pipeline to ensure SMOTE is only applied to training folds
    # and not used during evaluation (prevents leakage)
    model = ImbPipeline([
        ('smt', SMOTE(random_state=42)),
        ('xgb', XGBClassifier(
            n_estimators=500,
            max_depth=4,
            learning_rate=0.05,
            scale_pos_weight=1, # Already handled by SMOTE, but useful for cost-sensitive
            use_label_encoder=False,
            eval_metric='logloss'
        ))
    ])
    
    model.fit(X_train, y_train)
    return model

# 4. Evaluation
def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    y_probs = model.predict_proba(X_test)[:, 1]
    
    print("\n--- Model Evaluation ---")
    print(classification_report(y_test, y_pred))
    print(f"ROC-AUC Score: {roc_auc_score(y_test, y_probs):.4f}")
    print(f"Average Precision (PR-AUC): {average_precision_score(y_test, y_probs):.4f}")
    
    # 5. Visualization - Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.ylabel('Actual Label')
    plt.xlabel('Predicted Label')
    plt.savefig('confusion_matrix.png')
    
    # 6. Precision-Recall Curve
    precision, recall, _ = precision_recall_curve(y_test, y_probs)
    plt.figure(figsize=(8, 6))
    plt.step(recall, precision, color='b', alpha=0.2, where='post')
    plt.fill_between(recall, precision, step='post', alpha=0.2, color='b')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('2-class Precision-Recall curve')
    plt.savefig('pr_curve.png')

    return y_probs

# 7. Optimal Threshold Selection
def find_optimal_threshold(y_test, y_probs):
    thresholds = np.arange(0.1, 0.9, 0.05)
    f1_scores = []
    
    from sklearn.metrics import f1_score
    
    for t in thresholds:
        y_pred = (y_probs >= t).astype(int)
        f1_scores.append(f1_score(y_test, y_pred))
    
    best_t = thresholds[np.argmax(f1_scores)]
    print(f"Optimal Threshold for F1: {best_t:.2f}")
    return best_t

if __name__ == "__main__":
    print("Initializing Fraud Detection Pipeline...")
    data = load_data()
    X_train, X_test, y_train, y_test = preprocess_data(data)
    
    print(f"Training on {X_train.shape[0]} samples with imbalance 1:{(y_train == 0).sum()/(y_train == 1).sum():.0f}")
    clf = train_model(X_train, y_train)
    
    probs = evaluate_model(clf, X_test, y_test)
    best_threshold = find_optimal_threshold(y_test, probs)
    print("\nPipeline Complete. Visualization saved as png files.")
