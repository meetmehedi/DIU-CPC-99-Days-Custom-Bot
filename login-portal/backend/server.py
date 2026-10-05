"""
DIU CPC 99 Days — Mentor API Server
=====================================
Flask REST API:
  POST /api/chat        { "query": str, "context": {...} }  → { "reply": str, "sources": [...] }
  GET  /api/health      → { "status": "ok", "chunks": N }
  GET  /api/day/<n>     → { "day": N, "lesson": {...} }

Retrieval: ChromaDB (MiniLM-L6-v2) semantic search
Response:  Rule-based generation grounded in retrieved chunks
"""

import os
import re
import json
import logging
import textwrap
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import chromadb
from sentence_transformers import SentenceTransformer

load_dotenv()

# ── CONFIG ──────────────────────────────────────────────────────
CHROMA_DIR  = os.getenv('CHROMA_DIR', os.path.join(os.path.dirname(__file__), 'chroma_db'))
COLLECTION  = os.getenv('COLLECTION', 'diucpc_99days')
MODEL_NAME  = os.getenv('MODEL_NAME', 'sentence-transformers/all-MiniLM-L6-v2')
TOP_K       = int(os.getenv('TOP_K', 6))      # chunks to retrieve per query
MIN_SCORE   = float(os.getenv('MIN_SCORE', 0.42))
PORT        = int(os.getenv('PORT', 5050))
HOST        = os.getenv('HOST', '0.0.0.0')
MAX_QUERY_LENGTH = int(os.getenv('MAX_QUERY_LENGTH', 2000))
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv('ALLOWED_ORIGINS', '*').split(',') if origin.strip()]
STOPWORDS   = {
    'the','a','an','and','or','for','with','from','into','about','that','this','these','those',
    'what','when','where','why','how','which','who','what','can','could','would','should','your',
    'please','give','show','tell','need','want','does','do','did','is','are','was','were','use',
    'using','just','very','more','most','some','any','all','also','have','has','had','not','too',
    'i','me','my','we','our','you','your','he','she','it','its','them','they','them','there','here',
    'day','days','lesson','lessons','help','ask','about','need','know'
}

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
app.config['JSON_SORT_KEYS'] = False
app.config['PROPAGATE_EXCEPTIONS'] = False

CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS if ALLOWED_ORIGINS != ['*'] else ['*']}}, supports_credentials=True)
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

# ── GLOBALS (loaded once at startup) ────────────────────────────
model      = None
collection = None

@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    response.headers['Content-Security-Policy'] = "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:* https://*"
    return response


