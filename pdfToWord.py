import sys
from pdf2docx import Converter

if len(sys.argv) < 3:
    print("Usage: python convert.py input.pdf output.docx")
    sys.exit(1)

pdf_file = sys.argv[1]  # Input PDF file
docx_file = sys.argv[2]  # Output DOCX file

try:
    cv = Converter(pdf_file)
    cv.convert(docx_file, start=0, end=None, parallel=True)
    cv.close()
    print("Conversion Successful!")
except Exception as e:
    print(f"Error: {e}")



# from pdf2docx import Converter

# pdf_file = "./files/chum.pdf"
# docx_file = "./files/pdeut.docx"

# cv = Converter(pdf_file)
# cv.convert(docx_file, start=0, end=None, parallel=True)
# cv.close()

# print("Conversion Successful!")

