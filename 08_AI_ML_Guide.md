# AI & Machine Learning Guide
## DIU CPC 99 Days — Stage 4 Reference (Days 66–82)

---

## PHASE 0 — Hello World in AI/ML

```python
# Your first ML model — 5 lines
from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1],[2],[3],[4],[5]])   # study hours
y = np.array([40, 55, 65, 75, 90])   # exam marks

model = LinearRegression().fit(X, y)
print(model.predict([[6]]))           # predict for 6 hours
```

That's machine learning: learn a pattern from data, then predict.

---

## PHASE 1 — AI/ML Overview (Day 66)

### Types of Machine Learning

| Type | Description | Examples |
|------|-------------|---------|
| **Supervised** | Labeled data → predict label | Spam detection, price prediction |
| **Unsupervised** | No labels → find patterns | Customer segmentation, anomaly detection |
| **Reinforcement** | Agent learns by reward | Game AI, robotics |

### The ML Workflow
```
Problem → Data → Clean → Features → Model → Train → Evaluate → Improve → Deploy
```

### Key Terms
- **Feature (X):** Input variable (e.g., hours studied)
- **Target (y):** Output to predict (e.g., exam score)
- **Training set:** Data model learns from
- **Validation set:** Tune model without touching test set
- **Test set:** Final unbiased evaluation
- **Overfitting:** Model memorizes training data, fails on new data
- **Underfitting:** Model too simple, misses patterns

---

## PHASE 2 — Python for Data (Day 67): NumPy

```python
import numpy as np

# Arrays
a = np.array([1, 2, 3, 4, 5])
b = np.zeros((3, 4))            # 3x4 matrix of zeros
c = np.ones((2, 2))
d = np.arange(0, 10, 2)        # [0, 2, 4, 6, 8]
e = np.linspace(0, 1, 5)       # [0.0, 0.25, 0.5, 0.75, 1.0]
r = np.random.rand(3, 3)       # random 3x3

# Shape and indexing
a.shape        # (5,)
b.shape        # (3, 4)
a[0]           # first element
a[1:4]         # slice [2, 3, 4]
b[0, 1]        # row 0, col 1

# Math operations (vectorized — no loops needed!)
a + 10         # [11, 12, 13, 14, 15]
a * 2          # [2, 4, 6, 8, 10]
np.sqrt(a)
np.mean(a), np.std(a), np.sum(a)

# Matrix operations
A = np.array([[1,2],[3,4]])
B = np.array([[5,6],[7,8]])
A @ B           # matrix multiplication
A.T             # transpose
```

---

## PHASE 3 — Pandas (Day 68)

```python
import pandas as pd

# Create DataFrame
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "score": [85, 72, 90],
    "track": ["CP", "Web", "ML"]
})

# Load from CSV
df = pd.read_csv("students.csv")

# Explore
df.head()           # first 5 rows
df.tail()           # last 5 rows
df.info()           # dtypes, nulls
df.describe()       # stats for numeric columns
df.shape            # (rows, columns)
df.columns          # column names

# Select data
df["score"]                            # one column (Series)
df[["name", "score"]]                  # multiple columns
df[df["score"] > 80]                   # filter rows
df[df["track"] == "CP"]["score"].mean()# conditional mean

# Modify
df["grade"] = df["score"].apply(lambda x: "A" if x >= 80 else "B")
df.rename(columns={"score": "marks"}, inplace=True)
df.drop(columns=["track"], inplace=True)

# Group by
df.groupby("track")["score"].mean()
df.groupby("track").agg({"score": ["mean", "max", "count"]})

# Save
df.to_csv("output.csv", index=False)
```

---

## PHASE 4 — Data Cleaning (Day 69)

```python
# Check for issues
df.isnull().sum()           # count nulls per column
df.duplicated().sum()       # count duplicate rows
df.dtypes                   # check data types

# Handle missing values
df.dropna()                          # drop rows with any null
df.dropna(subset=["score"])          # drop only if 'score' is null
df["score"].fillna(df["score"].mean(), inplace=True)  # fill with mean
df["track"].fillna("Unknown", inplace=True)

# Remove duplicates
df.drop_duplicates(inplace=True)
df.drop_duplicates(subset=["email"], keep="first", inplace=True)

# Fix data types
df["score"] = pd.to_numeric(df["score"], errors="coerce")
df["date"] = pd.to_datetime(df["date"])
df["track"] = df["track"].str.lower().str.strip()

# Detect outliers (simple z-score method)
from scipy import stats
z_scores = stats.zscore(df["score"])
df_clean = df[(abs(z_scores) < 3)]   # keep within 3 standard deviations
```

