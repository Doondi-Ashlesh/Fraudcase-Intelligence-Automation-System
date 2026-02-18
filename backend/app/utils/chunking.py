from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.models.schemas import DocumentChunk
import uuid
import datetime

def get_text_chunks(text: str, source: str, doc_type: str = "txt") -> list[DocumentChunk]:
    """
    Chunks text using RecursiveCharacterTextSplitter.
    500-800 tokens (characters as proxy here), 100 overlap.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_text(text)
    
    document_chunks = []
    for i, chunk in enumerate(chunks):
        document_chunks.append(DocumentChunk(
            id=str(uuid.uuid4()),
            content=chunk,
            metadata={
                "source": source,
                "doc_type": doc_type,
                "timestamp": datetime.datetime.now().isoformat(),
                "chunk_index": i
            }
        ))
    return document_chunks
