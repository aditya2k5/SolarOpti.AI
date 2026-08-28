import pandas as pd

# -----------------------------
# LOAD DATASET
# -----------------------------
df = pd.read_csv(
    "dataset/hourly_peak_dataset_LARGE.csv"
)

print(
    "\nHourly Dataset Loaded!"
)

# -----------------------------
# SHAPE
# -----------------------------
print("\n===================")
print("DATASET SHAPE")
print("===================")

print(
    df.shape
)

# -----------------------------
# COLUMNS
# -----------------------------
print("\n===================")
print("COLUMNS")
print("===================")

print(
    df.columns.tolist()
)

# -----------------------------
# DATA TYPES
# -----------------------------
print("\n===================")
print("DATA TYPES")
print("===================")

print(
    df.dtypes
)

# -----------------------------
# NULL VALUES
# -----------------------------
print("\n===================")
print("MISSING VALUES")
print("===================")

print(
    df.isnull().sum()
)

# -----------------------------
# DUPLICATES
# -----------------------------
print("\n===================")
print("DUPLICATES")
print("===================")

print(
    df.duplicated().sum()
)

# -----------------------------
# NUMERICAL SUMMARY
# -----------------------------
print("\n===================")
print("NUMERICAL SUMMARY")
print("===================")

print(
    df.describe()
)

# -----------------------------
# TARGET CHECK
# -----------------------------
print("\n===================")
print("HOURLY TARGET")
print("===================")

print(
    df["hourly_kwh"]
    .describe()
)

# -----------------------------
# HOUR DISTRIBUTION
# -----------------------------
print("\n===================")
print("HOUR DISTRIBUTION")
print("===================")

print(
    df["hour"]
    .value_counts()
    .sort_index()
)

# -----------------------------
# IRRADIATION
# -----------------------------
print("\n===================")
print("IRRADIATION")
print("===================")

print(
    df["IRRADIATION"]
    .describe()
)

# -----------------------------
# AC POWER
# -----------------------------
print("\n===================")
print("AC POWER")
print("===================")

print(
    df["AC_POWER"]
    .describe()
)

# -----------------------------
# CORRELATION ANALYSIS
# -----------------------------
print("\n===================")
print("CORRELATION WITH TARGET")
print("===================")

corr = df.select_dtypes(
    include="number"
).corr()

print(
    corr["hourly_kwh"]
    .sort_values(
        ascending=False
    )
)

# -----------------------------
# FEATURE UNIQUENESS
# -----------------------------
print("\n===================")
print("FEATURE UNIQUENESS")
print("===================")

for col in [

    "hour",

    "IRRADIATION",

    "system_size_kw",

    "roof_area_sq_m"

]:
    print(
        f"{col}: {df[col].nunique()}"
    )

# -----------------------------
# PREVIEW
# -----------------------------
print("\n===================")
print("HEAD")
print("===================")

print(
    df.head()
)

print("\n===================")
print("TAIL")
print("===================")

print(
    df.tail()
)

# -----------------------------
# TRAINING READINESS
# -----------------------------
print("\n===================")
print("TRAINING READINESS")
print("===================")

if len(df) < 1000:
    print(
        "Dataset small"
    )
else:
    print(
        "Dataset size good"
    )

if df.isnull().sum().sum() > 0:
    print(
        "Missing values found"
    )
else:
    print(
        "No missing values"
    )

if df["hourly_kwh"].nunique() <= 1:
    print(
        "Target not usable"
    )
else:
    print(
        "Target usable"
    )

print(
    "\nAnalysis complete!"
)