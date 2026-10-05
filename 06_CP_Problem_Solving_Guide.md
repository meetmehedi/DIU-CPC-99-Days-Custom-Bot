# Competitive Programming Guide
## DIU CPC 99 Days — Stage 2 Reference (Days 21–45)

---

## PHASE 0 — Before You Compete: Hello World in CP

### Your First CP Program (C++)
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cout << "Hello, World!" << "\n";
    return 0;
}
```

**Why this template?**
- `bits/stdc++.h` includes everything needed for CP
- `ios_base::sync_with_stdio(false)` + `cin.tie(NULL)` = fast I/O
- Always use `"\n"` over `endl` (endl flushes buffer — slow)

### Your First CP Problem (Read, Think, Code)
Problem: "Given N integers, print their sum."
```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    long long sum = 0;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        sum += x;
    }
    cout << sum << "\n";
}
```

---

## PHASE 1 — Complexity & Constraints (Day 21)

### Big-O Quick Reference

| Complexity | Safe N (1 sec) | Example |
|------------|---------------|---------|
| O(1) | Any | Array access |
| O(log N) | ~10^18 | Binary search |
| O(N) | ~10^8 | Linear scan |
| O(N log N) | ~10^6 | Sorting |
| O(N^2) | ~10^4 | Nested loops |
| O(N^3) | ~500 | Triple loop |
| O(2^N) | ~25 | Bitmask |
| O(N!) | ~12 | Permutations |

**Constraint Reading Strategy**
1. Read N first — determines allowed complexity
2. Read value ranges — determines int vs long long
3. Time limit (usually 1–2 sec), memory limit (usually 256 MB)

---

## PHASE 2 — Brute Force (Day 22)

**When to brute force:** N is small, or as a baseline to verify.

```cpp
// Find all pairs summing to K — O(N^2)
int count = 0;
for (int i = 0; i < n; i++)
    for (int j = i+1; j < n; j++)
        if (a[i] + a[j] == k)
            count++;
```

**Rule:** Always write brute force first. Helps understand the problem.

---

## PHASE 3 — Sorting (Day 23)

```cpp
vector<int> v = {5, 2, 8, 1};
sort(v.begin(), v.end());                   // ascending
sort(v.begin(), v.end(), greater<int>());   // descending

// Custom comparator (sort pairs by 2nd element)
sort(p.begin(), p.end(), [](auto& a, auto& b){
    return a.second < b.second;
});

// Sort struct
sort(students.begin(), students.end(), [](Student& a, Student& b){
    return a.marks > b.marks; // descending marks
});
```

---

## PHASE 4 — Binary Search (Day 24)

```cpp
// STL binary search (sorted array required)
bool found = binary_search(v.begin(), v.end(), target);
auto it = lower_bound(v.begin(), v.end(), target); // first >= target
auto it = upper_bound(v.begin(), v.end(), target); // first > target

// Manual binary search
int lo = 0, hi = n-1, ans = -1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == target) { ans = mid; break; }
    else if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}

// Binary search on ANSWER (powerful pattern!)
// "Find minimum X such that condition(X) is true"
int lo = MIN_VAL, hi = MAX_VAL;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (condition(mid)) hi = mid;
    else lo = mid + 1;
}
// Answer is lo
```

---

## PHASE 5 — Prefix Sums (Day 25)

```cpp
// 1D prefix sum
vector<int> prefix(n+1, 0);
for (int i = 0; i < n; i++)
    prefix[i+1] = prefix[i] + a[i];

// Range sum [l, r] (0-indexed)
int rangeSum = prefix[r+1] - prefix[l];

// 2D prefix sum
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        p[i][j] = a[i][j] + p[i-1][j] + p[i][j-1] - p[i-1][j-1];

// Query rectangle (r1,c1) to (r2,c2) — 1-indexed
int sum = p[r2][c2] - p[r1-1][c2] - p[r2][c1-1] + p[r1-1][c1-1];
```

---

## PHASE 6 — Two Pointers (Day 26)

```cpp
// Find pair with target sum in sorted array
int l = 0, r = n-1;
while (l < r) {
    int s = a[l] + a[r];
    if (s == target) { /* found */ l++; r--; }
    else if (s < target) l++;
    else r--;
}

// Remove duplicates
sort(v.begin(), v.end());
int slow = 0;
for (int fast = 1; fast < n; fast++)
    if (v[fast] != v[slow])
        v[++slow] = v[fast];
