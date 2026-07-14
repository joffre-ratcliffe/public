import torch
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# 1. Mock Data: Items and their shelf locations
inventory = {
    "taco shells": "Aisle 4, Shelf B",
    "ground beef": "Aisle 12, Fridge Section",
    "shredded cheese": "Aisle 12, Dairy Fridge",
    "salsa": "Aisle 5, Middle Shelf",
    "lettuce": "Aisle 1, Produce Section"
}

# 2. Initialize Model (Embedding)
model = SentenceTransformer('all-MiniLM-L6-v2')
items = list(inventory.keys())
item_embeddings = model.encode(items)

# 3. Build Vector Store (FAISS)
dimension = item_embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(item_embeddings).astype('float32'))

def get_location(query):
    # 4. Retrieval: Find the most similar item in our inventory
    query_embedding = model.encode([query])
    D, I = index.search(np.array(query_embedding).astype('float32'), k=1)
    
    # 5. Generation: Augment the answer
    found_item = items[I[0][0]]
    location = inventory[found_item]
    return f"To find '{found_item}', go to {location}."

# Example Usage
print(get_location("Where can I find something for my tacos?"))
# Output: To find 'taco shells', go to Aisle 4, Shelf B.
