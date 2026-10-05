/**
 * DIU CPC 99 Days — Mentor Frontend
 * dashboard.js
 *
 * Architecture:
 *  PRIMARY  → Python backend (MiniLM-L6-v2 + ChromaDB) at localhost:5050
 *  FALLBACK → Local JS engine (keyword search + template responses)
 */

'use strict';

const API_BASE = 'http://localhost:5050/api';
let   backendOnline = false;

async function checkBackend() {
  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 2500);
    const res  = await fetch(`${API_BASE}/health`, { signal: ctrl.signal });
    clearTimeout(tid);
    if (res.ok) {
      const d = await res.json();
      backendOnline = true;
      console.log(`%c ✓ MiniLM+ChromaDB backend — ${d.chunks} chunks indexed`, 'color:#10b981;font-weight:bold');
      showBackendBadge(d.chunks);
      return d;
    }
  } catch { backendOnline = false; }
  console.warn('[Mentor] Backend offline — local fallback active');
  return null;
}

async function callBackendChat(query, context) {
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(tid);
    throw e;
  }
}

function showBackendBadge(chunks) {
  const badge = document.createElement('div');
  badge.style.cssText = 'position:fixed;bottom:16px;right:16px;background:#10b981;color:white;font-size:.7rem;font-weight:700;padding:5px 12px;border-radius:99px;z-index:999;font-family:monospace;box-shadow:0 2px 8px rgba(0,0,0,.2);animation:fadeUp .4s ease';
  badge.textContent = `⚡ MiniLM+ChromaDB · ${chunks} chunks`;
  document.body.appendChild(badge);
  setTimeout(() => badge.remove(), 4000);
}

/* ═══════════════════════════════════════════════════════════════
   1. KNOWLEDGE BASE  (all files embedded as chunks)
═══════════════════════════════════════════════════════════════ */

