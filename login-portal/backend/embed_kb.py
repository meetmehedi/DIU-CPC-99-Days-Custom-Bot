"""
DIU CPC 99 Days — Knowledge Base Indexer
=========================================
Chunks all .md files from the knowledge package,
embeds them with all-MiniLM-L6-v2, and stores
in a persistent ChromaDB collection.

Run once (or re-run to refresh):
  python embed_kb.py
"""

import os
import re
import shutil
import hashlib
import chromadb
from sentence_transformers import SentenceTransformer

# ── CONFIG ──────────────────────────────────────────────────────
KNOWLEDGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CHROMA_DIR    = os.path.join(os.path.dirname(__file__), 'chroma_db')
COLLECTION    = 'diucpc_99days'
MODEL_NAME    = 'sentence-transformers/all-MiniLM-L6-v2'
CHUNK_SIZE    = 350      # chars per chunk
CHUNK_OVERLAP = 80       # chars of overlap

# MD files to index (ordered by priority)
MD_FILES = [
    '00_MASTER_GPT_INSTRUCTIONS.md',
    '01_99_Days_Master_Roadmap.md',
    '02_DIU_CPC_Program_Rules.md',
    '03_DIU_CPC_FAQ.md',
    '04_Project_Ideas.md',
    '05_Assessment_Rubric.md',
    '06_CP_Problem_Solving_Guide.md',
    '06_Git_GitHub_Guide.md',
    '07_Web_Development_Guide.md',
    '07_Knowledge_Pack_Index.md',
    '08_AI_ML_Guide.md',
    '08_Optional_API_Architecture.md',
    '09_Conversation_Starters.md',
    '10_README.md',
    '11_EVALUATION_SUITE.md',
]


# ── CHUNKER ─────────────────────────────────────────────────────

def split_markdown_into_chunks(text: str, source: str):
    """
    Smart chunker:
      1. Split on heading boundaries (# ## ###)
      2. Slide over paragraphs with overlap
    Returns list of (chunk_text, metadata) tuples.
    """
    chunks = []
    # Split by headings — keep heading with its body
    sections = re.split(r'(?=\n#{1,3} )', '\n' + text)

    for section in sections:
        section = section.strip()
        if not section:
            continue

        heading_match = re.match(r'^(#{1,3}) (.+)', section)
        heading       = heading_match.group(2).strip() if heading_match else ''
        heading_level = len(heading_match.group(1)) if heading_match else 0

        paras  = [p.strip() for p in re.split(r'\n{2,}', section) if p.strip()]
        buffer = ''

        for para in paras:
            if len(buffer) + len(para) < CHUNK_SIZE:
                buffer += ('\n\n' if buffer else '') + para
            else:
                if buffer:
                    chunks.append((buffer, {
                        'source': source,
                        'heading': heading,
                        'heading_level': str(heading_level),
                    }))
                    buffer = buffer[-CHUNK_OVERLAP:] + '\n\n' + para
                else:
                    for i in range(0, len(para), CHUNK_SIZE - CHUNK_OVERLAP):
                        sub = para[i:i + CHUNK_SIZE]
                        if sub.strip():
                            chunks.append((sub, {
                                'source': source,
                                'heading': heading,
                                'heading_level': str(heading_level),
                            }))
                    buffer = ''

        if buffer.strip():
            chunks.append((buffer, {
                'source': source,
                'heading': heading,
                'heading_level': str(heading_level),
            }))

    return chunks


def make_id(source: str, idx: int, text: str) -> str:
    h = hashlib.md5(f'{source}:{idx}:{text[:80]}'.encode()).hexdigest()[:12]
    safe = re.sub(r'[^a-zA-Z0-9_-]', '_', source[:20])
    return f'{safe}_{idx}_{h}'


# ── MAIN ────────────────────────────────────────────────────────

def main():
    print('╔══════════════════════════════════════════╗')
    print('║  DIU CPC Knowledge Base Indexer          ║')
    print('║  Model: all-MiniLM-L6-v2  DB: ChromaDB  ║')
    print('╚══════════════════════════════════════════╝\n')

    # ── 1. Load embedding model ──
    print(f'[1/4] Loading {MODEL_NAME}...')
    model = SentenceTransformer(MODEL_NAME)
    print('      ✓ Model loaded\n')

    # ── 2. Init ChromaDB (clean slate) ──
    print(f'[2/4] Initialising ChromaDB at:\n      {CHROMA_DIR}')

    # Always start fresh to avoid corruption
    if os.path.exists(CHROMA_DIR):
        shutil.rmtree(CHROMA_DIR)
        print('      ✓ Old database removed')

    os.makedirs(CHROMA_DIR, exist_ok=True)
    client     = chromadb.PersistentClient(path=CHROMA_DIR)
    collection = client.create_collection(
        name=COLLECTION,
        metadata={'hnsw:space': 'cosine'},
    )
    print('      ✓ Collection created\n')

    # ── 3. Chunk all files ──
    print('[3/4] Chunking knowledge files...')
    all_chunks  = []
    total_files = 0

    for fname in MD_FILES:
        fpath = os.path.join(KNOWLEDGE_DIR, fname)
        if not os.path.exists(fpath):
            print(f'      ⚠  {fname} — not found, skipping')
            continue

        with open(fpath, 'r', encoding='utf-8') as f:
            text = f.read()

        file_chunks = split_markdown_into_chunks(text, fname)
        all_chunks.extend([(t, m, fname) for t, m in file_chunks])
        total_files += 1
        print(f'      ✓ {fname} → {len(file_chunks)} chunks')

    print(f'\n      Total: {len(all_chunks)} chunks from {total_files} files\n')

    if not all_chunks:
        print('❌ No chunks created — check KNOWLEDGE_DIR path.')
        return

    # ── 4. Embed + store in batches ──
    print('[4/4] Embedding and storing chunks...')
    BATCH = 64

    for i in range(0, len(all_chunks), BATCH):
        batch     = all_chunks[i:i + BATCH]
        texts     = [t for t, _, _ in batch]
        metas     = [m for _, m, _ in batch]
        ids       = [make_id(s, i + j, t) for j, (t, m, s) in enumerate(batch)]
        embeddings = model.encode(texts, show_progress_bar=False).tolist()

        collection.add(
            documents=texts,
            embeddings=embeddings,
            metadatas=metas,
            ids=ids,
        )

        done = min(i + BATCH, len(all_chunks))
        pct  = int(done / len(all_chunks) * 100)
        bar  = '█' * (pct // 5) + '░' * (20 - pct // 5)
        print(f'\r      [{bar}] {pct}%  ({done}/{len(all_chunks)})', end='', flush=True)

    print(f'\n\n✅ Knowledge base ready!')
    print(f'   {len(all_chunks)} chunks indexed across {total_files} files')
    print(f'   Collection: "{COLLECTION}"')
    print(f'   DB path: {CHROMA_DIR}')
    print('\n   Next: python server.py\n')


if __name__ == '__main__':
    main()
