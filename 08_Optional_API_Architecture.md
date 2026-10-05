# Optional External Integration Architecture

This is NOT a live API. It is a design specification for a future integration.

## Goal
Allow the mentor to verify:
- student profile ID
- current program day
- GitHub contribution/commit information
- Codeforces public statistics
- submitted project URL
- review status

## Recommended architecture

Student
  ↓
DIU CPC 99 Days Mentor
  ↓
DIU CPC backend API
  ├── student profile
  ├── progress
  ├── submissions
  └── verification
       ↓
  GitHub / Codeforces APIs

## Security
- Never store secrets in GPT instructions.
- Use OAuth or a secure server-side credential flow where appropriate.
- Keep the minimum necessary student data.
- Log verification events.
- Do not expose private repository contents unless explicitly authorized.
- Provide a privacy policy before public deployment.

## Example endpoint design
GET /v1/students/{student_id}/progress
GET /v1/students/{student_id}/submissions
GET /v1/students/{student_id}/verification
POST /v1/students/{student_id}/reflection

The actual OpenAPI schema must be created against the deployed DIU CPC backend.
