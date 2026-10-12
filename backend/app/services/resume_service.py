"""
Resume parsing service - extracts text from PDF and DOCX files.
"""
import os
import io
from typing import Optional


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file."""
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""


def extract_text_from_resume(file_content: bytes, file_type: str) -> str:
    """Extract text based on file type."""
    if file_type.lower() == "pdf":
        return extract_text_from_pdf(file_content)
    elif file_type.lower() in ["docx", "doc"]:
        return extract_text_from_docx(file_content)
    else:
        # Try to decode as plain text
        try:
            return file_content.decode("utf-8")
        except:
            return ""


def save_resume_file(file_content: bytes, filename: str, upload_dir: str) -> str:
    """Save resume file and return file path."""
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(file_content)
    return file_path