const KB = {

  /* ── PROGRAM RULES ── */
  rules: [
    { id:'r1', tags:['rules','certificate','crest','complete','eligibility'],
      content:`Certificate/Crest eligibility: 80+ meaningful days completed, required track deliverables completed, final project submitted, final review completed by DIU CPC team. Official criteria decided by DIU CPC, not by this mentor.` },
    { id:'r2', tags:['rules','tracks','program'],
      content:`DIU CPC 99 Days tracks: Competitive Programming, Web Development, AI & Machine Learning, App Development, Foundations (shared). Students may choose one primary track or explore all.` },
    { id:'r3', tags:['rules','student','expectations','integrity'],
      content:`Student expectations: Practice consistently. Submit genuine work. Maintain a learning log. Use AI as a learning assistant, not a substitute for understanding. Be able to explain submitted work.` },
    { id:'r4', tags:['time','daily','hours'],
      content:`Daily time: Usually 45–120 minutes. Project days may require more. Consistency matters more than long sessions.` },
    { id:'r5', tags:['miss','skip','day','break'],
      content:`If you miss a day: Resume rather than quit. The goal is sustainable progress, not perfection. Missing days is normal — just get back on track.` },
  ],

  /* ── FAQ ── */
  faq: [
    { id:'f1', tags:['beginner','expert','level','start'],
      content:`Q: Is this only for expert programmers? A: No. The journey begins with foundations and scales upward. Any level can start from Day 1.` },
    { id:'f2', tags:['track','switch','change'],
      content:`Q: Can I switch tracks? A: Yes. The mentor can adapt the roadmap if you decide to change your primary focus.` },
    { id:'f3', tags:['github','track','submit','verify'],
      content:`Q: Does the mentor track GitHub automatically? A: Not unless an integration is connected. Paste your links for review.` },
    { id:'f4', tags:['certificate','guarantee','finish'],
      content:`Q: Does finishing this program guarantee a certificate? A: No. Official eligibility is determined by DIU CPC.` },
    { id:'f5', tags:['real','project','build'],
      content:`Q: Can I build a real project? A: Yes! The final phase (Days 83–99) is designed around project planning, development, testing, documentation, and demo preparation.` },
  ],

  /* ── FULL 99-DAY ROADMAP ── */
  roadmap: [
    // Stage 1 — Foundations
    { day:1,  stage:1, title:'Orientation & Environment', desc:'Set up editor, compiler/interpreter, Git basics; create first repository. Write Hello World in your language.', tags:['setup','environment','git','helloworld','start','first','day1'] },
    { day:2,  stage:1, title:'Variables & Data Types', desc:'Learn int, float, string, bool. Build a basic profile program that stores and prints personal info.', tags:['variables','datatypes','int','string','bool'] },
    { day:3,  stage:1, title:'Input/Output & Operators', desc:'Read user input, use arithmetic and comparison operators. Build a simple calculator.', tags:['input','output','operators','calculator','cin','scanf','print'] },
    { day:4,  stage:1, title:'Conditions', desc:'if/else/elif, switch statements. Build a grading program and a decision tree.', tags:['conditions','if','else','switch','conditional'] },
    { day:5,  stage:1, title:'Loops', desc:'for, while, do-while loops. Solve counting problems and build pattern exercises.', tags:['loops','for','while','repeat','iteration'] },
    { day:6,  stage:1, title:'Nested Loops', desc:'Loops inside loops. Print triangles, rectangles, and number patterns.', tags:['nested','loops','pattern','triangle'] },
    { day:7,  stage:1, title:'Functions', desc:'Define and call functions. Refactor repeated logic into reusable blocks.', tags:['functions','def','void','return','methods'] },
    { day:8,  stage:1, title:'Scope & Modular Thinking', desc:'Local vs global scope. Split a small program into multiple functions.', tags:['scope','modular','global','local'] },
    { day:9,  stage:1, title:'Arrays & Lists', desc:'Store multiple values. Basic traversal, sum, min, max, search operations.', tags:['array','list','index','traverse','vector'] },
    { day:10, stage:1, title:'Strings', desc:'String operations: length, reverse, count, search, replace, split. Build a word counter.', tags:['string','text','char','reverse','substring','split'] },
    { day:11, stage:1, title:'Dictionaries / Maps / Sets', desc:'Key-value pairs. Frequency counting. Finding unique elements.', tags:['dictionary','map','set','hashmap','frequency','key','value'] },
    { day:12, stage:1, title:'File Handling', desc:'Read and write files. Store and load data persistently.', tags:['file','read','write','open','close','io'] },
    { day:13, stage:1, title:'Error Handling', desc:'try/except/catch. Handle invalid input gracefully without crashing.', tags:['error','exception','try','catch','handle'] },
    { day:14, stage:1, title:'Recursion', desc:'Functions that call themselves. Factorial, Fibonacci, Tower of Hanoi.', tags:['recursion','recursive','factorial','fibonacci','base case'] },
    { day:15, stage:1, title:'Basic OOP', desc:'Classes, objects, attributes, methods. Model real-world entities.', tags:['oop','class','object','method','constructor','attribute'] },
    { day:16, stage:1, title:'OOP Practice', desc:'Model a real-world system: Student, Bank Account, Library Book.', tags:['oop','practice','class','model','inheritance'] },
    { day:17, stage:1, title:'Debugging Fundamentals', desc:'Reproduce, isolate, fix bugs. Use print debugging and basic debugger tools.', tags:['debug','bug','fix','print','error','trace'] },
    { day:18, stage:1, title:'Testing Basics', desc:'Write test cases. Check edge cases: empty, negative, very large values.', tags:['testing','test','edge case','assert','unit test'] },
    { day:19, stage:1, title:'Git/GitHub Workflow', desc:'Branches, commits, pull requests, README files. Push your code to GitHub.', tags:['git','github','commit','branch','push','pull','merge','readme'] },
    { day:20, stage:1, title:'Foundations Mini-Project', desc:'Build and ship a small CLI project with full README and documentation.', tags:['project','mini','cli','ship','deploy','document'] },

    // Stage 2 — Competitive Programming
    { day:21, stage:2, title:'Complexity Analysis', desc:'Big-O notation: O(1), O(N), O(N log N), O(N²). Read constraints to determine allowed algorithm complexity.', tags:['complexity','bigO','time','space','constraint','efficiency'] },
    { day:22, stage:2, title:'Brute Force', desc:'When simple solutions are enough. Always code brute force first to understand the problem before optimizing.', tags:['brute force','simple','naive','all solutions'] },
    { day:23, stage:2, title:'Sorting', desc:'Built-in sort, custom comparators, merge sort concept. Sort by multiple keys.', tags:['sort','sorting','comparator','merge sort','quicksort','order'] },
    { day:24, stage:2, title:'Binary Search', desc:'Search in sorted arrays O(log N). Binary search on answer pattern. lower_bound, upper_bound.', tags:['binary search','bsearch','sorted','logn','lower bound','upper bound'] },
    { day:25, stage:2, title:'Prefix Sums', desc:'Precompute range sums in O(1). 1D and 2D prefix arrays. Range queries.', tags:['prefix sum','range sum','cumulative','precompute','range query'] },
    { day:26, stage:2, title:'Two Pointers', desc:'Two pointers moving toward each other or in the same direction. Find pairs with target sum.', tags:['two pointer','pair','sum','opposite','window'] },
    { day:27, stage:2, title:'Sliding Window', desc:'Fixed and variable window on arrays/strings. Maximum subarray sum of size K.', tags:['sliding window','window','subarray','substring','contiguous'] },
    { day:28, stage:2, title:'Hashing', desc:'HashMap, HashSet for O(1) lookup. Frequency counting, existence checks, grouping.', tags:['hash','hashmap','hashset','frequency','count','lookup','unordered'] },
    { day:29, stage:2, title:'Stack', desc:'LIFO data structure. Balanced parentheses, monotonic stack, Next Greater Element.', tags:['stack','lifo','push','pop','parentheses','monotonic','nge'] },
    { day:30, stage:2, title:'Queue & Deque', desc:'FIFO structure, double-ended queue. BFS traversal, sliding window maximum.', tags:['queue','deque','fifo','bfs','sliding window max'] },
    { day:31, stage:2, title:'Linked Lists', desc:'Node structure, traversal, insertion, deletion. Detect cycle with Floyd\'s algorithm.', tags:['linked list','node','pointer','cycle','floyd'] },
    { day:32, stage:2, title:'Recursion & Backtracking', desc:'Generate all subsets, permutations. N-Queens, Sudoku solver pattern.', tags:['recursion','backtracking','subset','permutation','nqueens','generate'] },
    { day:33, stage:2, title:'Greedy Basics', desc:'Local optimal choice leads to global optimum. Activity selection, coin change (standard denominations).', tags:['greedy','optimal','local','global','activity','coin','proof'] },
    { day:34, stage:2, title:'Interval Problems', desc:'Sort intervals by end time. Merge overlapping intervals, meeting rooms problem.', tags:['interval','overlap','merge','schedule','activity','meeting'] },
    { day:35, stage:2, title:'Bit Manipulation', desc:'AND, OR, XOR, shifts. Check/set/clear/toggle bits. Bitmask DP intro.', tags:['bit','bitmask','xor','and','or','shift','binary','power of 2'] },
    { day:36, stage:2, title:'Math for CP', desc:'GCD, LCM, prime sieve, modular arithmetic, fast exponentiation, modular inverse.', tags:['math','gcd','lcm','prime','sieve','modular','exponent','number theory'] },
    { day:37, stage:2, title:'Trees', desc:'Binary tree traversals: inorder, preorder, postorder, level-order BFS. Tree height, diameter.', tags:['tree','binary tree','traversal','inorder','preorder','postorder','bfs','height'] },
    { day:38, stage:2, title:'Binary Search Trees', desc:'BST property: left < root < right. Search, insert, delete in O(h). Balanced vs unbalanced.', tags:['bst','binary search tree','search','insert','delete','balanced'] },
    { day:39, stage:2, title:'Graph Representation', desc:'Adjacency list vs matrix. Weighted and unweighted graphs. Build graph from edges.', tags:['graph','adjacency','list','matrix','edge','vertex','node','weighted'] },
    { day:40, stage:2, title:'BFS', desc:'Breadth-First Search. Shortest path in unweighted graphs. Level-by-level traversal.', tags:['bfs','breadth','shortest path','level','queue','unweighted'] },
    { day:41, stage:2, title:'DFS', desc:'Depth-First Search. Connected components, cycle detection, topological sort intro.', tags:['dfs','depth','connected','component','cycle','topological'] },
    { day:42, stage:2, title:'Dynamic Programming', desc:'State definition, transition, base case. Overlapping subproblems + optimal substructure.', tags:['dp','dynamic programming','memoization','tabulation','state','transition','subproblem'] },
    { day:43, stage:2, title:'1D DP', desc:'Fibonacci, stair climbing, coin change, house robber, longest increasing subsequence.', tags:['dp','1d','fibonacci','stairs','coin change','lis','robber','linear dp'] },
    { day:44, stage:2, title:'2D/Grid DP', desc:'Grid path counting, minimum path sum, knapsack, LCS (Longest Common Subsequence).', tags:['dp','2d','grid','knapsack','lcs','path','matrix'] },
    { day:45, stage:2, title:'CP Mini-Contest', desc:'Timed practice contest. Solve problems under pressure. Post-contest upsolve and analysis.', tags:['contest','competition','timed','upsolve','codeforces','practice','solve'] },

    // Stage 3 — Web Development
    { day:46, stage:3, title:'Web Fundamentals', desc:'How browsers work, client-server model, HTTP/HTTPS, URLs, DNS, request-response cycle.', tags:['web','browser','http','https','client','server','dns','request','response'] },
    { day:47, stage:3, title:'HTML Structure', desc:'Semantic HTML5 elements: header, nav, main, section, article, footer. Single h1 per page.', tags:['html','semantic','header','nav','section','article','footer','structure'] },
    { day:48, stage:3, title:'Forms & Accessibility', desc:'Input types, labels, validation attributes. Keyboard navigation, ARIA labels, accessible forms.', tags:['form','input','label','accessibility','aria','validation','keyboard'] },
    { day:49, stage:3, title:'CSS Fundamentals', desc:'Selectors, box model, colors, typography, CSS variables. Build a clean styled page.', tags:['css','selector','box model','color','font','variable','style','class'] },
    { day:50, stage:3, title:'Flexbox', desc:'display:flex, justify-content, align-items, gap, flex-wrap. Build a responsive navbar and card layout.', tags:['flexbox','flex','justify','align','responsive','layout','gap','wrap'] },
    { day:51, stage:3, title:'CSS Grid', desc:'grid-template-columns, grid-template-areas, auto-fit, minmax. Build page layouts.', tags:['grid','css grid','column','row','area','minmax','responsive layout'] },
    { day:52, stage:3, title:'Responsive Design', desc:'Mobile-first approach, media queries, clamp(). Test on multiple screen sizes.', tags:['responsive','media query','mobile','breakpoint','viewport','clamp'] },
    { day:53, stage:3, title:'JavaScript Fundamentals', desc:'let/const, functions, arrow functions, arrays, objects, destructuring, spread operator.', tags:['javascript','js','let','const','function','arrow','object','array','destructure'] },
    { day:54, stage:3, title:'DOM Manipulation', desc:'querySelector, textContent, innerHTML, createElement, appendChild, classList.', tags:['dom','document','query','element','create','append','class','style','manipulate'] },
    { day:55, stage:3, title:'Events & Forms', desc:'addEventListener, event.preventDefault, form submission, input events, event delegation.', tags:['event','listener','click','submit','input','prevent default','delegation'] },
    { day:56, stage:3, title:'Async JavaScript', desc:'Promises, async/await, Promise.all. Handle asynchronous operations cleanly.', tags:['async','await','promise','fetch','asynchronous','callback','then','catch'] },
    { day:57, stage:3, title:'APIs & JSON', desc:'Consume a public REST API using fetch. Parse JSON, display data dynamically.', tags:['api','fetch','json','rest','endpoint','consume','public api','data'] },
    { day:58, stage:3, title:'Git Workflow for Web', desc:'Feature branches, clean commits, pull requests for web projects.', tags:['git','branch','commit','pull request','workflow','merge','web'] },
    { day:59, stage:3, title:'Frontend Architecture', desc:'Component thinking, modules, separation of concerns, folder structure for larger projects.', tags:['architecture','component','module','structure','frontend','organize'] },
    { day:60, stage:3, title:'Backend Fundamentals', desc:'Node.js + Express: routes, middleware, request/response. Build a simple REST API.', tags:['backend','node','express','route','middleware','server','api','rest','nodejs'] },
    { day:61, stage:3, title:'Database Concepts', desc:'SQL basics: CREATE TABLE, SELECT, INSERT, UPDATE, DELETE, WHERE, JOIN. MongoDB intro.', tags:['database','sql','mongodb','select','insert','update','delete','table','query','db'] },
    { day:62, stage:3, title:'Authentication Concepts', desc:'Password hashing with bcrypt, JWT tokens, auth middleware, sessions. Never store plain passwords.', tags:['auth','authentication','jwt','bcrypt','token','password','session','login','secure'] },
    { day:63, stage:3, title:'Testing & Debugging Web', desc:'Browser DevTools, console.log, network tab, unit tests with Jest.', tags:['testing','debug','devtools','console','network','jest','unit test','web'] },
    { day:64, stage:3, title:'Deployment', desc:'Deploy to Vercel/Netlify (frontend), Render/Railway (backend). Environment variables, HTTPS.', tags:['deploy','deployment','vercel','netlify','render','railway','env','production','hosting'] },
    { day:65, stage:3, title:'Web Mini-Project', desc:'Build and deploy a full functional web app. Add README with screenshots and live URL.', tags:['project','deploy','web app','fullstack','ship','live','demo'] },

    // Stage 4 — AI & ML
    { day:66, stage:4, title:'AI/ML Overview', desc:'Supervised vs unsupervised vs reinforcement learning. Real-world applications. ML workflow overview.', tags:['ai','ml','machine learning','supervised','unsupervised','reinforcement','overview'] },
    { day:67, stage:4, title:'Python for Data — NumPy', desc:'Arrays, vectorized math, reshape, broadcasting, random. NumPy is the foundation of data science.', tags:['numpy','array','matrix','python','vectorize','data science','ndarray'] },
    { day:68, stage:4, title:'Pandas DataFrames', desc:'read_csv, head, describe, filter, groupby, apply, merge. Clean and explore tabular data.', tags:['pandas','dataframe','csv','filter','groupby','merge','python','data'] },
    { day:69, stage:4, title:'Data Cleaning', desc:'Handle missing values (fillna, dropna), remove duplicates, fix types, detect outliers.', tags:['cleaning','missing','null','nan','duplicate','outlier','preprocess','fillna'] },
    { day:70, stage:4, title:'EDA — Exploratory Data Analysis', desc:'Understand distributions, correlations, and patterns before modeling.', tags:['eda','explore','distribution','correlation','analysis','insight','visualize'] },
    { day:71, stage:4, title:'Visualization', desc:'matplotlib, seaborn: histograms, scatter plots, box plots, heatmaps. Choose the right chart.', tags:['visualization','plot','chart','matplotlib','seaborn','histogram','scatter','heatmap'] },
    { day:72, stage:4, title:'Statistics', desc:'Mean, median, mode, variance, standard deviation, IQR, z-score, correlation coefficient.', tags:['statistics','mean','median','mode','variance','std','correlation','z-score'] },
    { day:73, stage:4, title:'Probability', desc:'Basic probability, conditional probability, Bayes theorem, distributions (normal, binomial).', tags:['probability','bayes','conditional','distribution','normal','binomial','chance'] },
    { day:74, stage:4, title:'Train/Val/Test Split', desc:'70/15/15 split. Avoid data leakage. Fit only on training data, transform all sets.', tags:['split','train','validation','test','leakage','fit','transform','sklearn'] },
    { day:75, stage:4, title:'Linear Regression', desc:'Predict continuous values. MSE, RMSE, R² score. Coefficients and intercept meaning.', tags:['linear regression','regression','mse','rmse','r2','predict','continuous','coefficient'] },
    { day:76, stage:4, title:'Logistic Regression', desc:'Binary classification. Sigmoid function. Decision boundary. Predict probability.', tags:['logistic regression','classification','sigmoid','binary','probability','decision'] },
    { day:77, stage:4, title:'Classification Metrics', desc:'Accuracy, Precision, Recall, F1-score, ROC-AUC, confusion matrix. Know when to use each.', tags:['accuracy','precision','recall','f1','roc','auc','confusion matrix','metric','classification'] },
    { day:78, stage:4, title:'Trees & Ensembles', desc:'Decision Tree, Random Forest, Gradient Boosting. Feature importance. Bias-variance tradeoff.', tags:['decision tree','random forest','ensemble','boosting','xgboost','feature importance','bias','variance'] },
    { day:79, stage:4, title:'Feature Engineering', desc:'Encoding categoricals (one-hot, label), scaling (StandardScaler, MinMax), creating new features.', tags:['feature','engineering','encoding','one hot','label encode','scale','standard scaler','normalize'] },
    { day:80, stage:4, title:'Model Comparison', desc:'Cross-validation, baseline models, learning curves. Pick the right model for your data.', tags:['model','comparison','cross validation','baseline','learning curve','select','evaluate'] },
    { day:81, stage:4, title:'Neural Networks Intro', desc:'Neurons, layers, activation functions (ReLU, sigmoid), loss, optimizer (Adam), epochs, dropout.', tags:['neural network','deep learning','neuron','layer','relu','sigmoid','adam','epoch','dropout','keras','tensorflow'] },
    { day:82, stage:4, title:'ML Mini-Project', desc:'Full pipeline: dataset → EDA → preprocess → model → evaluate → report. Present findings clearly.', tags:['project','ml','pipeline','end to end','report','evaluate','dataset'] },

    // Stage 5 — App Dev + Final Project
    { day:83, stage:5, title:'App Development Overview', desc:'Choose a stack: React Native, Flutter, or Web-based PWA. Platform considerations.', tags:['app','mobile','react native','flutter','pwa','stack','platform'] },
    { day:84, stage:5, title:'Project Setup', desc:'Create app shell, folder structure, Git repository, README skeleton.', tags:['setup','scaffold','folder','structure','git','repository','app'] },
    { day:85, stage:5, title:'UI Fundamentals', desc:'Screens, components, layouts. Build 2-3 screens of your app.', tags:['ui','screen','component','layout','design','interface'] },
    { day:86, stage:5, title:'State Management', desc:'Local state, lifted state, useState, setState. Manage data flow between components.', tags:['state','management','useState','setState','redux','data flow'] },
    { day:87, stage:5, title:'Navigation', desc:'Multi-screen navigation, stack/tab/drawer navigators, passing params between screens.', tags:['navigation','route','screen','tab','stack','drawer','param'] },
    { day:88, stage:5, title:'API Integration', desc:'Fetch data from a backend or public API. Display loading, data, and error states.', tags:['api','fetch','network','loading','error','state','integrate'] },
    { day:89, stage:5, title:'Forms & Validation', desc:'Controlled inputs, validation rules, error messages. Robust user input handling.', tags:['form','input','validation','error','controlled','submit'] },
    { day:90, stage:5, title:'Local Storage', desc:'AsyncStorage (React Native) / SharedPreferences (Flutter) / localStorage (web). Persist simple data.', tags:['storage','persist','local','async storage','shared preferences','save'] },
    { day:91, stage:5, title:'Authentication in Apps', desc:'Secure login flow, token storage, protected routes, biometrics concept.', tags:['auth','login','token','secure','protect','route','biometric'] },
    { day:92, stage:5, title:'Testing & Debugging Apps', desc:'Device testing, emulator, debugging tools, manual test cases.', tags:['testing','debug','emulator','device','manual','test case'] },
    { day:93, stage:5, title:'Final Project Proposal', desc:'Define problem, target users, MVP features, tech stack. Get mentor approval before building.', tags:['proposal','project','problem','users','mvp','feature','plan','final'] },
    { day:94, stage:5, title:'Architecture & Milestones', desc:'Plan the architecture, divide into milestones, estimate effort for each feature.', tags:['architecture','milestone','plan','estimate','design','structure','final project'] },
    { day:95, stage:5, title:'Core Feature Implementation', desc:'Build the most critical features of your final project. Focus on working MVP first.', tags:['implement','core','feature','mvp','build','code','final project'] },
    { day:96, stage:5, title:'Integration & Edge Cases', desc:'Connect all parts together. Handle edge cases, empty states, error flows.', tags:['integrate','edge case','connect','error','empty','flow','robust'] },
    { day:97, stage:5, title:'Testing & Cleanup', desc:'Fix bugs, improve UX, accessibility, performance optimizations. Code review.', tags:['test','bug','fix','cleanup','ux','accessibility','performance','review'] },
    { day:98, stage:5, title:'README & Demo Prep', desc:'Write README with screenshots, demo video, deployment/submission link. Polish the presentation.', tags:['readme','demo','video','screenshot','document','submit','present','deploy'] },
    { day:99, stage:5, title:'Final Demo + Reflection', desc:'Present your project! Reflect on the 99-day journey. Plan your next 90-day path.', tags:['final','demo','present','reflect','celebrate','next','plan','done','complete'] },
  ],

  /* ── PROJECT IDEAS ── */
  projects: [
    { id:'p1', tags:['beginner','project','idea','simple'],
      content:`Beginner projects: Student Grade Calculator, Expense Tracker CLI, Quiz App, To-Do List, Unit Converter.` },
    { id:'p2', tags:['cp','competitive','project','idea'],
      content:`CP projects: Contest Progress Tracker, Problem Recommendation Dashboard, CP Rating Visualizer, Algorithm Practice Planner.` },
    { id:'p3', tags:['web','project','idea'],
      content:`Web projects: Student Resource Hub, Club Event Portal, Portfolio Builder, Campus Lost & Found, Study Planner.` },
    { id:'p4', tags:['ml','ai','project','idea'],
      content:`AI/ML projects: Student Performance Predictor, Spam/Message Classifier, Simple Recommendation System, House/Price Prediction Demo, EDA Dashboard.` },
    { id:'p5', tags:['app','mobile','project','idea'],
      content:`App projects: Habit Tracker, Study Timer, Campus Event App, Notes App, Coding Streak Tracker.` },
    { id:'p6', tags:['project','rule','mvp'],
      content:`Project rule: Start with an MVP. Build a small complete product before adding advanced features.` },
  ],

  /* ── ASSESSMENT ── */
  assessment: [
    { id:'a1', tags:['assessment','rubric','score','grade','evaluate'],
      content:`Assessment rubric (score 1–5 each): 1.Consistency 2.Problem-solving 3.Code correctness 4.Code quality 5.Complexity awareness 6.Git/GitHub practice 7.Project execution 8.Documentation 9.Testing/debugging 10.Ability to explain own work. Excellent:45–50, Strong:35–44, Developing:25–34, Needs practice:10–24.` },
  ],

  /* ── CP ALGORITHMS ── */
  algorithms: [
    { id:'al1', tags:['array','list','sum','max','min','search','traverse'],
      content:`Array fundamentals: traversal with loops, prefix sums for range queries, two pointers for pair problems, sliding window for subarray problems. Always check for off-by-one errors and integer overflow.` },
    { id:'al2', tags:['sort','sorting','algorithm','custom','comparator'],
      content:`Sorting: std::sort O(N log N). Custom comparator with lambda. Counting sort O(N+K) for small ranges. Stability matters for multi-key sorts.` },
    { id:'al3', tags:['binary search','log','sorted','find','bound'],
      content:`Binary search: Only on sorted data. Time: O(log N). STL: lower_bound (first >=), upper_bound (first >). Binary search on answer: monotonic predicate, find minimum/maximum satisfying condition.` },
    { id:'al4', tags:['dp','dynamic programming','knapsack','lcs','lis','coin','fibonacci'],
      content:`DP steps: 1.Define state. 2.Write recurrence/transition. 3.Set base cases. 4.Determine order (top-down memoization or bottom-up tabulation). Classic DPs: Fibonacci, 0/1 Knapsack, LCS, LIS, Coin Change, Grid paths.` },
    { id:'al5', tags:['graph','bfs','dfs','shortest','path','connected','component'],
      content:`Graph: Adjacency list for sparse graphs. BFS for shortest path in unweighted graphs (use queue). DFS for connected components, cycle detection (use recursion or stack). Time: O(V+E).` },
    { id:'al6', tags:['greedy','activity','interval','schedule','optimal'],
      content:`Greedy: Works when local optimal = global optimal. Common: activity selection (sort by end), fractional knapsack, Huffman coding. Always justify WHY greedy works (exchange argument).` },
    { id:'al7', tags:['recursion','backtrack','subset','permutation','combination'],
      content:`Backtracking: Explore all possibilities + prune invalid branches. Pattern: choose → explore → unchoose. Use for subsets (2^N), permutations (N!), constraint satisfaction (N-Queens, Sudoku).` },
    { id:'al8', tags:['bit','bitmask','xor','power','binary'],
      content:`Bit tricks: Check bit i: (n>>i)&1. Set bit: n|(1<<i). Clear: n&~(1<<i). Toggle: n^(1<<i). Count bits: __builtin_popcount(n). Power of 2: n>0 && (n&(n-1))==0.` },
    { id:'al9', tags:['math','gcd','lcm','prime','sieve','mod','modular'],
      content:`Math: GCD: __gcd(a,b) or Euclidean. LCM: a/gcd(a,b)*b. Sieve of Eratosthenes for primes up to N in O(N log log N). Fast power: O(log exp). Modular inverse: power(a, MOD-2, MOD) when MOD is prime.` },
    { id:'al10', tags:['stack','queue','deque','monotonic'],
      content:`Stack uses: balanced brackets, expression evaluation, monotonic stack for Next Greater Element. Queue: BFS. Deque: sliding window max/min. Priority queue (heap) for Dijkstra, Prim.` },
    { id:'al11', tags:['tree','binary','traversal','height','diameter','lca'],
      content:`Tree: Inorder (sorted for BST), Preorder (copy tree), Postorder (delete tree), Level-order (BFS). Height: max(left, right)+1. LCA: binary lifting. Segment tree for range queries.` },
    { id:'al12', tags:['string','kmp','hash','palindrome','substring'],
      content:`String algorithms: KMP for pattern matching O(N+M). Rabin-Karp with hashing. Z-algorithm. Palindrome: expand from center or Manacher's. Trie for prefix problems.` },
  ],

  /* ── WEB KNOWLEDGE ── */
  web: [
    { id:'w1', tags:['html','structure','semantic','tag','element'],
      content:`HTML must-knows: Always have one <h1>. Use semantic tags (header, nav, main, section, article, footer). Every image needs alt text. Labels must match input id. <!DOCTYPE html> at top.` },
    { id:'w2', tags:['css','flexbox','grid','responsive','layout'],
      content:`CSS layout: Flexbox for 1D (rows or columns), Grid for 2D (rows AND columns). Mobile-first: base styles for small, then expand with @media (min-width). Use CSS custom properties (--var).` },
    { id:'w3', tags:['javascript','dom','event','async','fetch','api'],
      content:`JS essentials: Use const/let (not var). Arrow functions for callbacks. async/await over callback hell. Always handle fetch errors with try/catch. Use event delegation for dynamic content.` },
    { id:'w4', tags:['backend','express','node','route','api','rest'],
      content:`Express basics: app.get/post/put/delete for routes. Use express.json() middleware. Validate inputs. Return proper status codes (200, 201, 400, 401, 404, 500). Use environment variables for secrets.` },
    { id:'w5', tags:['security','auth','jwt','bcrypt','env','secret'],
      content:`Security rules: NEVER store passwords in plain text — use bcrypt. NEVER put secrets in client code or Git. Use .env files + .gitignore. JWT for stateless auth. Validate all user inputs. Use HTTPS.` },
    { id:'w6', tags:['deploy','deployment','hosting','vercel','netlify','render'],
      content:`Free deployment: Netlify/Vercel for static sites (drag & drop or GitHub). Render/Railway for Node.js backend. Supabase/MongoDB Atlas for database. Always check env variables are set in production.` },
  ],

  /* ── ML KNOWLEDGE ── */
  ml: [
    { id:'m1', tags:['supervised','unsupervised','reinforcement','type','ml','ai'],
      content:`ML types: Supervised (labeled data → predict label: regression, classification). Unsupervised (no labels → find patterns: clustering, dimensionality reduction). Reinforcement (agent learns by reward/penalty).` },
    { id:'m2', tags:['accuracy','precision','recall','f1','metric','evaluate','classify'],
      content:`Classification metrics: Accuracy = (TP+TN)/Total. Precision = TP/(TP+FP) — use when false positives are costly (spam filter). Recall = TP/(TP+FN) — use when false negatives are costly (cancer detection). F1 = harmonic mean of P&R.` },
    { id:'m3', tags:['overfitting','underfitting','bias','variance','regularization'],
      content:`Bias-Variance: Underfitting = high bias (model too simple). Overfitting = high variance (memorizes training data). Fix overfitting: more data, dropout, regularization (L1/L2), simpler model, cross-validation.` },
    { id:'m4', tags:['linear regression','predict','continuous','r2','mse','rmse'],
      content:`Linear Regression: Predicts continuous values. MSE = average squared error. RMSE = sqrt(MSE) (same units as target). R² = proportion of variance explained (1=perfect, 0=baseline mean). Check residual plots.` },
    { id:'m5', tags:['neural network','deep learning','layer','activation','relu','training'],
      content:`Neural Networks: Each neuron = linear combo + activation. ReLU for hidden layers (avoids vanishing gradient). Sigmoid/Softmax for output. Adam optimizer is safe default. Increase layers/neurons carefully to avoid overfitting.` },
    { id:'m6', tags:['feature','engineering','scale','encode','normalize','preprocess'],
      content:`Feature engineering: Scale numeric features (StandardScaler for normal data, MinMaxScaler for bounded). One-hot encode nominal categoricals. Label encode ordinals. Create interaction features. Never fit scaler on test set!` },
  ],

  /* ── DIU CPC INFO ── */
  club: [
    { id:'c1', tags:['diucpc','diu','club','about','website','contact','email'],
      content:`DIU CPC — Dhaka International University Computer Programming Club. Website: diucpc.club. Email: diucsecpc.official@gmail.com. Facebook: @diucsecpc. Motto: Let Infinity Be Your Limit. Est. 2019.` },
    { id:'c2', tags:['icpc','ncpc','national','contest','competition'],
      content:`DIU CPC trains for ICPC (International Collegiate Programming Contest) and NCPC (National Collegiate Programming Contest). Students compete nationally and internationally in team-based competitive programming.` },
  ],
};

