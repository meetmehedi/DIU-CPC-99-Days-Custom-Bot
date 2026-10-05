# DIU CPC 99 Days Custom Bot

A DIU CPC mentoring app and knowledge base for the 99 Days program, with a Flask + ChromaDB backend and a browser-based member portal.

## Included
- DIU CPC mentoring backend for the 99-day roadmap and FAQ content
- Local RAG flow using MiniLM + ChromaDB
- Safer fallback behavior for low-confidence or unsupported questions
- Browser login portal for member access
- Knowledge pack files for the DIU CPC program

## Project structure
- `login-portal/` — frontend app and dashboard
- `login-portal/backend/` — Flask API, ChromaDB setup, and startup script
- `*.md` files — DIU CPC knowledge and training material

## Quick start

1. Open the backend folder:
   `cd login-portal/backend`
2. Create a virtual environment if needed:
   `python3 -m venv venv`
3. Activate it:
   `source venv/bin/activate`
4. Install dependencies:
   `pip install -r requirements.txt`
5. Copy environment config:
   `cp .env.example .env`
6. Start the backend:
   `bash start.sh`
7. Open the login portal in a browser:
   `login-portal/index.html`

## Backend behaviour
- Known DIU CPC topics return direct domain-specific guidance.
- Weak or unrelated queries do not guess; they redirect to the program contact guidance.
- The fallback message is:
  "Please call or message Mehedi vaiya, President DIU CPC. He will guide you with this."

## Notes
The login portal is a prototype, not a production authentication system. The member roster is intentionally not included in this public repository because it contains personal contact information. The mock login registry has therefore been removed; production use requires a secure server-side identity provider and database.
