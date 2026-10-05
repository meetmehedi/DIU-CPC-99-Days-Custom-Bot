# Web Development Guide
## DIU CPC 99 Days — Stage 3 Reference (Days 46–65)

---

## PHASE 0 — Hello, Web World (Day 46)

### How the Web Works
```
User types URL → DNS resolves IP → Browser sends HTTP Request
→ Server responds with HTML/CSS/JS → Browser renders page
```

Key terms:
- **Client** — browser (your computer)
- **Server** — computer hosting the website
- **HTTP/HTTPS** — protocol for communication
- **URL** — address of a resource
- **HTML** — structure, **CSS** — style, **JavaScript** — behavior

### Your First Web Page
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>My first web page.</p>
</body>
</html>
```
Save as `index.html`, open in browser → Done! 🎉

---

## PHASE 1 — HTML Structure (Day 47)

### Semantic HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Student profile page">
  <title>My Profile | DIU CPC</title>
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="#about">About</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section id="about">
      <h1>About Me</h1>
      <p>I'm a student at Dhaka International University.</p>
    </section>

    <section id="skills">
      <h2>Skills</h2>
      <ul>
        <li>C++</li>
        <li>Python</li>
        <li>HTML/CSS</li>
      </ul>
    </section>

    <article>
      <h2>My Blog Post</h2>
      <p>Article content here...</p>
    </article>
  </main>

  <footer>
    <p>&copy; 2025 My Name</p>
  </footer>
</body>
</html>
```

### Common HTML Tags
| Tag | Purpose |
|-----|---------|
| `<header>`, `<footer>`, `<main>`, `<nav>` | Semantic layout |
| `<section>`, `<article>`, `<aside>` | Content grouping |
| `<h1>`–`<h6>` | Headings (one `<h1>` per page) |
| `<p>`, `<span>`, `<div>` | Text / containers |
| `<a href="">` | Links |
| `<img src="" alt="">` | Images (always add alt!) |
| `<ul>`, `<ol>`, `<li>` | Lists |
| `<table>`, `<tr>`, `<td>` | Tables |

---

## PHASE 2 — Forms & Accessibility (Day 48)

```html
<form action="/submit" method="POST">
  <div>
    <label for="name">Full Name:</label>
    <input type="text" id="name" name="name" required placeholder="Enter your name">
  </div>

  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </div>

  <div>
    <label for="level">Coding Level:</label>
    <select id="level" name="level">
      <option value="">Choose...</option>
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="advanced">Advanced</option>
    </select>
  </div>

  <fieldset>
    <legend>Track Interest:</legend>
    <label><input type="radio" name="track" value="cp"> CP</label>
    <label><input type="radio" name="track" value="web"> Web Dev</label>
    <label><input type="radio" name="track" value="ml"> AI/ML</label>
  </fieldset>

  <button type="submit">Register</button>
</form>
```

**Accessibility rules:**
- Every input needs a `<label>` with matching `for`/`id`
- Images need descriptive `alt` text
- Use semantic tags, not just `<div>` for everything
- Ensure keyboard navigable (tab through)

---

## PHASE 3 — CSS Fundamentals (Day 49)

```css
/* Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* Variables */
:root {
  --primary: #6c63ff;
  --text: #1a1a2e;
  --bg: #f5f5f5;
  --radius: 8px;
}

/* Selectors */
h1 { }                  /* element */
.card { }               /* class */
#hero { }               /* id */
a:hover { }             /* pseudo-class */
p::first-line { }       /* pseudo-element */
nav > ul { }            /* direct child */
input[type="text"] { }  /* attribute */

/* Typography */
body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
}

/* Box model */
.card {
  width: 300px;
  padding: 20px;          /* inner space */
  border: 1px solid #ddd;
  margin: 16px;           /* outer space */
  border-radius: var(--radius);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Colors & backgrounds */
.btn {
  background-color: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn:hover { opacity: 0.85; }
```

---

## PHASE 4 — Flexbox (Day 50)

```css
/* Flex container */
.container {
  display: flex;
  flex-direction: row;      /* row | column */
  justify-content: center;  /* main axis: flex-start | center | space-between | space-around */
  align-items: center;      /* cross axis: stretch | center | flex-start | flex-end */
  gap: 16px;
  flex-wrap: wrap;
}

/* Flex item */
.item {
  flex: 1;          /* grow and shrink equally */
  flex: 0 0 200px;  /* don't grow, don't shrink, 200px wide */
}

/* Navbar with flexbox */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

/* Card grid */
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.card { flex: 1 1 280px; } /* responsive cards */
```

---

## PHASE 5 — CSS Grid (Day 51)

