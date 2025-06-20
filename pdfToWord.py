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
from pdf2docx import Converter

def convert_pdf_to_word(input_path, output_path):
    """
    Convert PDF to Word document using pdf2docx
    """
    try:
        # Check if input file exists
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")
        
        # Check if input file is not empty
        if os.path.getsize(input_path) == 0:
            raise ValueError("Input PDF file is empty")
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
        
        # Convert PDF to Word
        cv = Converter(input_path)
        cv.convert(output_path)
        cv.close()
        
        # Verify output file was created and is not empty
        if not os.path.exists(output_path):
            raise RuntimeError("Conversion failed: Output file was not created")
        
        if os.path.getsize(output_path) == 0:
            raise RuntimeError("Conversion failed: Output file is empty")
        
        print(f"Successfully converted {input_path} to {output_path}")
        return True
        
    except Exception as e:
        print(f"Error during conversion: {str(e)}", file=sys.stderr)
        # Clean up partial output file if it exists
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except:
                pass
        return False

def main():
    if len(sys.argv) != 3:
        print("Usage: python3 pdfToWord.py <input_pdf_path> <output_docx_path>", file=sys.stderr)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    # Ensure output has .docx extension
    if not output_path.lower().endswith('.docx'):
        output_path += '.docx'
    
    success = convert_pdf_to_word(input_path, output_path)
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()