@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request', 'message': str(error)}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'message': str(error)}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ── 99-DAY ROADMAP (embedded for instant /api/day lookups) ──────
ROADMAP = {
    # Stage 1
    1:  {'title':'Orientation & Environment Setup',          'stage':1,'stage_name':'Foundations',
         'desc':'Set up your editor, compiler/interpreter, and Git. Create your first GitHub repo. Write Hello World in your chosen language.',
         'topics':['Git init','Hello World','Editor setup','Folder structure'],'time_min':45,'time_max':90},
    2:  {'title':'Variables & Data Types',                   'stage':1,'stage_name':'Foundations',
         'desc':'Understand int, float, string, bool. Build a profile program that stores and prints personal info.',
         'topics':['int','float','string','bool','type conversion'],'time_min':45,'time_max':90},
    3:  {'title':'Input/Output & Operators',                 'stage':1,'stage_name':'Foundations',
         'desc':'Read user input. Use arithmetic, comparison, and logical operators. Build a calculator.',
         'topics':['cin/scanf','cout/printf','+,-,*,/,%','==,!=,<,>','&&,||,!'],'time_min':45,'time_max':75},
    4:  {'title':'Conditions',                               'stage':1,'stage_name':'Foundations',
         'desc':'if/else/elif, switch statements. Build a grading program and a decision tree.',
         'topics':['if','else if','else','switch','ternary'],'time_min':45,'time_max':75},
    5:  {'title':'Loops',                                    'stage':1,'stage_name':'Foundations',
         'desc':'for, while, do-while loops. Solve counting problems and number patterns.',
         'topics':['for','while','do-while','break','continue'],'time_min':45,'time_max':90},
    6:  {'title':'Nested Loops & Patterns',                  'stage':1,'stage_name':'Foundations',
         'desc':'Loops inside loops. Print triangles, rectangles, and diamond patterns.',
         'topics':['nested for','outer/inner loop','pattern printing'],'time_min':60,'time_max':90},
    7:  {'title':'Functions',                                'stage':1,'stage_name':'Foundations',
         'desc':'Define and call functions. Refactor repeated logic into reusable blocks.',
         'topics':['define','call','parameters','return value','void'],'time_min':60,'time_max':90},
    8:  {'title':'Scope & Modular Thinking',                 'stage':1,'stage_name':'Foundations',
         'desc':'Local vs global scope. Split a program into multiple focused functions.',
         'topics':['local scope','global scope','pass by value','pass by reference'],'time_min':45,'time_max':75},
    9:  {'title':'Arrays & Lists',                           'stage':1,'stage_name':'Foundations',
         'desc':'Store multiple values. Traversal, sum, min, max, linear search.',
         'topics':['array declaration','indexing','traversal','sum','min/max'],'time_min':60,'time_max':90},
    10: {'title':'Strings',                                  'stage':1,'stage_name':'Foundations',
         'desc':'String operations: length, reverse, count, find, replace, split. Build a word counter.',
         'topics':['length','reverse','substring','find','split','join'],'time_min':60,'time_max':90},
    11: {'title':'Dictionaries / Maps / Sets',               'stage':1,'stage_name':'Foundations',
         'desc':'Key-value pairs. Frequency counting. Finding unique elements.',
         'topics':['dict','map','set','key','value','frequency'],'time_min':60,'time_max':90},
    12: {'title':'File Handling',                            'stage':1,'stage_name':'Foundations',
         'desc':'Read and write files. Store data persistently between program runs.',
         'topics':['open','read','write','close','with statement'],'time_min':45,'time_max':75},
    13: {'title':'Error Handling',                           'stage':1,'stage_name':'Foundations',
         'desc':'try/except/catch. Handle invalid input gracefully.',
         'topics':['try','except','catch','finally','raise/throw'],'time_min':45,'time_max':75},
    14: {'title':'Recursion',                                'stage':1,'stage_name':'Foundations',
         'desc':'Functions that call themselves. Factorial, Fibonacci, Tower of Hanoi.',
         'topics':['base case','recursive call','call stack','factorial','fibonacci'],'time_min':60,'time_max':90},
    15: {'title':'Object-Oriented Programming Basics',       'stage':1,'stage_name':'Foundations',
         'desc':'Classes, objects, attributes, methods. Model real-world entities.',
         'topics':['class','object','__init__','self/this','method'],'time_min':75,'time_max':120},
    16: {'title':'OOP Practice',                             'stage':1,'stage_name':'Foundations',
         'desc':'Model a real system: Student, BankAccount, LibraryBook.',
         'topics':['inheritance','encapsulation','polymorphism','abstraction'],'time_min':75,'time_max':120},
    17: {'title':'Debugging Fundamentals',                   'stage':1,'stage_name':'Foundations',
         'desc':'Reproduce, isolate, fix bugs. Use print debugging and a real debugger.',
         'topics':['print debug','breakpoint','traceback','logical error','syntax error'],'time_min':60,'time_max':90},
    18: {'title':'Testing Basics',                           'stage':1,'stage_name':'Foundations',
         'desc':'Write test cases. Edge cases: empty, negative, very large values.',
         'topics':['test case','edge case','assert','unit test','boundary'],'time_min':60,'time_max':90},
    19: {'title':'Git / GitHub Workflow',                    'stage':1,'stage_name':'Foundations',
         'desc':'Branches, commits, pull requests, README. Push your code to GitHub.',
         'topics':['git add','git commit','git push','branch','pull request','README'],'time_min':60,'time_max':90},
    20: {'title':'Foundations Mini-Project',                 'stage':1,'stage_name':'Foundations',
         'desc':'Build and ship a small CLI project with full README and documentation.',
         'topics':['MVP','CLI app','README','git push','documentation'],'time_min':90,'time_max':180},

    # Stage 2
    21: {'title':'Complexity Analysis',                      'stage':2,'stage_name':'Competitive Programming',
         'desc':'Big-O notation. O(1), O(N), O(N log N), O(N²). Read constraints to choose algorithm.',
         'topics':['Big-O','time complexity','space complexity','constraints','worst case'],'time_min':60,'time_max':90},
    22: {'title':'Brute Force Thinking',                     'stage':2,'stage_name':'Competitive Programming',
         'desc':'Always start with brute force. Understand the problem before optimizing.',
         'topics':['brute force','enumerate','all cases','then optimize'],'time_min':60,'time_max':90},
    23: {'title':'Sorting',                                  'stage':2,'stage_name':'Competitive Programming',
         'desc':'Built-in sort, custom comparators, merge sort concept.',
         'topics':['std::sort','comparator','lambda','merge sort','stable sort'],'time_min':60,'time_max':90},
    24: {'title':'Binary Search',                            'stage':2,'stage_name':'Competitive Programming',
         'desc':'Search sorted arrays in O(log N). Binary search on answer pattern.',
         'topics':['binary search','lo/hi/mid','lower_bound','upper_bound','monotonic predicate'],'time_min':75,'time_max':120},
    25: {'title':'Prefix Sums',                              'stage':2,'stage_name':'Competitive Programming',
         'desc':'Precompute range sums in O(1) after O(N) preprocessing.',
         'topics':['prefix array','range sum','2D prefix','difference array'],'time_min':60,'time_max':90},
    26: {'title':'Two Pointers',                             'stage':2,'stage_name':'Competitive Programming',
         'desc':'Two pointers toward each other or same direction. Pair sum, palindrome check.',
         'topics':['left/right pointer','pair sum','two sum','sorted array'],'time_min':60,'time_max':90},
    27: {'title':'Sliding Window',                           'stage':2,'stage_name':'Competitive Programming',
         'desc':'Fixed and variable windows on arrays/strings. Max sum subarray of size K.',
         'topics':['fixed window','variable window','max subarray','deque'],'time_min':60,'time_max':90},
    28: {'title':'Hashing',                                  'stage':2,'stage_name':'Competitive Programming',
         'desc':'HashMap, HashSet for O(1) lookup. Frequency, grouping, two-sum.',
         'topics':['unordered_map','unordered_set','frequency','count','collision'],'time_min':60,'time_max':90},
    29: {'title':'Stack',                                    'stage':2,'stage_name':'Competitive Programming',
         'desc':'LIFO. Balanced brackets, monotonic stack, Next Greater Element.',
         'topics':['push','pop','top','LIFO','parentheses','monotonic','NGE'],'time_min':60,'time_max':90},
    30: {'title':'Queue & Deque',                            'stage':2,'stage_name':'Competitive Programming',
         'desc':'FIFO queue for BFS. Deque for sliding window max.',
         'topics':['queue','deque','front','back','BFS','FIFO'],'time_min':60,'time_max':90},
    31: {'title':'Linked Lists',                             'stage':2,'stage_name':'Competitive Programming',
         'desc':'Node structure, traversal, insertion, deletion, cycle detection.',
         'topics':['node','next pointer','insert','delete','Floyd cycle'],'time_min':60,'time_max':90},
    32: {'title':'Recursion & Backtracking',                 'stage':2,'stage_name':'Competitive Programming',
         'desc':'Generate all subsets, permutations. N-Queens, Sudoku solver.',
         'topics':['choose','explore','unchoose','subset','permutation','N-Queens'],'time_min':75,'time_max':120},
    33: {'title':'Greedy Algorithms',                        'stage':2,'stage_name':'Competitive Programming',
         'desc':'Local optimal → global optimum. Activity selection, coin change.',
         'topics':['greedy choice','exchange argument','activity selection','fractional knapsack'],'time_min':75,'time_max':120},
    34: {'title':'Interval Problems',                        'stage':2,'stage_name':'Competitive Programming',
         'desc':'Sort by end time. Merge overlapping intervals, meeting rooms.',
         'topics':['sort by end','merge intervals','overlap','meeting rooms'],'time_min':60,'time_max':90},
    35: {'title':'Bit Manipulation',                         'stage':2,'stage_name':'Competitive Programming',
         'desc':'AND, OR, XOR, shifts. Check/set/clear bits. Power of 2 check.',
         'topics':['&','|','^','<<','>>','popcount','bitmask'],'time_min':60,'time_max':90},
    36: {'title':'Math for CP',                              'stage':2,'stage_name':'Competitive Programming',
         'desc':'GCD, LCM, prime sieve, modular arithmetic, fast exponentiation.',
         'topics':['GCD','LCM','sieve of eratosthenes','mod','fast power','modular inverse'],'time_min':75,'time_max':120},
    37: {'title':'Trees',                                    'stage':2,'stage_name':'Competitive Programming',
         'desc':'Binary tree traversals: inorder, preorder, postorder, level-order. Height, diameter.',
         'topics':['inorder','preorder','postorder','BFS level-order','height','diameter'],'time_min':75,'time_max':120},
    38: {'title':'Binary Search Trees',                      'stage':2,'stage_name':'Competitive Programming',
         'desc':'BST property: left < root < right. Search, insert, delete. Balanced trees.',
         'topics':['BST property','search','insert','delete','AVL','balanced'],'time_min':75,'time_max':120},
    39: {'title':'Graph Representation',                     'stage':2,'stage_name':'Competitive Programming',
         'desc':'Adjacency list vs matrix. Weighted/unweighted graphs. Build from edge list.',
         'topics':['adjacency list','adjacency matrix','edge list','weighted','directed'],'time_min':60,'time_max':90},
    40: {'title':'Breadth-First Search (BFS)',               'stage':2,'stage_name':'Competitive Programming',
         'desc':'BFS with a queue. Shortest path in unweighted graphs. Level traversal.',
         'topics':['BFS','queue','visited','shortest path','unweighted','level'],'time_min':75,'time_max':120},
    41: {'title':'Depth-First Search (DFS)',                 'stage':2,'stage_name':'Competitive Programming',
         'desc':'DFS recursively or with stack. Components, cycle detection, topological sort.',
         'topics':['DFS','recursion','stack','component','cycle','topological sort','Kahn'],'time_min':75,'time_max':120},
    42: {'title':'Dynamic Programming Foundations',          'stage':2,'stage_name':'Competitive Programming',
         'desc':'Overlapping subproblems + optimal substructure. State, transition, base case.',
         'topics':['DP','memoization','tabulation','state','transition','base case'],'time_min':90,'time_max':150},
    43: {'title':'1D Dynamic Programming',                   'stage':2,'stage_name':'Competitive Programming',
         'desc':'Fibonacci, climbing stairs, coin change, house robber, LIS.',
         'topics':['fibonacci','stair climbing','coin change','house robber','LIS'],'time_min':90,'time_max':150},
    44: {'title':'2D / Grid DP',                             'stage':2,'stage_name':'Competitive Programming',
         'desc':'Grid path counting, minimum path sum, knapsack, LCS.',
         'topics':['grid DP','path count','min path','0-1 knapsack','LCS'],'time_min':90,'time_max':150},
    45: {'title':'CP Mini-Contest',                          'stage':2,'stage_name':'Competitive Programming',
         'desc':'Timed practice: 4–5 problems in 2 hours. Upsolve and analyse afterward.',
         'topics':['Codeforces','CSES','timed','upsolve','strategy','time management'],'time_min':120,'time_max':180},

    # Stage 3
    46: {'title':'Web Fundamentals',                         'stage':3,'stage_name':'Web Development',
         'desc':'How browsers work, HTTP/HTTPS, client-server, DNS, request-response cycle.',
         'topics':['HTTP','HTTPS','DNS','request','response','status codes','browser rendering'],'time_min':60,'time_max':90},
    47: {'title':'HTML Structure',                           'stage':3,'stage_name':'Web Development',
         'desc':'Semantic HTML5: header, nav, main, section, article, footer. One h1 per page.',
         'topics':['semantic HTML','heading hierarchy','section','article','accessibility'],'time_min':60,'time_max':90},
    48: {'title':'HTML Forms & Accessibility',               'stage':3,'stage_name':'Web Development',
         'desc':'Input types, labels, validation attributes. ARIA, keyboard navigation.',
         'topics':['form','input','label','required','aria-label','tab order'],'time_min':60,'time_max':90},
    49: {'title':'CSS Fundamentals',                         'stage':3,'stage_name':'Web Development',
         'desc':'Selectors, box model, colors, typography, CSS variables, specificity.',
         'topics':['selector','box model','margin','padding','border','CSS variables','specificity'],'time_min':75,'time_max':120},
    50: {'title':'Flexbox',                                  'stage':3,'stage_name':'Web Development',
         'desc':'display:flex, justify-content, align-items, gap, flex-wrap. Navbar and cards.',
         'topics':['display:flex','justify-content','align-items','flex-wrap','gap'],'time_min':60,'time_max':90},
    51: {'title':'CSS Grid',                                 'stage':3,'stage_name':'Web Development',
         'desc':'grid-template-columns, auto-fit, minmax, named areas. Page layouts.',
         'topics':['display:grid','grid-template-columns','auto-fit','minmax','grid-area'],'time_min':60,'time_max':90},
    52: {'title':'Responsive Design',                        'stage':3,'stage_name':'Web Development',
         'desc':'Mobile-first, media queries, clamp(). Test on multiple screen sizes.',
         'topics':['mobile-first','@media','min-width','clamp','viewport','responsive'],'time_min':60,'time_max':90},
    53: {'title':'JavaScript Fundamentals',                  'stage':3,'stage_name':'Web Development',
         'desc':'let/const, functions, arrow functions, arrays, objects, destructuring.',
         'topics':['let','const','arrow function','array methods','object','destructuring','spread'],'time_min':90,'time_max':120},
    54: {'title':'DOM Manipulation',                         'stage':3,'stage_name':'Web Development',
         'desc':'querySelector, textContent, innerHTML, createElement, classList.',
         'topics':['querySelector','getElementById','innerHTML','createElement','appendChild','classList'],'time_min':75,'time_max':120},
    55: {'title':'Events & Interactive UI',                  'stage':3,'stage_name':'Web Development',
         'desc':'addEventListener, event.preventDefault, form submission, event delegation.',
         'topics':['addEventListener','click','submit','keydown','event.preventDefault','delegation'],'time_min':75,'time_max':120},
    56: {'title':'Async JavaScript',                         'stage':3,'stage_name':'Web Development',
         'desc':'Promises, async/await, Promise.all. Avoid callback hell.',
         'topics':['Promise','async','await','then','catch','Promise.all','async/await'],'time_min':75,'time_max':120},
    57: {'title':'APIs & JSON',                              'stage':3,'stage_name':'Web Development',
         'desc':'Consume public REST APIs with fetch. Parse JSON and display data dynamically.',
         'topics':['fetch','JSON','REST API','endpoint','async/await','error handling'],'time_min':75,'time_max':120},
    58: {'title':'Git for Web Projects',                     'stage':3,'stage_name':'Web Development',
         'desc':'Feature branches, clean commits, pull requests for web project workflow.',
         'topics':['git branch','pull request','commit message','merge','conflict'],'time_min':45,'time_max':75},
    59: {'title':'Frontend Architecture',                    'stage':3,'stage_name':'Web Development',
         'desc':'Component thinking, modules, folder structure for larger projects.',
         'topics':['component','module','ES modules','import/export','separation of concerns'],'time_min':60,'time_max':90},
    60: {'title':'Backend with Node.js & Express',           'stage':3,'stage_name':'Web Development',
         'desc':'Routes, middleware, request/response. Build a REST API.',
         'topics':['Node.js','Express','app.get','app.post','middleware','res.json','req.body'],'time_min':90,'time_max':150},
    61: {'title':'Databases',                                'stage':3,'stage_name':'Web Development',
         'desc':'SQL: CREATE, SELECT, INSERT, UPDATE, DELETE, WHERE, JOIN. MongoDB intro.',
         'topics':['SQL','SQLite','PostgreSQL','MongoDB','SELECT','JOIN','schema'],'time_min':90,'time_max':150},
    62: {'title':'Authentication',                           'stage':3,'stage_name':'Web Development',
         'desc':'bcrypt, JWT tokens, auth middleware, sessions. Never store plain passwords.',
         'topics':['bcrypt','JWT','token','session','auth middleware','protected route'],'time_min':90,'time_max':150},
    63: {'title':'Testing & Debugging Web',                  'stage':3,'stage_name':'Web Development',
         'desc':'Browser DevTools, console, network tab, Jest unit tests.',
         'topics':['DevTools','console.log','network tab','Jest','unit test','breakpoint'],'time_min':60,'time_max':90},
    64: {'title':'Deployment',                               'stage':3,'stage_name':'Web Development',
         'desc':'Deploy to Vercel/Netlify (frontend), Render/Railway (backend). .env variables.',
         'topics':['Vercel','Netlify','Render','Railway','.env','HTTPS','CI/CD'],'time_min':60,'time_max':120},
    65: {'title':'Web Mini-Project',                         'stage':3,'stage_name':'Web Development',
         'desc':'Build and deploy a full functional web app. README with screenshots and live URL.',
         'topics':['full-stack','deploy','README','demo link','MVP','project'],'time_min':180,'time_max':360},

    # Stage 4
    66: {'title':'AI/ML Overview',                           'stage':4,'stage_name':'AI & ML',
         'desc':'Supervised vs unsupervised vs reinforcement learning. Real-world use cases.',
         'topics':['supervised','unsupervised','reinforcement','classification','regression','clustering'],'time_min':60,'time_max':90},
    67: {'title':'Python for Data — NumPy',                  'stage':4,'stage_name':'AI & ML',
         'desc':'Arrays, vectorized math, reshape, broadcasting, random. Foundation of data science.',
         'topics':['numpy','ndarray','shape','reshape','broadcasting','vectorize','random'],'time_min':60,'time_max':90},
    68: {'title':'Pandas DataFrames',                        'stage':4,'stage_name':'AI & ML',
         'desc':'read_csv, head, describe, filter, groupby, merge. Explore tabular data.',
         'topics':['pandas','DataFrame','read_csv','filter','groupby','apply','merge','concat'],'time_min':75,'time_max':120},
    69: {'title':'Data Cleaning',                            'stage':4,'stage_name':'AI & ML',
         'desc':'Handle missing values, remove duplicates, fix types, detect outliers.',
         'topics':['fillna','dropna','duplicates','dtype','outlier','IQR','z-score'],'time_min':75,'time_max':120},
    70: {'title':'Exploratory Data Analysis',                'stage':4,'stage_name':'AI & ML',
         'desc':'Understand distributions, correlations, patterns before modeling.',
         'topics':['EDA','distribution','correlation','describe','value_counts','histogram'],'time_min':75,'time_max':120},
    71: {'title':'Data Visualization',                       'stage':4,'stage_name':'AI & ML',
         'desc':'matplotlib, seaborn: histograms, scatter, box plots, heatmaps.',
         'topics':['matplotlib','seaborn','plt.plot','sns.heatmap','scatter','histogram','box plot'],'time_min':75,'time_max':120},
    72: {'title':'Statistics for ML',                        'stage':4,'stage_name':'AI & ML',
         'desc':'Mean, median, mode, variance, std, IQR, z-score, correlation.',
         'topics':['mean','median','mode','variance','std','IQR','z-score','Pearson correlation'],'time_min':75,'time_max':120},
    73: {'title':'Probability Basics',                       'stage':4,'stage_name':'AI & ML',
         'desc':'Probability, conditional probability, Bayes theorem, distributions.',
         'topics':['probability','P(A)','conditional','Bayes','normal distribution','binomial'],'time_min':75,'time_max':120},
    74: {'title':'Train / Val / Test Split',                 'stage':4,'stage_name':'AI & ML',
         'desc':'70/15/15 split. Avoid data leakage. Fit only on training data.',
         'topics':['train_test_split','validation','test set','data leakage','stratify','sklearn'],'time_min':60,'time_max':90},
    75: {'title':'Linear Regression',                        'stage':4,'stage_name':'AI & ML',
         'desc':'Predict continuous values. MSE, RMSE, R². Understand coefficients.',
         'topics':['LinearRegression','MSE','RMSE','R²','fit','predict','coefficients','intercept'],'time_min':75,'time_max':120},
    76: {'title':'Logistic Regression',                      'stage':4,'stage_name':'AI & ML',
         'desc':'Binary classification. Sigmoid, decision boundary, probability output.',
         'topics':['LogisticRegression','sigmoid','classification','decision boundary','probability'],'time_min':75,'time_max':120},
    77: {'title':'Classification Metrics',                   'stage':4,'stage_name':'AI & ML',
         'desc':'Accuracy, Precision, Recall, F1, ROC-AUC, confusion matrix.',
         'topics':['accuracy','precision','recall','F1 score','ROC','AUC','confusion matrix','classification_report'],'time_min':75,'time_max':120},
    78: {'title':'Trees & Ensemble Methods',                 'stage':4,'stage_name':'AI & ML',
         'desc':'Decision Tree, Random Forest, Gradient Boosting. Feature importance.',
         'topics':['DecisionTreeClassifier','RandomForestClassifier','GradientBoosting','XGBoost','feature importance'],'time_min':90,'time_max':150},
    79: {'title':'Feature Engineering',                      'stage':4,'stage_name':'AI & ML',
         'desc':'Encoding, scaling, creating new features. Never fit scaler on test set.',
         'topics':['one-hot encoding','label encoding','StandardScaler','MinMaxScaler','pipeline','feature creation'],'time_min':75,'time_max':120},
    80: {'title':'Model Comparison & Selection',             'stage':4,'stage_name':'AI & ML',
         'desc':'Cross-validation, baseline models, learning curves. Choose wisely.',
         'topics':['cross_val_score','GridSearchCV','learning curve','bias','variance','model selection'],'time_min':75,'time_max':120},
    81: {'title':'Neural Networks Introduction',             'stage':4,'stage_name':'AI & ML',
         'desc':'Neurons, layers, activations, loss, optimizer, epochs, dropout.',
         'topics':['neural network','keras','tensorflow','ReLU','sigmoid','Adam','epoch','dropout','Dense'],'time_min':90,'time_max':150},
    82: {'title':'ML Mini-Project',                          'stage':4,'stage_name':'AI & ML',
         'desc':'Full pipeline: dataset → EDA → preprocess → model → evaluate → report.',
         'topics':['end-to-end','pipeline','report','kaggle','dataset','evaluate','visualize'],'time_min':180,'time_max':360},

    # Stage 5
    83: {'title':'App Development Overview',                 'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Choose stack: React Native, Flutter, or PWA. Platform considerations.',
         'topics':['React Native','Flutter','PWA','Expo','Android','iOS','cross-platform'],'time_min':60,'time_max':90},
    84: {'title':'Project Setup & Scaffolding',              'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Create app shell, folder structure, Git repo, README skeleton.',
         'topics':['project setup','folder structure','git init','README','package.json'],'time_min':60,'time_max':90},
    85: {'title':'UI Fundamentals',                          'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Screens, components, layouts. Build 2–3 screens of your app.',
         'topics':['View','Text','StyleSheet','component','screen','layout','Flexbox'],'time_min':75,'time_max':120},
    86: {'title':'State Management',                         'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Local state, lifted state, useState/setState. Data flow between components.',
         'topics':['useState','setState','props','lifting state','Redux','Context API'],'time_min':75,'time_max':120},
    87: {'title':'Navigation',                               'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Multi-screen navigation: stack, tab, drawer. Pass params between screens.',
         'topics':['React Navigation','Stack','Tab','Drawer','params','navigate'],'time_min':75,'time_max':120},
    88: {'title':'API Integration',                          'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Fetch from backend or public API. Handle loading, data, and error states.',
         'topics':['fetch','axios','loading state','error state','useEffect','async'],'time_min':75,'time_max':120},
    89: {'title':'Forms & Validation',                       'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Controlled inputs, validation, error messages. Robust user input handling.',
         'topics':['TextInput','controlled','validation','error message','Formik','yup'],'time_min':60,'time_max':90},
    90: {'title':'Local Storage',                            'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'AsyncStorage / SharedPreferences / localStorage to persist simple data.',
         'topics':['AsyncStorage','localStorage','persist','cache','session'],'time_min':60,'time_max':90},
    91: {'title':'Authentication in Apps',                   'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Secure login flow, token storage, protected screens, biometrics concept.',
         'topics':['login','token','secure storage','protected route','biometrics','JWT'],'time_min':90,'time_max':150},
    92: {'title':'Testing & Debugging Apps',                 'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Device testing, emulator, debugging tools, manual test cases.',
         'topics':['emulator','device','React DevTools','Flipper','manual test','crash log'],'time_min':60,'time_max':90},
    93: {'title':'Final Project Proposal',                   'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Define problem, target users, MVP features, tech stack. Plan before coding.',
         'topics':['problem statement','target users','MVP','tech stack','wireframe','proposal'],'time_min':60,'time_max':120},
    94: {'title':'Architecture & Milestones',                'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Plan architecture, divide into milestones, estimate effort for each feature.',
         'topics':['architecture','milestone','feature list','Gantt','estimate','design'],'time_min':60,'time_max':90},
    95: {'title':'Core Feature Implementation',              'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Build the most critical MVP features first.',
         'topics':['MVP','build','implement','core','commit','daily progress'],'time_min':120,'time_max':240},
    96: {'title':'Integration & Edge Cases',                 'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Connect all parts. Handle edge cases, empty states, error flows.',
         'topics':['integrate','edge case','empty state','error handling','connect','robust'],'time_min':120,'time_max':240},
    97: {'title':'Testing, Cleanup & Code Review',           'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Fix bugs, improve UX, accessibility, performance. Code review.',
         'topics':['bug fix','UX','accessibility','performance','code review','refactor'],'time_min':90,'time_max':180},
    98: {'title':'README & Demo Preparation',                'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Write README with screenshots, demo video, deploy link. Polish presentation.',
         'topics':['README','screenshot','demo video','deploy link','presentation','submit'],'time_min':90,'time_max':180},
    99: {'title':'Final Demo & Reflection',                  'stage':5,'stage_name':'App Dev + Final Project',
         'desc':'Present your project! Reflect on the 99-day journey. Plan next 90 days.',
         'topics':['final demo','present','reflect','celebrate','next steps','portfolio'],'time_min':60,'time_max':120},
}