/* ═══════════════════════════════════════════════════════════════
   2. SEARCH ENGINE  (TF-IDF-style keyword retrieval)
═══════════════════════════════════════════════════════════════ */

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

function scoreChunk(chunk, queryTokens) {
  const chunkText = (chunk.tags.join(' ') + ' ' + (chunk.content || chunk.desc || chunk.title || '')).toLowerCase();
  let score = 0;
  for (const t of queryTokens) {
    if (chunk.tags.some(tag => tag.includes(t) || t.includes(tag))) score += 3;
    if (chunkText.includes(t)) score += 1;
    // Exact match bonus
    if (chunk.tags.includes(t)) score += 2;
  }
  return score;
}

function searchKB(query, topK = 4) {
  const queryTokens = tokenize(query);
  const allChunks = [
    ...KB.rules, ...KB.faq, ...KB.projects,
    ...KB.assessment, ...KB.algorithms, ...KB.web,
    ...KB.ml, ...KB.club,
  ];

  const scored = allChunks.map(c => ({ chunk: c, score: scoreChunk(c, queryTokens) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map(x => x.chunk);
}

function searchDays(query, topK = 3) {
  const queryTokens = tokenize(query);
  return KB.roadmap
    .map(d => ({ day: d, score: scoreChunk(d, queryTokens) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(x => x.day);
}

/* ═══════════════════════════════════════════════════════════════
   3. MENTOR ENGINE  (Intent + Knowledge-grounded responses)
═══════════════════════════════════════════════════════════════ */

const MentorState = {
  memberName: '',
  memberId: '',
  track: 'explore',
  currentDay: 1,
  completedDays: new Set(),
  lastTopic: '',
  conversationHistory: [],
};

function getStageInfo(day) {
  if (day <= 20) return { name: '🏗️ Foundations', range: 'Days 1–20', num: 1 };
  if (day <= 45) return { name: '⚔️ Competitive Programming', range: 'Days 21–45', num: 2 };
  if (day <= 65) return { name: '🌐 Web Development', range: 'Days 46–65', num: 3 };
  if (day <= 82) return { name: '🤖 AI & Machine Learning', range: 'Days 66–82', num: 4 };
  return { name: '📱 App Dev + Final Project', range: 'Days 83–99', num: 5 };
}

function getDayData(dayNum) {
  return KB.roadmap.find(d => d.day === dayNum);
}

function formatDay(d, currentDay) {
  const isComplete = MentorState.completedDays.has(d.day);
  const isCurrent = d.day === currentDay;
  return `
# DAY ${d.day} / 99 — ${d.title.toUpperCase()}

🎯 **Goal:** ${d.desc}

📚 **Learn:** Study the core concepts for today's topic. Look for tutorials, documentation, or ask me to explain anything.

🧠 **Think:** Before coding, understand:
- What is the problem asking?
- What are the constraints?
- What's the simplest approach?

💻 **Practice:** Write code that demonstrates today's concept. Start simple, then add complexity.

⚡ **Challenge:** Solve at least one harder problem or extend your practice solution with an extra feature.

📦 **Deliverable:** A working program, solution, or mini-project for Day ${d.day}. Commit it to GitHub.

⏱️ **Suggested time:** 45–90 minutes

✅ **Completion checklist:**
- [ ] Understood the core concept
- [ ] Completed the practice exercise
- [ ] Attempted the challenge
- [ ] Wrote a short reflection
- [ ] Committed to GitHub (optional but recommended)

---
*Need help with any part? Just ask! Paste your code for review, or type "debug" if you're stuck.*`;
}

const MentorEngine = {

  respond(input) {
    const text = input.trim();
    const lower = text.toLowerCase();
    MentorState.lastTopic = lower;

    // ── GREETINGS ──
    if (/^(hi|hello|hey|সালাম|হ্যালো|আস্সালামু)/.test(lower)) {
      return this.greet();
    }

    // ── START / ONBOARDING ──
    if (/^(start|শুরু|begin|let'?s go|lets go)/.test(lower)) {
      return this.handleStart();
    }

    // ── DAY X ──
    const dayMatch = lower.match(/\b(?:day|দিন)\s*(\d+)\b/) || lower.match(/^(\d+)$/);
    if (dayMatch) {
      const dayNum = parseInt(dayMatch[1]);
      if (dayNum >= 1 && dayNum <= 99) return this.handleDay(dayNum);
    }

    // ── TODAY ──
    if (/\b(today|আজ|current day|current lesson)\b/.test(lower)) {
      return this.handleDay(MentorState.currentDay);
    }

    // ── NEXT ──
    if (/^(next|পরের|next day|next lesson)\b/.test(lower)) {
      const next = Math.min(MentorState.currentDay + 1, 99);
      return this.handleDay(next);
    }

    // ── COMPLETE ──
    if (/\b(complete|done|finished|শেষ|completed)\b/.test(lower) && !/\?/.test(lower)) {
      return this.handleComplete();
    }

    // ── PROGRESS ──
    if (/\b(progress|my progress|প্রগ্রেস|status|how am i)\b/.test(lower)) {
      return this.handleProgress();
    }

    // ── ROADMAP ──
    if (/\b(roadmap|রোডম্যাপ|plan|schedule|stages|overview|all days)\b/.test(lower)) {
      openRoadmapModal();
      return `Here's the full **99-Day Roadmap** 🗺️\n\nI've opened the roadmap panel for you. You can click any day to jump to that lesson.\n\n**Quick overview:**\n- 🏗️ Days 1–20: Foundations\n- ⚔️ Days 21–45: Competitive Programming\n- 🌐 Days 46–65: Web Development\n- 🤖 Days 66–82: AI & Machine Learning\n- 📱 Days 83–99: App Dev + Final Project\n\nYou're currently on **Day ${MentorState.currentDay}**. Type \`day X\` to jump to any lesson!`;
    }

    // ── HELP ──
    if (/^(help|সাহায্য|commands|what can you|how does this work)/.test(lower)) {
      return this.handleHelp();
    }

    // ── CHALLENGE ──
    if (/\b(challenge|চ্যালেঞ্জ|harder|difficult|bonus|extra)\b/.test(lower)) {
      return this.handleChallenge();
    }

    // ── DEBUG ──
    if (/\b(debug|বাগ|bug|error|not working|wrong answer|wa|tle|mle|runtime error|segfault|segmentation)\b/.test(lower)) {
      return this.handleDebug(text);
    }

    // ── CODE REVIEW ──
    if (/\b(review|রিভিউ|check my code|check code|look at my code|is this correct)\b/.test(lower) ||
        /```[\s\S]*```/.test(text) ||
        text.includes('int main') || text.includes('def ') || text.includes('function ') ||
        text.includes('class ') || text.includes('const ') || text.includes('var ')) {
      return this.handleCodeReview(text);
    }

    // ── PROJECT IDEAS ──
    if (/\b(project idea|project ideas|what (should|can) i build|project (for|topic)|আইডিয়া)\b/.test(lower)) {
      return this.handleProjectIdeas();
    }

    // ── TRACK SELECTION ──
    if (/\b(i (want|choose|pick|am interested in)|my track|change track|switch to)\b/.test(lower)) {
      return this.handleTrackChange(lower);
    }

    // ── CERTIFICATE ──
    if (/\b(certificate|cert|crest|completion|qualify|eligible)\b/.test(lower)) {
      return this.handleCertificate();
    }

    // ── FAQ ──
    if (/\b(miss|skip|absent|missed|রুটিন|schedule)\b/.test(lower)) {
      return `**What if you miss a day?** 💪\n\nResume — don't quit. The goal is **sustainable progress**, not perfection.\n\nMissing a day is completely normal. The rule is simple:\n> One missed day → get back the next day.\n> A pattern of missing → reflect and adjust your schedule.\n\nYour journey continues from Day ${MentorState.currentDay}. Shall we continue? 🚀`;
    }

    // ── ABOUT DIU CPC ──
    if (/\b(diucpc|diu cpc|club|about|website|email|contact|facebook)\b/.test(lower)) {
      const info = KB.club[0].content;
      return `**About DIU CPC** 🏫\n\n${info}\n\nFounded in 2019, DIU CPC trains students for ICPC, NCPC, and national competitions while building a strong programming community at Dhaka International University.`;
    }

    // ── GENERAL KNOWLEDGE SEARCH ──
    return this.handleSearch(text);
  },

  greet() {
    const name = MentorState.memberName.split(' ')[0] || 'there';
    const day = MentorState.currentDay;
    const stage = getStageInfo(day);
    return `Hey ${name}! 👋 Welcome back to your 99-day journey!\n\n**You're on Day ${day}/99** — ${stage.name}\n\nWhat would you like to do today?\n- Type **"day ${day}"** for today's lesson\n- Type **"challenge"** for a practice problem\n- Type **"help"** to see all commands\n- Or just ask me anything about coding! 💡`;
  },

  handleStart() {
    const name = MentorState.memberName.split(' ')[0] || 'friend';
    return `Welcome to DIU CPC's 99 Days of Coding! 🚀\n\n*"For the next 99 days, we're not chasing perfection — we're building consistency, problem-solving ability, and real projects."*\n\n**Choose your primary track:**\n\n**1. ⚔️ Competitive Programming** — ICPC prep, algorithms, problem solving\n**2. 🌐 Web Development** — HTML → CSS → JS → full-stack apps\n**3. 🤖 AI & Machine Learning** — Python, data, models, projects\n**4. 📱 App Development** — Mobile/web apps from scratch\n**5. 🔭 Explore Everything** — Sample all tracks\n\nClick a track in the sidebar, or tell me: **"I want to do Web Development"** (or any track).\n\nReady to begin? Type **"day 1"** to start your journey! 💪`;
  },

  handleDay(dayNum) {
    const d = getDayData(dayNum);
    if (!d) return `Day ${dayNum} is out of range. The journey is Days 1–99.`;

    MentorState.currentDay = dayNum;
    updateSidebarProgress();
    return formatDay(d, dayNum);
  },

  handleComplete() {
    const day = MentorState.currentDay;
    MentorState.completedDays.add(day);
    const next = Math.min(day + 1, 99);
    const nextData = getDayData(next);
    updateSidebarProgress();

    const pct = Math.round((MentorState.completedDays.size / 99) * 100);

    let msg = `🎉 **Day ${day} complete!** Great work!\n\n`;
    msg += `You've completed **${MentorState.completedDays.size} / 99 days** (${pct}%). `;

    if (day === 99) {
      msg += `\n\n🏆 **YOU FINISHED THE 99-DAY JOURNEY!** Incredible achievement, ${MentorState.memberName.split(' ')[0]}!\n\nRemember: this mentor cannot issue the official DIU CPC certificate/crest. Contact DIU CPC at diucsecpc.official@gmail.com to complete your final verification.`;
    } else {
      msg += `Keep the momentum going! 🔥\n\n**Up next — Day ${next}: ${nextData?.title}**\n${nextData?.desc}\n\nType **"day ${next}"** when you're ready!`;
    }
    return msg;
  },

  handleProgress() {
    const done = MentorState.completedDays.size;
    const pct = Math.round((done / 99) * 100);
    const stage = getStageInfo(MentorState.currentDay);
    const streak = done; // simplified
    return `**📊 Your Progress Report**\n\n🆔 Member: **${MentorState.memberName}** (${MentorState.memberId})\n📅 Current Day: **${MentorState.currentDay} / 99**\n🟢 Days Completed: **${done}** (${pct}%)\n🎯 Current Stage: **${stage.name}** (${stage.range})\n⚔️ Track: **${this.getTrackName()}**\n\n${done === 0 ? "You haven't marked any days complete yet. Type **\"complete\"** after finishing a day!" : `**Progress bar:** ${'█'.repeat(Math.floor(pct/5))}${'░'.repeat(20 - Math.floor(pct/5))} ${pct}%`}\n\n*Note: This progress is session-based. DIU CPC tracks official progress separately.*`;
  },

  handleHelp() {
    return `**🛠️ Mentor Commands**\n\n| Command | What it does |\n|---------|-------------|\n| \`start\` | Begin your 99-day journey |\n| \`day 1\` … \`day 99\` | Get any day's lesson |\n| \`today\` | Current day's lesson |\n| \`next\` | Next day's lesson |\n| \`complete\` | Mark current day done |\n| \`challenge\` | Get a coding challenge |\n| \`review\` | Submit code for review |\n| \`debug\` | Get debugging help |\n| \`roadmap\` | See the full 99-day plan |\n| \`progress\` | View your progress |\n| \`project ideas\` | Get project suggestions |\n| \`help\` | Show this menu |\n\n**Or just ask anything!** I know:\n- All 99 daily lessons\n- Algorithms (sorting, DP, graphs, trees…)\n- Web dev (HTML, CSS, JS, Node, React…)\n- Machine Learning (sklearn, pandas, neural nets…)\n- Git, deployment, project planning\n- DIU CPC rules and program info`;
  },

  handleChallenge() {
    const day = MentorState.currentDay;
    const d = getDayData(day);
    const stage = getStageInfo(day);

    const cpChallenges = [
      { title:'Two Sum', desc:'Given an array and target K, find two numbers that sum to K. Return their indices.', hint:'Use a hash map for O(N) solution.' },
      { title:'Longest Common Prefix', desc:'Find the longest string that is a prefix of all strings in an array.', hint:'Sort the array first — compare only first and last strings.' },
      { title:'Maximum Subarray', desc:'Find the contiguous subarray with the largest sum. (Kadane\'s Algorithm)', hint:'Track current_sum and max_sum. If current_sum < 0, reset to 0.' },
      { title:'Valid Parentheses', desc:'Given a string with `()[]{}`, determine if it is valid (properly closed).', hint:'Use a stack. Push open brackets, pop on close.' },
      { title:'Climbing Stairs', desc:'You can take 1 or 2 steps. How many ways to reach step N?', hint:'DP: dp[n] = dp[n-1] + dp[n-2]. Same as Fibonacci.' },
      { title:'Binary Search', desc:'Implement binary search from scratch. Find target in sorted array.', hint:'lo=0, hi=n-1, mid=(lo+hi)/2. Compare and narrow range.' },
      { title:'Merge Two Sorted Arrays', desc:'Merge two sorted arrays into one sorted array without extra space.', hint:'Use three pointers starting from the end.' },
      { title:'Reverse a Linked List', desc:'Reverse a singly linked list in-place.', hint:'Use three pointers: prev, curr, next. Iterate and redirect.' },
      { title:'Number of Islands', desc:'Count connected components of 1s in a 2D grid (4-directional).', hint:'BFS or DFS from each unvisited 1. Mark visited as 0.' },
      { title:'Coin Change', desc:'Given coin denominations and an amount, find the minimum number of coins.', hint:'DP: dp[i] = min(dp[i], dp[i-coin]+1) for each coin.' },
    ];

    const webChallenges = [
      { title:'To-Do App', desc:'Build a to-do list with add, complete, and delete. Persist to localStorage.', hint:'Use data-id attributes on buttons for event delegation.' },
      { title:'Fetch & Display', desc:'Consume a public API (e.g. JSONPlaceholder) and display 10 posts with search filter.', hint:'async/await + fetch. Filter on input event.' },
      { title:'CSS Card Flip', desc:'Build a flashcard that flips on click to reveal the answer.', hint:'CSS transform: rotateY(180deg) + backface-visibility: hidden.' },
      { title:'Form Validator', desc:'Build a registration form with live validation: email format, password strength, match.', hint:'regex.test() for email. Check length and special chars for password.' },
      { title:'Theme Switcher', desc:'Add dark/light mode with toggle. Persist preference to localStorage.', hint:'Toggle a class on <html> element. Read localStorage on page load.' },
    ];

    const mlChallenges = [
      { title:'Iris Classification', desc:'Use sklearn to classify Iris flowers (setosa, versicolor, virginica) using sepal/petal measurements.', hint:'Load with datasets.load_iris(). Try RandomForestClassifier.' },
      { title:'Housing Price Prediction', desc:'Predict house prices using the Boston or California housing dataset.', hint:'LinearRegression or RandomForest. Evaluate with RMSE and R².' },
      { title:'EDA on a CSV', desc:'Pick any dataset from Kaggle. Explore 5 questions: distributions, correlations, outliers.', hint:'Use df.describe(), df.corr(), seaborn heatmap.' },
    ];

    let challenge;
    if (day >= 66) challenge = mlChallenges[Math.floor(Math.random()*mlChallenges.length)];
    else if (day >= 46) challenge = webChallenges[Math.floor(Math.random()*webChallenges.length)];
    else challenge = cpChallenges[Math.floor(Math.random()*cpChallenges.length)];

    return `**⚡ Challenge — Day ${day}**\n\n### ${challenge.title}\n\n**Problem:** ${challenge.desc}\n\n**Hint 💡:** ${challenge.hint}\n\n**Requirements:**\n- [ ] Understand the problem fully before coding\n- [ ] Write a brute force solution first\n- [ ] Test with edge cases (empty, single element, duplicates)\n- [ ] Analyze time and space complexity\n\n---\nPaste your solution and I'll review it! Or type **"hint"** for more guidance.`;
  },

  handleDebug(text) {
    const hasCode = text.includes('```') || text.includes('\n') || text.length > 100;
    if (hasCode) {
      return this.handleCodeReview(text);
    }
    return `**🐛 Debug Mode**\n\nLet's find that bug! Walk through these steps:\n\n**1. Reproduce it**\n- What input causes the error?\n- What output do you expect vs. what you get?\n\n**2. Isolate it**\n- Add \`print\` / \`cout\` statements inside your loop or function\n- Comment out sections until the bug disappears\n\n**3. Common culprits:**\n- 🔢 **Off-by-one:** \`< n\` vs \`<= n\`\n- 💥 **Integer overflow:** Use \`long long\` for large values\n- 📭 **Empty input:** What happens when n=0?\n- 🔄 **Infinite loop:** Does the loop condition ever become false?\n- 🗂️ **Index out of bounds:** Is your array big enough?\n- 🚫 **Null pointer:** Initialized all variables before use?\n\n**Paste your code** and I'll pinpoint the exact issue! 👇`;
  },

  handleCodeReview(text) {
    const hasActualCode = /[{}();]/.test(text) || text.includes('def ') || text.includes('int ') ||
      text.includes('function') || text.includes('class') || text.includes('```');

    if (!hasActualCode) {
      openCodeModal();
      return `**💻 Code Review Mode**\n\nI've opened a code editor for you. Paste your code there and I'll give you a full review covering:\n\n✅ What works\n⚠️ What needs attention\n💡 Why it's an issue\n🔧 How to fix it\n🚀 One improvement challenge\n\nOr you can paste code directly in the chat!`;
    }

    // Extract code block
    const codeMatch = text.match(/```[\w]*\n?([\s\S]*?)```/) || [null, text];
    const code = codeMatch[1].trim();

    // Analyze
    const issues = [];
    if (/endl/.test(code) && /(c\+\+|cpp|cout)/i.test(code)) issues.push('⚠️ Use `"\\n"` instead of `endl` — `endl` flushes the buffer and is slower in competitive programming.');
    if (/int\s+main/.test(code) && !/#include/.test(code)) issues.push('⚠️ Missing `#include` directives at the top.');
    if (/for\s*\(.*i\s*=\s*0.*i\s*<=\s*\w+\s*\)/.test(code)) issues.push('⚠️ Possible off-by-one: `i <= n` usually goes one index too far. Use `i < n` for 0-indexed arrays.');
    if (/int\s+(?!main|i\b|j\b|k\b|n\b|m\b)\w+\s*=\s*\d{8,}/.test(code)) issues.push('⚠️ Large constant stored in `int` — may overflow. Use `long long`.');
    if (/void\s+main/.test(code)) issues.push('⚠️ `void main()` is non-standard. Use `int main() { ... return 0; }`.');
    if (/global\s+/.test(code) || /^[a-z_]+\s*=/.test(code)) issues.push('💡 Prefer local variables over global when possible for clarity.');

    const goodParts = [];
    if (/function|def |int main/.test(code)) goodParts.push('✅ Code is organized into functions/methods — good practice!');
    if (/\/\/|#/.test(code)) goodParts.push('✅ Code has comments — keep it up!');
    if (/const |final /.test(code)) goodParts.push('✅ Using constants — great for readability!');

    let review = `**💻 Code Review**\n\n`;
    if (goodParts.length) review += goodParts.join('\n') + '\n\n';
    if (issues.length) {
      review += `**Issues Found:**\n${issues.join('\n')}\n\n`;
    } else {
      review += `✅ **No obvious issues detected!** The code looks structurally sound.\n\n`;
    }
    review += `**General advice:**\n- Test with edge cases: n=0, n=1, all same values, negative numbers\n- Check time complexity: what's the size of input?\n- Can you explain every line? That's the real test.\n\n🚀 **Challenge:** Refactor one part to be more readable or efficient.\n\n*For a deeper review, describe what problem you're solving and I'll give more specific feedback!*`;
    return review;
  },

  handleProjectIdeas() {
    const track = MentorState.track;
    const trackMap = { cp:'cp', web:'web', ml:'ml ai', app:'app', explore:'beginner' };
    const keyword = trackMap[track] || 'beginner';

    const ideas = KB.projects.find(p => p.tags.some(t => keyword.includes(t)));
    const beginner = KB.projects[0].content;

    return `**💡 Project Ideas for ${this.getTrackName()}**\n\n${ideas?.content || beginner}\n\n**Project golden rule:** ${KB.projects[5].content}\n\n**How to pick:**\n1. Start with something you'd actually use\n2. Define the MVP (Minimum Viable Product) first\n3. Build it, break it, fix it\n4. Deploy it and share the link\n\nWant me to help you plan a specific project? Tell me which idea interests you! 🚀`;
  },

  handleTrackChange(lower) {
    let track = 'explore';
    if (/cp|competitive|algorithm|icpc/.test(lower)) track = 'cp';
    else if (/web|frontend|backend|html|css|javascript/.test(lower)) track = 'web';
    else if (/ml|ai|machine learning|data|python/.test(lower)) track = 'ml';
    else if (/app|mobile|flutter|react native/.test(lower)) track = 'app';

    MentorState.track = track;
    const trackNames = { cp:'Competitive Programming', web:'Web Development', ml:'AI & Machine Learning', app:'App Development', explore:'Explore Everything' };
    const name = trackNames[track];

    document.querySelectorAll('.track-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.track === track);
    });

    return `**Track set to: ${name}** ✅\n\nGreat choice! Here's what to expect:\n\n${this.getTrackBlurb(track)}\n\nType **"day ${MentorState.currentDay}"** to continue your journey on this track, or **"roadmap"** to see the full plan!`;
  },

  getTrackBlurb(track) {
    const blurbs = {
      cp: `⚔️ **Competitive Programming** (Days 21–45 focus)\nMaster algorithms, data structures, and problem-solving speed. Prepare for ICPC and national contests. You'll solve 100s of problems on Codeforces, CSES, and LeetCode.`,
      web: `🌐 **Web Development** (Days 46–65 focus)\nBuild real apps from scratch. HTML → CSS → JavaScript → Node.js → Database → Deployment. By Day 65, you'll have a live deployed web app.`,
      ml: `🤖 **AI & Machine Learning** (Days 66–82 focus)\nPython, NumPy, Pandas, sklearn, visualization, regression, classification, neural networks. Build a complete ML project by Day 82.`,
      app: `📱 **App Development** (Days 83–99 focus)\nBuild a real mobile/web app. UI → State → Navigation → API → Auth → Deploy. Present your final project on Day 99.`,
      explore: `🔭 **Explore Everything**\nSample all tracks! You'll touch foundations, CP, web, ML, and app dev — great for discovering what you love most.`,
    };
    return blurbs[track] || blurbs.explore;
  },

  getTrackName() {
    const names = { cp:'Competitive Programming', web:'Web Development', ml:'AI & ML', app:'App Development', explore:'Explore Everything' };
    return names[MentorState.track] || 'Explore Everything';
  },

  handleCertificate() {
    return `**🏅 Certificate / Crest Eligibility**\n\nThe suggested completion baseline for the DIU CPC 99 Days certificate:\n\n- ✅ **80+ meaningful days** completed\n- ✅ **Required track deliverables** submitted\n- ✅ **Final project** submitted (Day 93–99)\n- ✅ **Final review** completed by the DIU CPC team\n\n⚠️ **Important:** This mentor **cannot** issue, authenticate, or promise an official certificate. Official eligibility is determined exclusively by the **DIU CPC team**.\n\nContact: **diucsecpc.official@gmail.com** for official certification questions.`;
  },

  handleSearch(query) {
    // Search knowledge base
    const chunks = searchKB(query, 3);
    const days = searchDays(query, 2);

    if (chunks.length === 0 && days.length === 0) {
      return `I don't have specific information about that, but I can help you with:\n\n- **Day lessons** (type "day 1" through "day 99")\n- **Algorithms** (sorting, binary search, DP, graphs...)\n- **Web dev** (HTML, CSS, JS, Node, APIs...)\n- **Machine learning** (sklearn, pandas, neural nets...)\n- **Code review** (paste your code!)\n- **Debugging** (describe your error)\n- **Project ideas** (type "project ideas")\n\nWhat are you trying to learn? 🤔`;
    }

    let response = '';

    // If relevant days found, reference them
    if (days.length > 0) {
      const dayRefs = days.map(d => `**Day ${d.day}: ${d.title}** — ${d.desc}`).join('\n\n');
      response += `**Relevant lessons in your roadmap:**\n\n${dayRefs}\n\n`;
      if (days.length === 1) response += `Type **"day ${days[0].day}"** to get the full lesson!\n\n`;
    }

    // Add knowledge chunks
    if (chunks.length > 0) {
      const knowledgeText = chunks.map(c => c.content).join('\n\n');
      response += `**From the knowledge base:**\n\n${knowledgeText}`;
    }

    response += `\n\n---\n*Want a deeper explanation? Ask a follow-up question!*`;
    return response;
  },
};

/* ═══════════════════════════════════════════════════════════════
   4. UI LAYER
═══════════════════════════════════════════════════════════════ */

// DOM refs
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const sendBtn      = document.getElementById('sendBtn');
const charCount    = document.getElementById('charCount');

// ── Render message ──
function renderMessage(role, content, opts = {}) {
  const msg = document.createElement('div');
  msg.className = `msg ${role}`;

  const avatarEl = document.createElement('div');
  avatarEl.className = 'msg-avatar';
  avatarEl.textContent = role === 'bot' ? '🤖' : (MentorState.memberName[0] || 'U');

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = markdownToHTML(content);

  const time = document.createElement('p');
  time.className = 'msg-time';
  time.textContent = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.appendChild(bubble);
  wrapper.appendChild(time);

  msg.appendChild(avatarEl);
  msg.appendChild(wrapper);
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

// ── Typing indicator ──
function showTyping() {
  const el = document.createElement('div');
  el.className = 'msg bot';
  el.id = 'typingIndicator';

  const av = document.createElement('div');
  av.className = 'msg-avatar';
  av.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble typing-indicator';
  bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  el.appendChild(av);
  el.appendChild(bubble);
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  document.getElementById('typingIndicator')?.remove();
}

// ── Simple Markdown → HTML ──
function markdownToHTML(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```[\w]*\n?([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trim()}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // H3
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // H2
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // H1
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Checkboxes
    .replace(/- \[ \] (.+)/g, '<li style="list-style:none">☐ $1</li>')
    .replace(/- \[x\] (.+)/gi, '<li style="list-style:none;color:var(--emerald)">☑ $1</li>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Numbered list
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Table rows
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      if (/^[-| ]+$/.test(row)) return '';
      const cells = row.split('|').map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    })
    // Wrap table rows
    .replace(/((<tr>.*<\/tr>)\s*)+/gs, m => `<table style="width:100%;border-collapse:collapse;font-size:.82rem">${m}</table>`)
    // Newlines → paragraphs
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/, (m) => m.startsWith('<') ? m : `<p>${m}</p>`);
}

// ── Send message ──
async function sendMessage(text) {
  if (!text.trim()) return;
  chatInput.value = '';
  chatInput.style.height = 'auto';
  charCount.textContent = '0';
  sendBtn.disabled = true;

  // Hide chips after first interaction
  document.getElementById('chatChips').style.display = 'none';

  renderMessage('user', text);
  showTyping();

  let response;
  const context = {
    memberName:  MentorState.memberName,
    memberId:    MentorState.memberId,
    currentDay:  MentorState.currentDay,
    track:       MentorState.track,
    completedDays: [...MentorState.completedDays],
  };

  try {
    if (backendOnline) {
      // ── PRIMARY: MiniLM + ChromaDB backend ──
      const data = await callBackendChat(text, context);
      response = data.reply;

      // Show sources if any (subtle)
      if (data.sources && data.sources.length > 0) {
        const srcNames = [...new Set(data.sources.map(s => s.source.replace('.md','').replace(/_/g,' ')))].slice(0,3);
        response += `\n\n<small style="color:var(--text-subtle);font-size:.65rem">📚 Sources: ${srcNames.join(' · ')}</small>`;
      }
    } else {
      // ── FALLBACK: Local JS engine ──
      await new Promise(r => setTimeout(r, 400 + Math.random() * 500));
      response = MentorEngine.respond(text);
    }
  } catch (err) {
    console.warn('[Mentor] Backend error, using local fallback:', err.message);
    backendOnline = false;
    await new Promise(r => setTimeout(r, 300));
    response = MentorEngine.respond(text);
  }

  hideTyping();
  renderMessage('bot', response);
  sendBtn.disabled = false;
  chatInput.focus();
}

// ── Sidebar progress update ──
function updateSidebarProgress() {
  const day = MentorState.currentDay;
  const pct = Math.round((day / 99) * 100);
  const stage = getStageInfo(day);

  document.getElementById('navDay').textContent = `Day ${day}`;
  document.getElementById('navPct').textContent = `${pct}%`;
  document.getElementById('pillFill').style.width = pct + '%';
  document.getElementById('progressFraction').textContent = `Day ${day} / 99`;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('currentDayLabel').textContent = `Day ${day}`;
  document.getElementById('stageTitle').textContent = stage.name;
  document.getElementById('stageDays').textContent = stage.range;
}

// ── Roadmap modal ──
function openRoadmapModal() {
  const modal = document.getElementById('roadmapModal');
  const body = document.getElementById('roadmapBody');

  if (body.children.length === 0) {
    // Build roadmap HTML
    const stages = [
      { num:1, name:'🏗️ Stage 1 — Foundations', range:'Days 1–20', days: KB.roadmap.filter(d=>d.stage===1) },
      { num:2, name:'⚔️ Stage 2 — Competitive Programming', range:'Days 21–45', days: KB.roadmap.filter(d=>d.stage===2) },
      { num:3, name:'🌐 Stage 3 — Web Development', range:'Days 46–65', days: KB.roadmap.filter(d=>d.stage===3) },
      { num:4, name:'🤖 Stage 4 — AI & Machine Learning', range:'Days 66–82', days: KB.roadmap.filter(d=>d.stage===4) },
      { num:5, name:'📱 Stage 5 — App Dev + Final Project', range:'Days 83–99', days: KB.roadmap.filter(d=>d.stage===5) },
    ];

    stages.forEach(s => {
      const stageDiv = document.createElement('div');
      stageDiv.className = 'roadmap-stage';

      const header = document.createElement('div');
      header.className = 'stage-header';
      header.innerHTML = `<span>${s.name}</span><span class="stage-badge mono">${s.range}</span>`;
      stageDiv.appendChild(header);

      const daysDiv = document.createElement('div');
      daysDiv.className = 'roadmap-days';
      s.days.forEach(d => {
        const row = document.createElement('div');
        row.className = 'roadmap-day' + (d.day === MentorState.currentDay ? ' active-day' : '');
        const done = MentorState.completedDays.has(d.day);
        row.innerHTML = `<span class="day-num">${d.day}</span><span class="day-label"><strong>${d.title}</strong></span>${done ? '<span class="complete-badge">✓ Done</span>' : ''}`;
        row.addEventListener('click', () => {
          sendMessage(`day ${d.day}`);
          modal.hidden = true;
          document.body.style.overflow = '';
        });
        daysDiv.appendChild(row);
      });
      stageDiv.appendChild(daysDiv);
      body.appendChild(stageDiv);
    });
  }

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function openCodeModal() {
  document.getElementById('codeModal').hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('codeInput').focus();
}

// ── Welcome message ──
function showWelcome() {
  const name = MentorState.memberName.split(' ')[0];
  const day = MentorState.currentDay;
  const stage = getStageInfo(day);

  const welcome = `Welcome back, **${name}**! 👋

You're on **Day ${day}/99** of the DIU CPC 99 Days of Coding journey.

**Current Stage:** ${stage.name} (${stage.range})

Here's what I can help you with:
- 📚 **Get today's lesson** — type \`day ${day}\` or click "Today's Lesson"
- ⚡ **Practice challenge** — type \`challenge\`
- 💻 **Code review** — paste your code or type \`review\`
- 🗺️ **Full roadmap** — type \`roadmap\`
- ❓ **Anything else** — just ask!

*"Let Infinity Be Your Limit"* 🚀`;

  renderMessage('bot', welcome);
}

/* ═══════════════════════════════════════════════════════════════
   5. INIT
═══════════════════════════════════════════════════════════════ */

function initDashboard() {
  // Load member from session (set by login app.js)
  const session = (() => {
    try { return JSON.parse(sessionStorage.getItem('diucpc-session') || '{}'); }
    catch { return {}; }
  })();

  if (!session.memberId) {
    // Not logged in — redirect to login
    window.location.replace('index.html');
    return;
  }

  // Populate state
  MentorState.memberName = session.name || 'Member';
  MentorState.memberId   = session.memberId || '';
  MentorState.currentDay = session.day || 1;
  MentorState.track      = session.track || 'explore';

  // Load saved progress
  try {
    const saved = JSON.parse(localStorage.getItem(`diucpc-progress-${MentorState.memberId}`) || '{}');
    if (saved.completedDays) MentorState.completedDays = new Set(saved.completedDays);
    if (saved.currentDay) MentorState.currentDay = saved.currentDay;
    if (saved.track) MentorState.track = saved.track;
  } catch {}

  // Theme
  const theme = localStorage.getItem('diucpc-theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);

  // Populate UI
  const firstLetter = MentorState.memberName[0].toUpperCase();
  document.getElementById('memberAvatar').textContent = firstLetter;
  document.getElementById('memberChipName').textContent = MentorState.memberName.split(' ')[0];
  document.getElementById('sideAvatar').textContent = firstLetter;
  document.getElementById('sideName').textContent = MentorState.memberName;
  document.getElementById('sideId').textContent = `ID: ${MentorState.memberId}`;

  updateSidebarProgress();

  // Set active track
  MentorState.track = session.track || 'explore';
  document.querySelectorAll('.track-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.track === MentorState.track);
  });

  // Check backend (async, non-blocking)
  checkBackend();

  // Show welcome
  showWelcome();

  // ── EVENT LISTENERS ──

  // Send button
  sendBtn.addEventListener('click', () => sendMessage(chatInput.value));

  // Enter to send
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(chatInput.value); }
  });

  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + 'px';
    charCount.textContent = chatInput.value.length;
  });

  // Quick chips
  document.querySelectorAll('.chip, .qcmd').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      if (cmd === 'review') { openCodeModal(); return; }
      sendMessage(cmd);
    });
  });

  // Day prev/next
  document.getElementById('prevDay').addEventListener('click', () => {
    if (MentorState.currentDay > 1) sendMessage(`day ${MentorState.currentDay - 1}`);
  });
  document.getElementById('nextDay').addEventListener('click', () => {
    if (MentorState.currentDay < 99) sendMessage(`day ${MentorState.currentDay + 1}`);
  });

  // Track selector
  document.getElementById('trackSelector').addEventListener('click', e => {
    const btn = e.target.closest('.track-opt');
    if (!btn) return;
    MentorState.track = btn.dataset.track;
    document.querySelectorAll('.track-opt').forEach(b => b.classList.toggle('active', b === btn));
    saveProgress();
  });

  // Roadmap
  document.getElementById('roadmapBtn').addEventListener('click', openRoadmapModal);
  document.getElementById('roadmapClose').addEventListener('click', () => {
    document.getElementById('roadmapModal').hidden = true;
    document.body.style.overflow = '';
  });
  document.getElementById('roadmapModal').addEventListener('click', e => {
    if (e.target === document.getElementById('roadmapModal')) {
      document.getElementById('roadmapModal').hidden = true;
      document.body.style.overflow = '';
    }
  });

  // Code modal
  document.getElementById('codeModalClose').addEventListener('click', () => {
    document.getElementById('codeModal').hidden = true;
    document.body.style.overflow = '';
  });
  document.getElementById('codeCancel').addEventListener('click', () => {
    document.getElementById('codeModal').hidden = true;
    document.body.style.overflow = '';
  });
  document.getElementById('codeSubmit').addEventListener('click', () => {
    const code = document.getElementById('codeInput').value.trim();
    if (!code) return;
    document.getElementById('codeModal').hidden = true;
    document.body.style.overflow = '';
    document.getElementById('codeInput').value = '';
    sendMessage('Review this code:\n```\n' + code + '\n```');
  });

  // Clear chat
  document.getElementById('clearChatBtn').addEventListener('click', () => {
    chatMessages.innerHTML = '';
    document.getElementById('chatChips').style.display = 'flex';
    showWelcome();
  });

  // Theme toggle
  document.getElementById('themeToggleDash').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('diucpc-theme', next);
  });

  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    saveProgress();
    sessionStorage.removeItem('diucpc-session');
    window.location.replace('index.html');
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('roadmapModal').hidden = true;
      document.getElementById('codeModal').hidden = true;
      document.body.style.overflow = '';
    }
  });

  // Auto-save progress on unload
  window.addEventListener('beforeunload', saveProgress);
}

function saveProgress() {
  try {
    localStorage.setItem(`diucpc-progress-${MentorState.memberId}`, JSON.stringify({
      currentDay: MentorState.currentDay,
      completedDays: [...MentorState.completedDays],
      track: MentorState.track,
    }));
  } catch {}
}

// Wait for DOM
document.addEventListener('DOMContentLoaded', initDashboard);
