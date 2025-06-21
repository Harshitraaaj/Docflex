# import sys
# from pdf2docx import Converter

# if len(sys.argv) != 3:
#     print("Usage: pdf_to_word.py input.pdf output.docx")
#     sys.exit(1)

# input_pdf = sys.argv[1]
# output_docx = sys.argv[2]

# try:
#     cv = Converter(input_pdf)
#     cv.convert(output_docx, start=0, end=None)
#     cv.close()
#     print("Conversion successful.")
# except Exception as e:
#     print(f"Error: {e}")
#     sys.exit(1)

#!/usr/bin/env python3
import sys
import os

# Try multiple conversion methods
try:
    from pdf2docx import Converter
    CONVERSION_METHOD = "pdf2docx"
except ImportError:
    try:
        import fitz  # PyMuPDF
        from docx import Document
        from docx.shared import Inches
        from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
        CONVERSION_METHOD = "pymupdf"
    except ImportError:
        print("Error: Required packages not found. Please install pdf2docx or pymupdf+python-docx", file=sys.stderr)
        sys.exit(1)

def convert_pdf_to_word_pymupdf(input_path, output_path):
    """
    Convert PDF to Word using PyMuPDF + python-docx (fallback method)
    """
    try:
        # Open PDF
        doc = fitz.open(input_path)
        word_doc = Document()
        
        # Extract text from each page
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            
            if text.strip():  # Only add non-empty pages
                if page_num > 0:
                    word_doc.add_page_break()
                
                # Split text into paragraphs
                paragraphs = text.split('\n\n')
                for para_text in paragraphs:
                    if para_text.strip():
                        word_doc.add_paragraph(para_text.strip())
        
        # Save document
        word_doc.save(output_path)
        doc.close()
        
        return True
    except Exception as e:
        print(f"PyMuPDF conversion error: {str(e)}", file=sys.stderr)
        return False