# ── RESPONSE GENERATOR ──────────────────────────────────────────

def format_day_lesson(day: int) -> str:
    d = ROADMAP.get(day)
    if not d:
        return f'Day {day} is out of range. The journey covers Days 1–99.'

    topics_list = '\n'.join(f'  - {t}' for t in d['topics'])
    return textwrap.dedent(f"""
# DAY {day} / 99 — {d['title'].upper()}

**Stage {d['stage']}: {d['stage_name']}**

## 🎯 Goal
{d['desc']}

## 📚 Topics to Study
{topics_list}

## 💻 Practice Task
Build a program that demonstrates today's concept. Start with the simplest
version that works, then add complexity step by step.

## ⚡ Challenge
After the basic task: add one harder feature, optimize time complexity,
or solve an additional problem on Codeforces / LeetCode related to today's topic.

## 📦 Deliverable
Working code committed to GitHub with a short comment explaining what it does.

## ⏱️ Suggested Time
{d['time_min']}–{d['time_max']} minutes

## ✅ Completion Checklist
- [ ] Understood the core concept
- [ ] Completed the practice task
- [ ] Attempted the challenge
- [ ] Committed to GitHub (or saved work)
- [ ] Wrote a one-line reflection

---
*Paste your code here for review, or type `challenge` for a deeper problem.*
    """).strip()