```css
/* Grid container */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);    /* 3 equal columns */
  grid-template-columns: 250px 1fr 1fr;     /* sidebar + 2 cols */
  grid-template-rows: auto;
  gap: 16px;
}

/* Page layout */
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 250px 1fr 1fr;
  min-height: 100vh;
}

header { grid-area: header; }
aside  { grid-area: sidebar; }
main   { grid-area: main; }
footer { grid-area: footer; }

/* Responsive grid */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

---

## PHASE 6 — Responsive Design (Day 52)

```css
/* Mobile-first approach — style for mobile, then expand */

/* Base (mobile) */
.container { padding: 1rem; }
.nav-menu { display: none; }

/* Tablet */
@media (min-width: 768px) {
  .container { max-width: 768px; margin: 0 auto; padding: 2rem; }
  .nav-menu { display: flex; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { max-width: 1200px; }
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* Common responsive image */
img { max-width: 100%; height: auto; }

/* Responsive font size */
h1 { font-size: clamp(1.5rem, 4vw, 3rem); }
```

---

## PHASE 7 — JavaScript Fundamentals (Day 53)

```javascript
// Variables
let name = "Mehedi";        // can change
const PI = 3.14;            // cannot change
var old = "avoid var";      // old style, avoid

// Data types
let str = "hello";
let num = 42;
let bool = true;
let arr = [1, 2, 3];
let obj = { name: "DIU", year: 2024 };
let nothing = null;
let undef = undefined;

// Functions
function greet(name) { return `Hello, ${name}!`; }
const greet = (name) => `Hello, ${name}!`;     // arrow function

// Array methods
const nums = [1, 2, 3, 4, 5];
nums.map(x => x * 2);          // [2, 4, 6, 8, 10]
nums.filter(x => x > 2);       // [3, 4, 5]
nums.reduce((acc, x) => acc + x, 0); // 15
nums.find(x => x > 3);         // 4
nums.includes(3);               // true

// Destructuring
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const { name, year } = { name: "DIU", year: 2024 };

// Spread
const merged = [...arr1, ...arr2];
const copy = { ...original, newKey: "value" };
```

---

## PHASE 8 — DOM Manipulation (Day 54)

```javascript
// Select elements
const el = document.getElementById("myId");
const els = document.querySelectorAll(".card");
const first = document.querySelector("h1");

// Modify content
el.textContent = "New text";   // plain text
el.innerHTML = "<b>Bold</b>";  // HTML (careful with XSS)

// Modify styles
el.style.color = "red";
el.classList.add("active");
el.classList.remove("hidden");
el.classList.toggle("open");

// Create and append elements
const div = document.createElement("div");
div.textContent = "Hello!";
div.className = "card";
document.body.appendChild(div);

// Remove elements
el.remove();

// Attributes
el.setAttribute("href", "https://diucpc.club");
el.getAttribute("href");
el.removeAttribute("disabled");
```

---

## PHASE 9 — Events & Forms (Day 55)

```javascript
// Click event
document.getElementById("btn").addEventListener("click", (e) => {
  console.log("Clicked!", e.target);
});

// Form submission
document.getElementById("myForm").addEventListener("submit", (e) => {
  e.preventDefault(); // stop page reload
  const name = document.getElementById("name").value.trim();
  if (!name) {
    alert("Name required!");
    return;
  }
  console.log("Form data:", name);
});

// Keyboard events
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Input event (live feedback)
document.getElementById("search").addEventListener("input", (e) => {
  filterResults(e.target.value);
});

// Event delegation (handle many children with one listener)
document.getElementById("list").addEventListener("click", (e) => {
  if (e.target.matches(".delete-btn"))
    e.target.parentElement.remove();
});
```

---

## PHASE 10 — Async JavaScript (Day 56)

```javascript
// Promises
fetch("https://api.example.com/data")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Async / Await (cleaner syntax)
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed:", err.message);
    return null;
  }
}

// Parallel requests
const [users, posts] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json())
]);
```

---

## PHASE 11 — Consuming APIs (Day 57)

```javascript
// Fetch from a public API and display results
async function loadJoke() {
  const btn = document.getElementById("jokeBtn");
  const display = document.getElementById("joke");

  btn.textContent = "Loading...";
  btn.disabled = true;

  try {
    const res = await fetch("https://official-joke-api.appspot.com/random_joke");
    const joke = await res.json();
    display.textContent = `${joke.setup} — ${joke.punchline}`;
  } catch {
    display.textContent = "Failed to load joke. Try again!";
  } finally {
    btn.textContent = "New Joke";
    btn.disabled = false;
  }
}