---

## PHASE 5 — Exploratory Data Analysis (Day 70–71)

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Distribution of scores
df["score"].hist(bins=20, edgecolor="black")
plt.title("Score Distribution")
plt.xlabel("Score")
plt.ylabel("Count")
plt.show()

# Box plot — detect outliers
sns.boxplot(x="track", y="score", data=df)

# Correlation heatmap
sns.heatmap(df.corr(), annot=True, cmap="coolwarm")

# Scatter plot — relationship between two variables
plt.scatter(df["hours_studied"], df["score"])
plt.xlabel("Hours Studied")
plt.ylabel("Score")

# Bar chart — count by category
df["track"].value_counts().plot(kind="bar")

# Pair plot — all feature relationships
sns.pairplot(df[["score", "hours", "assignments"]])
```

---

## PHASE 6 — Statistics & Probability (Day 72–73)

```python
import numpy as np
from scipy import stats

data = [72, 85, 90, 65, 88, 92, 78, 81]

# Central tendency
mean = np.mean(data)             # average
median = np.median(data)         # middle value
mode = stats.mode(data)          # most frequent

# Spread
std = np.std(data)               # standard deviation
var = np.var(data)               # variance
iqr = stats.iqr(data)            # interquartile range

# Correlation
r, p_value = stats.pearsonr(x, y)
# r close to 1 = strong positive, -1 = negative, 0 = none
# p_value < 0.05 = statistically significant

# Normal distribution
stats.norm.pdf(x, mean, std)    # probability density
stats.norm.cdf(x, mean, std)    # cumulative probability
```

**Key probability concepts:**
- P(A) = favorable outcomes / total outcomes
- P(A|B) = P(A and B) / P(B) — conditional probability (Bayes)
- Independent events: P(A and B) = P(A) × P(B)

---

## PHASE 7 — Train/Validation/Test Split (Day 74)

```python
from sklearn.model_selection import train_test_split

X = df.drop("target", axis=1)
y = df["target"]

# 70% train, 15% validation, 15% test
X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.176, random_state=42)

print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

# GOLDEN RULE: Never look at test data during development!
# Train on X_train, tune on X_val, final score on X_test — once.
```

---

## PHASE 8 — Linear Regression (Day 75)

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# Train
model = LinearRegression()
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)     # 1.0 = perfect, 0 = same as mean

print(f"RMSE: {rmse:.2f}")
print(f"R² Score: {r2:.4f}")

# Coefficients
print("Coefficients:", model.coef_)
print("Intercept:", model.intercept_)
```

**What R² means:**
- R² = 0.85 means the model explains 85% of variance in the target.

---

## PHASE 9 — Logistic Regression & Classification (Day 76–77)

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# Metrics
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))
print(confusion_matrix(y_test, y_pred))
```

### Classification Metrics Explained

| Metric | Question It Answers | Formula |
|--------|---------------------|---------|
| **Accuracy** | Overall, how often correct? | (TP+TN) / Total |
| **Precision** | Of predicted positives, how many are real? | TP / (TP+FP) |
| **Recall** | Of real positives, how many did we find? | TP / (TP+FN) |
| **F1 Score** | Balance of precision and recall | 2×P×R / (P+R) |

**When to prioritize:**
- **Precision** → spam detection (avoid false positives)
- **Recall** → disease detection (avoid missing real cases)
- **F1** → imbalanced datasets

---

## PHASE 10 — Trees & Ensembles (Day 78)

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

# Decision Tree
dt = DecisionTreeClassifier(max_depth=5, random_state=42)
dt.fit(X_train, y_train)
print("DT Accuracy:", dt.score(X_test, y_test))

# Random Forest (ensemble of trees — usually better)
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
print("RF Accuracy:", rf.score(X_test, y_test))

# Feature importance
import pandas as pd
importances = pd.Series(rf.feature_importances_, index=X_train.columns)
importances.sort_values(ascending=False).plot(kind="bar")
```

---

## PHASE 11 — Feature Engineering (Day 79)