def normalize_query(query: str) -> str:
    """Normalize text for more reliable retrieval."""
    q = query.lower().strip()
    q = re.sub(r'[`*_~#\-]+', ' ', q)
    q = re.sub(r'\s+', ' ', q)
    return q.strip()


def extract_keywords(query: str):
    """Return meaningful tokens for chunk relevance checks."""
    q = normalize_query(query)
    tokens = re.findall(r'[a-z0-9]+', q)
    tokens = [t for t in tokens if len(t) > 2 and t not in STOPWORDS]
    return tokens


def score_chunk_relevance(query: str, chunk_text: str, sim_score: float) -> float:
    """Combine semantic similarity with keyword overlap for better filtering."""
    keywords = set(extract_keywords(query))
    if not keywords:
        return sim_score

    chunk_text_norm = normalize_query(chunk_text)
    overlap = 0
    for kw in keywords:
        if kw in chunk_text_norm:
            overlap += 1
    overlap_bonus = min(overlap / max(len(keywords), 1), 0.35)
    return sim_score + overlap_bonus


def rank_relevant_chunks(query: str, chunks: list) -> list:
    """Sort chunks by relevance and filter out weak matches."""
    scored = []
    for chunk in chunks:
        text = chunk.get('text', '')
        sim = float(chunk.get('score', 0.0))
        combined = score_chunk_relevance(query, text, sim)
        if combined >= MIN_SCORE * 0.85:
            scored.append({**chunk, 'combined_score': round(combined, 4)})
    scored.sort(key=lambda c: c['combined_score'], reverse=True)
    return scored