// API with query params
const query = "Bangladesh";
const url = `https://restcountries.com/v3.1/name/${query}`;
const res = await fetch(url);
const countries = await res.json();
```

---

## PHASE 12 — Backend Fundamentals (Day 60) — Node.js + Express

```javascript
// Install: npm init -y && npm install express

const express = require("express");
const app = express();
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from server!");
});

app.get("/api/students", (req, res) => {
  res.json([{ id: 1, name: "Mehedi", track: "CP" }]);
});

app.post("/api/students", (req, res) => {
  const { name, track } = req.body;
  if (!name || !track) return res.status(400).json({ error: "Missing fields" });
  // Save to DB...
  res.status(201).json({ message: "Student added", name, track });
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  // Delete from DB...
  res.json({ message: `Student ${id} deleted` });
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

## PHASE 13 — Database Basics (Day 61) — SQLite / MongoDB

```sql
-- SQL basics
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  track TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO students (name, track) VALUES ('Mehedi', 'CP');
SELECT * FROM students WHERE track = 'CP';
UPDATE students SET track = 'Web' WHERE id = 1;
DELETE FROM students WHERE id = 1;
```

```javascript
// MongoDB with Mongoose
const mongoose = require("mongoose");
await mongoose.connect("mongodb://localhost/diucpc");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  track: String,
  day: { type: Number, default: 1 }
});
const Student = mongoose.model("Student", StudentSchema);

await Student.create({ name: "Mehedi", track: "CP" });
const students = await Student.find({ track: "CP" });
```

---

## PHASE 14 — Authentication Concepts (Day 62)

```javascript
// Password hashing — NEVER store plain passwords
const bcrypt = require("bcrypt");
const hashed = await bcrypt.hash(password, 10);
const match = await bcrypt.compare(inputPassword, hashed);

// JWT — stateless auth token
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET; // from .env, never hardcode

const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "7d" });
const decoded = jwt.verify(token, SECRET);

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Protected route
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

**SECURITY RULES:**
- Never store secrets in code — use `.env` files
- Add `.env` to `.gitignore`
- Hash passwords with bcrypt (never MD5/SHA1 alone)
- Use HTTPS in production

---

## PHASE 15 — Deployment (Day 64)

### Checklist before deploying
- [ ] Remove all `console.log` debug statements
- [ ] Environment variables set (not hardcoded)
- [ ] `.env` in `.gitignore`
- [ ] Error handling for all routes
- [ ] HTTPS enabled (Vercel/Netlify do this automatically)

### Free Deployment Options
| Type | Platform | How |
|------|---------|-----|
| Static HTML/CSS/JS | Netlify, Vercel, GitHub Pages | Drag & drop or Git push |
| Node.js backend | Railway, Render, Fly.io | Connect GitHub repo |
| Database | Supabase (PostgreSQL), MongoDB Atlas | Free tier |
| Full-stack | Vercel (Next.js), Render | One-click deploy |

### GitHub Pages (static sites)
```bash
git push origin main
# Enable Pages in repo Settings → Pages → Deploy from main
# Site at: https://username.github.io/repo-name
```

---

## FINAL PROJECT — Full-Stack Web App (Day 65)

### Project: Student Resource Hub

A web app where students can share and browse study resources (links, notes, videos) organized by topic.

### Features (MVP)
1. Browse resources by category (CP, Web, ML, App)
2. Add a resource (title, link, description, category)
3. Upvote resources
4. Search resources

### Tech Stack
- **Frontend:** HTML + CSS + Vanilla JS (or React)
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (free) or SQLite
- **Deployment:** Render (backend) + Netlify (frontend)

### Milestones
| Milestone | Days |
|-----------|------|
| HTML/CSS UI | 1 day |
| JS interactivity + fetch | 1 day |
| Express backend + REST API | 1 day |
| Database integration | 1 day |
| Auth (optional) | 1 day |
| Deploy | 1 day |

### Repository Structure
```
student-resource-hub/
├── README.md
├── .gitignore
├── .env.example
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── resources.js
│   ├── models/
│   │   └── Resource.js
│   └── middleware/
│       └── auth.js
└── package.json
```

### Demo Checklist
- [ ] Live deployed URL works
- [ ] Can add a resource
- [ ] Can browse/search resources
- [ ] README with screenshots
- [ ] Code committed and clean

---

## Web Development Roadmap
```
HTML → CSS → Flexbox/Grid → Responsive
→ JavaScript → DOM → Events → Async/Fetch
→ APIs → Git workflow
→ Backend (Node/Express) → Database → Auth
→ Testing → Deployment
→ Final Project (deployed full-stack app)
```