```python
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder

# Scale numeric features (important for linear models, neural nets)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)   # fit on train
X_test_scaled = scaler.transform(X_test)          # transform test (no fit!)

# Encode categorical features
# Label Encoding (for ordinal: beginner < intermediate < advanced)
le = LabelEncoder()
df["level_encoded"] = le.fit_transform(df["level"])

# One-Hot Encoding (for nominal: track has no order)
df = pd.get_dummies(df, columns=["track"])

# Create new features
df["score_per_hour"] = df["score"] / df["hours"]
df["is_high_scorer"] = (df["score"] > 80).astype(int)
df["month"] = pd.to_datetime(df["date"]).dt.month
```

---

## PHASE 12 — Model Comparison (Day 80)

```python
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(max_depth=5),
    "Random Forest": RandomForestClassifier(n_estimators=100),
    "SVM": SVC()
}

for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=5, scoring="accuracy")
    print(f"{name}: {scores.mean():.4f} ± {scores.std():.4f}")
```

---

## PHASE 13 — Neural Networks Intro (Day 81)

```python
import tensorflow as tf
from tensorflow import keras

# Simple neural network
model = keras.Sequential([
    keras.layers.Dense(64, activation="relu", input_shape=(X_train.shape[1],)),
    keras.layers.Dropout(0.2),               # prevent overfitting
    keras.layers.Dense(32, activation="relu"),
    keras.layers.Dense(1, activation="sigmoid")  # binary classification
])

model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_data=(X_val, y_val),
    verbose=1
)

# Evaluate
loss, acc = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {acc:.4f}")

# Plot training history
import matplotlib.pyplot as plt
plt.plot(history.history["accuracy"], label="train")
plt.plot(history.history["val_accuracy"], label="val")
plt.legend()
plt.title("Training vs Validation Accuracy")
```

**Neural Network concepts:**
- **Neuron:** Takes inputs, applies weights + bias, passes through activation
- **Layer:** Group of neurons
- **Activation (ReLU):** Adds non-linearity (lets NN learn complex patterns)
- **Loss:** How wrong the model is
- **Optimizer (Adam):** Updates weights to reduce loss
- **Epoch:** One full pass through training data
- **Dropout:** Randomly turns off neurons — prevents memorizing

---

## FINAL PROJECT — ML Mini-Project (Day 82)

### Project: Student Performance Predictor

Predict whether a student will pass or fail based on study habits and activity data.

### Steps

**Step 1: Data**
```python
# Use a public dataset or create synthetic data
import pandas as pd
import numpy as np

np.random.seed(42)
n = 500
df = pd.DataFrame({
    "hours_studied": np.random.randint(1, 10, n),
    "assignments_done": np.random.randint(0, 20, n),
    "attendance_pct": np.random.uniform(40, 100, n),
    "prev_score": np.random.randint(30, 100, n),
    "passed": None
})
# Target: pass if score >= 60 (simple rule for demo)
df["passed"] = (df["hours_studied"]*5 + df["prev_score"]*0.5 +
                df["attendance_pct"]*0.3 > 100).astype(int)
df.to_csv("student_data.csv", index=False)
```

**Step 2: EDA**
```python
print(df.describe())
print("Pass rate:", df["passed"].mean())
df.hist(figsize=(10, 8))
```

**Step 3: Preprocess**
```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X = df.drop("passed", axis=1)
y = df["passed"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
```

**Step 4: Train & Evaluate**
```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))
```

**Step 5: Report**
Write a `report.md` covering:
- Problem and dataset
- EDA findings (charts)
- Model chosen and why
- Metrics and what they mean
- Limitations and next improvements

### Repository Structure
```
student-predictor/
├── README.md
├── report.md
├── data/
│   └── student_data.csv
├── notebooks/
│   └── exploration.ipynb
├── src/
│   ├── preprocess.py
│   ├── train.py
│   └── predict.py
├── models/
│   └── model.pkl
└── requirements.txt
```

---

## Quick Reference: Algorithm Selection

| Problem Type | Start With |
|-------------|-----------|
| Predict a number | Linear Regression |
| Predict yes/no | Logistic Regression |
| Complex classification | Random Forest |
| Structured data, competition | XGBoost / LightGBM |
| Image recognition | CNN (Convolutional Neural Network) |
| Text classification | Transformers / BERT |
| Clustering (no labels) | K-Means |
| Anomaly detection | Isolation Forest |

## Libraries to Know
| Library | Use |
|---------|-----|
| `numpy` | Array math |
| `pandas` | DataFrames |
| `matplotlib` / `seaborn` | Visualization |
| `scikit-learn` | Traditional ML |
| `tensorflow` / `keras` | Neural networks |
| `xgboost` / `lightgbm` | Boosting algorithms |
| `scipy` | Statistics |