def get_common_topic_answer(query: str) -> str | None:
    """Return a short accurate answer for common beginner topics when retrieval is weak."""
    q = normalize_query(query)
    if 'binary search' in q or 'bin search' in q:
        return textwrap.dedent("""
**Binary Search**
- Works only on sorted data.
- Repeatedly split the search range in half.
- Compare the target with the middle value.
- If middle is too small, move right; if too large, move left.
- Time complexity: **O(log n)**, space: **O(1)** (iterative).

Use it when the array is sorted and you need fast lookup.
        """).strip()

    if 'recursion' in q or 'recursive' in q:
        return textwrap.dedent("""
**Recursion**
A function calls itself to solve a smaller version of the same problem.
Every recursive function needs:
- a base case to stop
- a smaller subproblem each call

Examples: factorial, Fibonacci, DFS, merge sort.

Common mistake: forgetting the base case -> infinite recursion.
        """).strip()

    if 'time complexity' in q or 'big o' in q or 'complexity' in q:
        return textwrap.dedent("""
**Time Complexity**
Big-O tells how runtime grows as input size grows.
Examples:
- **O(1)**: constant time
- **O(log n)**: binary search
- **O(n)**: linear scan
- **O(n log n)**: merge sort, heap sort
- **O(n²)**: nested loops

Choose the algorithm based on constraints and expected input size.
        """).strip()

    if 'git' in q or 'github' in q:
        return textwrap.dedent("""
**Git / GitHub basics**
- `git init` → create a repo
- `git add .` → stage files
- `git commit -m "msg"` → save a version
- `git branch` → see branches
- `git checkout -b name` → create/switch branch
- `git push origin main` → upload to GitHub
- `git pull` → sync changes

A good workflow is: commit often, push regularly, and use branches for features.
        """).strip()

    if 'array' in q or 'list' in q:
        return textwrap.dedent("""
**Arrays / Lists**
An array stores multiple values in one structure.
Typical operations:
- access by index
- iterate over elements
- find min/max
- sum values
- search linearly

Common beginner mistakes:
- using index out of range
- forgetting 0-based indexing
- comparing `<= n` when you should use `< n`
        """).strip()

    return None


