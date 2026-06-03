import torch
import torch.nn as nn

class ProprietaryReceiptParser(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int = 128, num_classes: int = 6):
        super(ProprietaryReceiptParser, self).__init__()
        
        # 1. Text Feature Extraction (Word Embeddings)
        self.text_embed = nn.Embedding(vocab_size, embed_dim)
        
        # 2. Spatial Feature Extraction (4 Coordinates: xmin, ymin, xmax, ymax)
        # Project 4D spatial bounding boxes to the same dimensions as text
        self.spatial_embed = nn.Sequential(
            nn.Linear(4, 64),
            nn.ReLU(),
            nn.Linear(64, embed_dim)
        )
        
        # 3. Multimodal Fusion Layer
        # Combines Text features + Location features
        self.fusion_layer = nn.Sequential(
            nn.Linear(embed_dim * 2, embed_dim),
            nn.LayerNorm(embed_dim),
            nn.ReLU(),
            nn.Dropout(0.1)
        )
        
        # 4. Sequence Processing (Bidirectional LSTM)
        # Analyzes text patterns globally across the page layout
        self.lstm = nn.LSTM(
            input_size=embed_dim, 
            hidden_size=128, 
            num_layers=2, 
            batch_first=True, 
            bidirectional=True
        )
        
        # 5. Token Classification Head
        # Maps output to 6 target classes: Outside, Store Name, Store ID, Date, Time, Total
        self.classifier = nn.Linear(128 * 2, num_classes)

    def forward(self, token_ids, bbox_coords):
        # token_ids shape: [batch_size, sequence_length]
        # bbox_coords shape: [batch_size, sequence_length, 4]
        
        # Extract features
        t_features = self.text_embed(token_ids)
        s_features = self.spatial_embed(bbox_coords)
        
        # Concatenate features on the embedding dimension
        combined_features = torch.cat((t_features, s_features), dim=-1)
        fused_features = self.fusion_layer(combined_features)
        
        # Process structural sequence
        lstm_out, _ = self.lstm(fused_features)
        
        # Predict class per token
        logits = self.classifier(lstm_out)
        return logits # shape: [batch_size, sequence_length, num_classes]
