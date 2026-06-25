import React, { useState } from 'react';

export default function ImageDropzone() {
  // State to track if the user is currently dragging a file over the zone
  const [dragActive, setDragActive] = useState(false);
  // State to hold the uploaded image preview URL
  const [imagePreview, setImagePreview] = useState(null);

  // Handle drag events (enter, over, leave)
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle the actual drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false); // Reset the drag state

    // Check if files were dropped
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Ensure the dropped file is actually an image
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        
        // When the file is read, set it as the preview
        reader.onload = (event) => {
          setImagePreview(event.target.result);
        };
        
        reader.readAsDataURL(file);
      } else {
        alert("Please drop a valid image file (PNG, JPG, etc.)");
      }
    }
  };

  // Clear the image to start over
  const handleClear = () => {
    setImagePreview(null);
  };

  return (
    <div style={styles.container}>
      <h2>Upload an Image</h2>
      
      {/* The Dropzone Area 
        We attach our event handlers here to catch the browser's drag events
      */}
      <div 
        style={{
          ...styles.dropzone,
          ...(dragActive ? styles.dropzoneActive : {})
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {imagePreview ? (
          <div style={styles.previewContainer}>
            <img src={imagePreview} alt="Preview" style={styles.image} />
            <button onClick={handleClear} style={styles.button}>
              Remove Image
            </button>
          </div>
        ) : (
          <p>{dragActive ? "Drop the image here!" : "Drag & Drop an image here"}</p>
        )}
      </div>
    </div>
  );
}

// Simple inline styles
const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: '500px',
    margin: '40px auto',
    textAlign: 'center',
    color: '#333'
  },
  dropzone: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '40px',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s ease',
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dropzoneActive: {
    borderColor: '#0070f3',
    backgroundColor: '#e6f0ff'
  },
  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  image: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};