def detect_intent(query: str) -> dict:
    """Detect user intent from raw query text."""
    q = normalize_query(query)
    intent = {'type': 'search', 'day': None, 'cmd': None}

    # Day intent
    m = re.search(r'\b(?:day|দিন)\s*(\d+)\b', q)
    if m:
        intent['type'] = 'day'
        intent['day'] = int(m.group(1))
        return intent
    if re.match(r'^\d{1,2}$', q):
        intent['type'] = 'day'
        intent['day'] = int(q)
        return intent

    # Command intents
    cmd_map = {
        'start':     ['start', 'begin', 'lets go', 'let\'s go', 'শুরু'],
        'today':     ['today', 'আজ', 'current day', 'current lesson', 'give me today'],
        'next':      ['next day', 'next lesson', 'পরের'],
        'progress':  ['progress', 'my progress', 'how am i', 'প্রগ্রেস'],
        'roadmap':   ['roadmap', 'রোডম্যাপ', 'all days', 'overview', 'plan', 'schedule'],
        'challenge': ['challenge', 'চ্যালেঞ্জ', 'harder', 'extra', 'bonus'],
        'debug':     ['debug', 'bug', 'error', 'not working', 'wrong answer', 'wa', 'tle', 'mle', 'runtime error'],
        'review':    ['review', 'check my code', 'look at my code', 'রিভিউ'],
        'help':      ['help', 'commands', 'what can you', 'সাহায্য'],
        'project':   ['project idea', 'project ideas', 'what should i build', 'what can i build', 'আইডিয়া'],
        'certificate':['certificate', 'cert', 'crest', 'eligible', 'completion'],
    }
    for cmd, keywords in cmd_map.items():
        if any(kw in q for kw in keywords):
            intent['type'] = cmd
            intent['cmd'] = cmd
            return intent

    # Code detection
    if any(x in q for x in ['```', 'int main', 'def ', 'function ', 'class ', 'cout', 'print(', '#include']):
        intent['type'] = 'review'
        return intent

    return intent


