from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# Initialize the embedding model (*NOTE* requires OPENAI_API_KEY environment variable)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# Create vector embeddings and store them in a local database
vector_store = Chroma.from_documents(docs, embeddings)

# Now we can do a similarity search for the validation model
results = vector_store.similarity_search("Validation query goes here", k=3)