```

---

## PHASE 7 — Sliding Window (Day 27)

```cpp
// Fixed window — max sum of subarray of size k
int windowSum = 0;
for (int i = 0; i < k; i++) windowSum += a[i];
int maxSum = windowSum;
for (int i = k; i < n; i++) {
    windowSum += a[i] - a[i-k];
    maxSum = max(maxSum, windowSum);
}

// Variable window — longest substring without repeating chars
unordered_map<char,int> freq;
int l = 0, maxLen = 0;
for (int r = 0; r < s.size(); r++) {
    freq[s[r]]++;
    while (freq[s[r]] > 1) { freq[s[l]]--; l++; }
    maxLen = max(maxLen, r - l + 1);
}
```

---

## PHASE 8 — Hashing (Day 28)

```cpp
// Frequency count
unordered_map<int,int> freq;
for (int x : a) freq[x]++;

// Existence check O(1)
unordered_set<int> seen;
seen.insert(x);
if (seen.count(x)) { /* exists */ }

// Ordered map/set
map<int,int> m;    // sorted keys, O(log N) ops
set<int> s;        // sorted, unique, O(log N)
```

---

## PHASE 9 — Stack (Day 29)

```cpp
// Balanced parentheses
stack<char> st;
bool valid = true;
for (char c : s) {
    if (c=='(' || c=='[' || c=='{') st.push(c);
    else {
        if (st.empty()) { valid=false; break; }
        char top = st.top(); st.pop();
        if ((c==')' && top!='(') ||
            (c==']' && top!='[') ||
            (c=='}' && top!='{'))
            { valid=false; break; }
    }
}
if (!st.empty()) valid = false;

// Next Greater Element (monotonic stack)
vector<int> nge(n, -1);
stack<int> mono;
for (int i = 0; i < n; i++) {
    while (!mono.empty() && a[mono.top()] < a[i]) {
        nge[mono.top()] = a[i];
        mono.pop();
    }
    mono.push(i);
}
```

---

## PHASE 10 — Queue / Deque (Day 30)

```cpp
// BFS using queue
queue<int> q;
q.push(start);
while (!q.empty()) {
    int node = q.front(); q.pop();
    for (int nb : adj[node]) q.push(nb);
}

// Sliding window maximum — deque of indices
deque<int> dq;
vector<int> result;
for (int i = 0; i < n; i++) {
    if (!dq.empty() && dq.front() < i-k+1) dq.pop_front();
    while (!dq.empty() && a[dq.back()] < a[i]) dq.pop_back();
    dq.push_back(i);
    if (i >= k-1) result.push_back(a[dq.front()]);
}
```

---

## PHASE 11 — Recursion & Backtracking (Day 32)

```cpp
// Generate all subsets
void subsets(int idx, vector<int>& cur, vector<int>& a) {
    if (idx == (int)a.size()) { /* process cur */ return; }
    cur.push_back(a[idx]);
    subsets(idx+1, cur, a);
    cur.pop_back();
    subsets(idx+1, cur, a);
}

// Permutations
void permute(vector<int>& a, int l, int r) {
    if (l == r) { /* process */ return; }
    for (int i = l; i <= r; i++) {
        swap(a[l], a[i]);
        permute(a, l+1, r);
        swap(a[l], a[i]); // backtrack
    }
}
```

---

## PHASE 12 — Greedy (Day 33–34)

Greedy = locally optimal choice at each step.

```cpp
// Activity selection — max non-overlapping intervals
sort(intervals.begin(), intervals.end(), [](auto& a, auto& b){
    return a.second < b.second; // sort by end time
});
int count = 0, lastEnd = -1;
for (auto& [start, end] : intervals)
    if (start >= lastEnd) { count++; lastEnd = end; }
```

---

## PHASE 13 — Bit Manipulation (Day 35)

```cpp
bool isSet(int n, int i)  { return (n >> i) & 1; }
int setBit(int n, int i)   { return n | (1 << i); }
int clearBit(int n, int i) { return n & ~(1 << i); }
int toggleBit(int n, int i){ return n ^ (1 << i); }
int countBits(int n)       { return __builtin_popcount(n); }
bool isPow2(int n)         { return n > 0 && (n & (n-1)) == 0; }

// Iterate all subsets
for (int mask = 0; mask < (1 << n); mask++)
    for (int i = 0; i < n; i++)
        if (mask & (1 << i)) { /* i-th element in subset */ }
```

---

## PHASE 14 — Math (Day 36)

```cpp
// GCD / LCM
int g = __gcd(a, b);
long long l = (long long)a / g * b;

