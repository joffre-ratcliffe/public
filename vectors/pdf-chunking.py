from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load PDF file
loader = PyPDFLoader("example_document.pdf")
pages = loader.load()

# Splitting the text into chunks of 1000 characters with a 200-character overlap
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000, 
    chunk_overlap=200
)
docs = text_splitter.split_documents(pages)