def build_response(query: str, chunks: list, context: dict) -> str:
    """
    Build a mentor response grounded in retrieved chunks.
    context = { currentDay, track, memberName }
    """
    intent = detect_intent(query)
    name   = context.get('memberName', 'friend').split()[0]
    day    = context.get('currentDay', 1)
    track  = context.get('track', 'explore')

    # ── Day lesson ──
    if intent['type'] == 'day':
        n = intent['day']
        if 1 <= n <= 99:
            return format_day_lesson(n)
        return f'Day {n} is out of range. Choose a day between 1 and 99.'

    # ── Today ──
    if intent['type'] == 'today':
        return format_day_lesson(day)

    # ── Start ──
    if intent['type'] == 'start':
        return textwrap.dedent(f"""
Welcome to DIU CPC's 99 Days of Coding! 🚀

*"For the next 99 days, we're building consistency, problem-solving ability, and real projects."*

**Your tracks:**
1. ⚔️ **Competitive Programming** — ICPC prep, algorithms, contests
2. 🌐 **Web Development** — HTML → CSS → JS → full-stack apps
3. 🤖 **AI & Machine Learning** — Python, data, models, projects
4. 📱 **App Development** — Mobile/web apps from scratch
5. 🔭 **Explore Everything** — Sample all tracks

Type **day 1** to begin — or tell me which track interests you most!
        """).strip()

    # ── Roadmap ──
    if intent['type'] == 'roadmap':
        lines = ['**🗺️ 99-Day Roadmap Overview**\n']
        stages = {1:'🏗️ Foundations (Days 1–20)',2:'⚔️ Competitive Programming (Days 21–45)',
                  3:'🌐 Web Development (Days 46–65)',4:'🤖 AI & ML (Days 66–82)',5:'📱 App Dev + Final Project (Days 83–99)'}
        cur_stage = 0
        for n, d in ROADMAP.items():
            if d['stage'] != cur_stage:
                cur_stage = d['stage']
                lines.append(f'\n**{stages[cur_stage]}**')
            done = '✓' if n < day else ('→' if n == day else '·')
            lines.append(f'  `{done}` Day {n:02d}: {d["title"]}')
        return '\n'.join(lines)

    # ── Help ──
    if intent['type'] == 'help':
        return textwrap.dedent("""
**🛠️ Mentor Commands**

| Command | What it does |
|---------|-------------|
| `day 1` … `day 99` | Get any day's full lesson |
| `today` | Today's lesson |
| `next` | Next day |
| `start` | Onboarding overview |
| `challenge` | Coding challenge |
| `review` | Code review (paste code) |
| `debug` | Debugging help |
| `roadmap` | Full 99-day plan |
| `progress` | Your stats |
| `project ideas` | Project suggestions |
| `help` | This menu |

**Or just ask anything!** I'm grounded in all the DIU CPC knowledge files.
        """).strip()

    # ── Challenge ──
    if intent['type'] == 'challenge':
        d = ROADMAP.get(day, ROADMAP[1])
        challenges = {
            1: ('Two Sum', 'Given an array and target K, find two numbers summing to K.', 'HashMap for O(N)'),
            2: ('Maximum Subarray', 'Find contiguous subarray with largest sum (Kadane\'s).', 'Track current and max sum.'),
            3: ('Valid Parentheses', 'String of ()[]{}— check if properly closed.', 'Use a stack.'),
            4: ('Binary Search', 'Implement binary search from scratch.', 'lo=0, hi=n-1, mid=(lo+hi)//2'),
            5: ('Coin Change', 'Min coins to make amount (DP).', 'dp[i] = min(dp[i-coin]+1) for each coin'),
        }
        sel = challenges[(day % 5) + 1]
        return textwrap.dedent(f"""
**⚡ Challenge — Day {day}: {d["title"]}**

### Problem: {sel[0]}

**Task:** {sel[1]}

**Hint 💡:** {sel[2]}

**Requirements:**
- [ ] Brute force solution first
- [ ] Analyse time & space complexity
- [ ] Test with edge cases (empty, single, duplicates, negatives)
- [ ] Optimize if brute force is too slow

Paste your solution for review!
        """).strip()

    # ── Certificate ──
    if intent['type'] == 'certificate':
        return textwrap.dedent("""
**🏅 Certificate / Crest Eligibility**

Suggested completion baseline:
- ✅ **80+ meaningful days** completed
- ✅ **Required track deliverables** submitted
- ✅ **Final project** submitted (Days 93–99)
- ✅ **Final review** by the DIU CPC team

> ⚠️ This mentor **cannot** issue an official certificate.
> Official eligibility is determined exclusively by **DIU CPC**.
> Contact: **diucsecpc.official@gmail.com**
        """).strip()

    # ── Project ideas ──
    if intent['type'] == 'project':
        return textwrap.dedent("""
**💡 Project Ideas by Track**

**⚔️ Competitive Programming**
- Contest Progress Tracker
- Problem Recommendation Dashboard
- CP Rating Visualizer
- Algorithm Practice Planner

**🌐 Web Development**
- Student Resource Hub
- Club Event Portal
- Portfolio Builder
- Campus Lost & Found
- Study Planner

**🤖 AI & Machine Learning**
- Student Performance Predictor
- Spam/Message Classifier
- Simple Recommendation System
- House Price Prediction Demo
- EDA Dashboard

**📱 App Development**
- Habit Tracker
- Study Timer
- Campus Event App
- Notes App
- Coding Streak Tracker

**🏗️ Beginner / Foundations**
- Student Grade Calculator
- Expense Tracker CLI
- Quiz App
- To-Do List
- Unit Converter

> Rule: Start with an **MVP**. Build a small complete product before adding features.
        """).strip()

    # ── Debug ──
    if intent['type'] == 'debug':
        has_code = any(x in query for x in ['```', '\n', '{', '}', '()', 'cout', 'print'])
        if len(query) > 80 and has_code:
            return build_review_response(query)
        return textwrap.dedent("""
**🐛 Debug Checklist**

**1. Reproduce**
- What exact input causes the error?
- Expected vs actual output?

**2. Isolate**
- Add `print` / `cout` inside the loop or function
- Comment sections out until bug disappears

**3. Common culprits**
- 🔢 Off-by-one: `< n` vs `<= n`
- 💥 Integer overflow: use `long long` for large values
- 📭 Empty input: n = 0?
- 🔄 Infinite loop: does the condition ever become false?
- 🗂️ Index out of bounds: array size correct?
- 🚫 Uninitialized variable

Paste your code and I'll pinpoint it! 👇
        """).strip()

    # ── Code review ──
    if intent['type'] == 'review':
        return build_review_response(query)

    # ── Semantic search from ChromaDB results ──
    ranked_chunks = rank_relevant_chunks(query, chunks)
    common_answer = get_common_topic_answer(query)
    if ranked_chunks:
        best_score = ranked_chunks[0].get('combined_score', ranked_chunks[0].get('score', 0.0))
        if best_score < MIN_SCORE:
            if common_answer:
                return common_answer
            return textwrap.dedent(f"""
I don't have enough confident information on this topic.

Please call or message Mehedi vaiya, President DIU CPC. He will guide you with this.
            """).strip()

        seen = set()
        unique_chunks = []
        for c in ranked_chunks:
            h = c['text'][:120]
            if h not in seen:
                seen.add(h)
                unique_chunks.append(c)

        parts = [f"**Answering from the DIU CPC knowledge base:**\n"]

        for i, c in enumerate(unique_chunks[:3], 1):
            src  = c['metadata'].get('source', '')
            head = c['metadata'].get('heading', '')
            src_label = src.replace('.md','').replace('_',' ').strip()
            snippet = c['text'].strip()
            snippet = re.sub(r'\s+', ' ', snippet)
            if len(snippet) > 300:
                snippet = snippet[:300].rstrip() + '...'
            parts.append(f"**{i}. {head or src_label}**\n{snippet}")

        day_chunks = [c for c in unique_chunks if 'day' in c['text'].lower() and re.search(r'\bday \d+\b', c['text'].lower())]
        if day_chunks:
            day_match = re.search(r'\bday (\d+)\b', day_chunks[0]['text'].lower())
            if day_match:
                ref_day = int(day_match.group(1))
                if 1 <= ref_day <= 99:
                    parts.append(f"\n💡 Relevant lesson: type **`day {ref_day}`** for the full lesson on this topic.")

        parts.append('\n---\n*Ask a follow-up or paste code for review!*')
        return '\n\n'.join(parts)

    # ── Fallback ──
    if common_answer:
        return common_answer

    return textwrap.dedent(f"""
I don't have enough confident information on this topic.

Please call or message Mehedi vaiya, President DIU CPC. He will guide you with this.
    """).strip()