// Sieve of Eratosthenes
vector<bool> isPrime(N+1, true);
isPrime[0] = isPrime[1] = false;
for (int i = 2; i*i <= N; i++)
    if (isPrime[i])
        for (int j = i*i; j <= N; j += i)
            isPrime[j] = false;

// Fast power mod
long long power(long long b, long long e, long long mod) {
    long long res = 1; b %= mod;
    while (e > 0) {
        if (e & 1) res = res * b % mod;
        b = b * b % mod; e >>= 1;
    }
    return res;
}
```

---

## PHASE 15 — Graphs (Day 39–41)

```cpp
// Adjacency list
vector<vector<int>> adj(n+1);

// BFS — shortest path (unweighted)
vector<int> dist(n+1, -1);
queue<int> q;
dist[src] = 0; q.push(src);
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u])
        if (dist[v] == -1) { dist[v] = dist[u]+1; q.push(v); }
}

// DFS — recursive
vector<bool> visited(n+1, false);
void dfs(int u) {
    visited[u] = true;
    for (int v : adj[u])
        if (!visited[v]) dfs(v);
}

// Count components
int comp = 0;
for (int i = 1; i <= n; i++)
    if (!visited[i]) { dfs(i); comp++; }
```

---

## PHASE 16 — Dynamic Programming (Day 42–44)

```cpp
// Memoized Fibonacci
map<int,long long> memo;
long long fib(int n) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];
    return memo[n] = fib(n-1) + fib(n-2);
}

// 0/1 Knapsack — dp[w] = max value with capacity w
vector<int> dp(W+1, 0);
for (int i = 0; i < n; i++)
    for (int w = W; w >= weight[i]; w--)
        dp[w] = max(dp[w], dp[w-weight[i]] + value[i]);

// Longest Common Subsequence
vector<vector<int>> dp(n+1, vector<int>(m+1, 0));
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1]+1;
        else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
    }

// Coin change — min coins
vector<int> dp(amount+1, INT_MAX);
dp[0] = 0;
for (int i = 1; i <= amount; i++)
    for (int c : coins)
        if (i >= c && dp[i-c] != INT_MAX)
            dp[i] = min(dp[i], dp[i-c]+1);
```

---

## PHASE 17 — Mini-Contest (Day 45)

### Contest Strategy
1. Read ALL problems first (5–10 min)
2. Start with the easiest
3. Never stuck > 30 min — move on, come back
4. Test edge cases BEFORE submitting
5. Post-contest: upsolve everything you could not solve

### Edge Cases Checklist
- n = 0 or n = 1
- All same values / all zeros
- Negative numbers
- Integer overflow → use `long long`
- Empty input / no valid answer

---

## FINAL PROJECT — CP Progress Tracker (Day 45)

### Project Goal
Build a CLI tool to log and track your competitive programming journey.

### Features
1. Add a solved problem (name, platform, difficulty, topic, time taken)
2. View problems solved by topic or date
3. Show streak, total solved, and weak topics
4. Recommend next topic to practice
5. Export stats as a summary report

### Tech Stack: Python

```python
# main.py — entry point
import json, os
from datetime import date

DATA_FILE = "data/problems.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE) as f:
        return json.load(f)

def save_data(data):
    os.makedirs("data", exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def add_problem(name, platform, difficulty, topic):
    data = load_data()
    data.append({
        "name": name,
        "platform": platform,
        "difficulty": difficulty,
        "topic": topic,
        "date": str(date.today())
    })
    save_data(data)
    print(f"Added: {name}")

def show_stats():
    data = load_data()
    print(f"Total solved: {len(data)}")
    topics = {}
    for p in data:
        topics[p["topic"]] = topics.get(p["topic"], 0) + 1
    print("Topic breakdown:", topics)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python main.py [add|stats]")
    elif sys.argv[1] == "stats":
        show_stats()
```

### Repository Structure
```
cp-tracker/
├── README.md
├── main.py
├── data/
│   └── problems.json
└── tests/
    └── test_tracker.py
```

### README must include
- What this project does
- How to run it
- Sample commands
- Future improvements (web UI, Codeforces API sync)

---

## Recommended Judges & Resources
- **Codeforces** — competitions and archive
- **CSES Problem Set** — best structured learning set (cses.fi)
- **AtCoder** — clean, beginner-friendly
- **LeetCode** — interview prep
- **CP-algorithms.com** — algorithm reference
- **Competitive Programmer's Handbook** — free PDF by Laaksonen