def build_review_response(code_text: str) -> str:
    """Heuristic code review."""
    issues = []
    good   = []

    if 'endl' in code_text:
        issues.append('⚠️ Use `"\\n"` instead of `endl` — it avoids buffer flush overhead.')
    if re.search(r'int\s+main', code_text) and '#include' not in code_text:
        issues.append('⚠️ Missing `#include` at the top of the file.')
    if re.search(r'i\s*<=\s*\w+\.length', code_text):
        issues.append('⚠️ Possible off-by-one: `<= length` should usually be `< length`.')
    if 'void main' in code_text:
        issues.append('⚠️ `void main()` is non-standard. Use `int main() { return 0; }`.')
    if re.search(r'\bint\b.{0,30}\b[1-9]\d{8,}\b', code_text):
        issues.append('⚠️ Large number stored in `int` may overflow. Use `long long`.')
    if re.search(r'for\s*\(.*i\s*=\s*0.*i\s*<=\s*n\b', code_text):
        issues.append('⚠️ `i <= n` goes one past the end for 0-indexed arrays. Use `i < n`.')

    if re.search(r'(\/\/|#\s+)', code_text): good.append('✅ Code has comments.')
    if re.search(r'(def |function |int \w+\s*\()', code_text): good.append('✅ Code uses functions — good structure.')
    if 'const ' in code_text or 'final ' in code_text: good.append('✅ Uses constants for clarity.')

    response = '**💻 Code Review**\n\n'
    if good: response += '\n'.join(good) + '\n\n'
    if issues:
        response += '**Issues Found:**\n' + '\n'.join(issues) + '\n\n'
    else:
        response += '✅ No obvious structural issues found.\n\n'

    response += textwrap.dedent("""
**General checklist:**
- Test edge cases: empty input, n=0, n=1, negatives, duplicates
- Check time complexity against problem constraints
- Can you explain every line? If yes, you understand it.

🚀 Challenge: Refactor one function to be more readable or efficient.
    """).strip()
    return response


# ── FLASK ROUTES ────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    try:
        count = collection.count()
        return jsonify({'status': 'ok', 'chunks': count, 'model': MODEL_NAME, 'collection': COLLECTION})
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500


@app.route('/api/day/<int:day_num>', methods=['GET'])
def get_day(day_num):
    d = ROADMAP.get(day_num)
    if not d:
        return jsonify({'error': f'Day {day_num} not found'}), 404
    return jsonify({'day': day_num, 'lesson': d, 'formatted': format_day_lesson(day_num)})


@app.route('/api/roadmap', methods=['GET'])
def get_roadmap():
    return jsonify({'stages': 5, 'days': ROADMAP})


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({'error': 'JSON body is required'}), 400

    query = data.get('query')
    if not isinstance(query, str):
        return jsonify({'error': 'query must be a string'}), 400

    query = query.strip()
    if not query:
        return jsonify({'error': 'query is required'}), 400
    if len(query) > MAX_QUERY_LENGTH:
        return jsonify({'error': f'query must be at most {MAX_QUERY_LENGTH} characters'}), 400

    context = data.get('context', {})
    if not isinstance(context, dict):
        return jsonify({'error': 'context must be an object'}), 400

    if model is None or collection is None:
        return jsonify({'error': 'Knowledge model is not ready. Please try again later.'}), 503

    # Semantic retrieval from ChromaDB
    chunks = []
    try:
        query_vec = model.encode([query]).tolist()
        results   = collection.query(
            query_embeddings=query_vec,
            n_results=TOP_K,
            include=['documents', 'metadatas', 'distances'],
        )
        docs      = results['documents'][0]
        metas     = results['metadatas'][0]
        distances = results['distances'][0]

        for doc, meta, dist in zip(docs, metas, distances):
            similarity = 1 - dist          # cosine: distance → similarity
            if similarity >= MIN_SCORE:
                chunks.append({'text': doc, 'metadata': meta, 'score': round(similarity, 4)})

    except Exception as e:
        logging.exception('ChromaDB retrieval error')
        return jsonify({'error': 'Knowledge retrieval failed. Please try again later.'}), 503

    # Generate grounded response
    relevant_chunks = rank_relevant_chunks(query, chunks)
    reply   = build_response(query, relevant_chunks, context)
    sources = [{'source': c['metadata'].get('source',''), 'heading': c['metadata'].get('heading',''), 'score': c.get('combined_score', c.get('score', 0.0))} for c in relevant_chunks]

    return jsonify({'reply': reply, 'sources': sources, 'chunks_used': len(relevant_chunks)})


# ── STARTUP ─────────────────────────────────────────────────────

def load_models():
    global model, collection

    print(f'[Startup] Loading MiniLM model: {MODEL_NAME}')
    model = SentenceTransformer(MODEL_NAME)
    print('[Startup] ✓ Model loaded')

    if not os.path.exists(CHROMA_DIR):
        print('[Startup] ⚠  No ChromaDB found — run `python embed_kb.py` first!')
        print('[Startup]    Starting without knowledge base (degraded mode).')
        return

    client     = chromadb.PersistentClient(path=CHROMA_DIR)
    collection = client.get_collection(COLLECTION)
    count      = collection.count()
    print(f'[Startup] ✓ ChromaDB loaded — {count} chunks in "{COLLECTION}"')


if __name__ == '__main__':
    load_models()
    print(f'\n🚀 DIU CPC Mentor API running at http://{HOST}:{PORT}')
    print(f'   Health: http://{HOST}:{PORT}/api/health\n')
    app.run(host=HOST, port=PORT, debug=False, threaded=True)
