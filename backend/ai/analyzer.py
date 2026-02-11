from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

sentiment_analyzer = None

def get_analyzer():
    global sentiment_analyzer
    if sentiment_analyzer is None:
        print("Loading AI model... this may take a moment.")
        try:
            from transformers import pipeline
            sentiment_analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
            print("AI model loaded successfully.")
        except Exception as e:
            print(f"Primary model failed to load: {e}. Falling back to default model.")
            # Fallback to a simpler model if the above fails
            sentiment_analyzer = pipeline("sentiment-analysis")
            print("Default AI model loaded.")
    return sentiment_analyzer

def analyze_sentiment(text):
    """
    Analyze sentiment and return urgency level
    NEGATIVE → High urgency
    NEUTRAL → Medium urgency  
    POSITIVE → Low urgency
    """
    analyzer = get_analyzer()
    try:
        result = analyzer(text)[0]
        label = result['label'].upper()
        confidence = result['score']
        
        # Map sentiment to urgency
        if 'NEGATIVE' in label:
            return 'high'
        elif 'NEUTRAL' in label:
            return 'medium'
        else:
            # POSITIVE sentiment
            if confidence > 0.9: # Very positive might be a thank you or non-issue
                return 'low'
            return 'medium'
    except:
        # Fallback to keyword-based analysis
        negative_keywords = ['broken', 'dirty', 'urgent', 'emergency', 'dangerous', 'not working', 'damaged']
        text_lower = text.lower()
        
        for keyword in negative_keywords:
            if keyword in text_lower:
                return 'high'
        
        return 'medium'

def categorize_issue(text):
    """
    Categorize issue based on keywords
    """
    text_lower = text.lower()
    
    # Sanitation keywords
    sanitation_keywords = [
        'washroom', 'toilet', 'bathroom', 'dirty', 'clean', 'garbage', 'trash', 
        'smell', 'odor', 'leak', 'water', 'spill', 'litter', 'dust', 'clogged', 'plumbing'
    ]
    for keyword in sanitation_keywords:
        if keyword in text_lower:
            return 'sanitation'
    
    # Infrastructure keywords
    infrastructure_keywords = [
        'bench', 'broken', 'chair', 'table', 'door', 'window', 'wall', 'floor', 
        'ceiling', 'paint', 'cracked', 'tiles', 'furniture', 'desk', 'stairs', 'elevator',
        'pothole', 'road', 'pathway', 'gate', 'fence'
    ]
    for keyword in infrastructure_keywords:
        if keyword in text_lower:
            return 'infrastructure'
    
    # Electrical keywords
    electrical_keywords = [
        'light', 'electric', 'power', 'outlet', 'switch', 'bulb', 'fan', 'ac', 
        'air conditioning', 'wire', 'socket', 'fuse', 'generator', 'heater', 'cooler',
        'projector', 'computer', 'server', 'network', 'wifi'
    ]
    for keyword in electrical_keywords:
        if keyword in text_lower:
            return 'electrical'
    
    # Security keywords
    security_keywords = [
        'security', 'lock', 'key', 'theft', 'stolen', 'missing', 'unsafe', 
        'guard', 'camera', 'cctv', 'harassment', 'stranger', 'suspicious', 'emergency'
    ]
    for keyword in security_keywords:
        if keyword in text_lower:
            return 'security'
    
    return 'general'

def check_duplicate(new_text, existing_descriptions, threshold=0.8):
    """
    Check if the new issue is a duplicate using TF-IDF and cosine similarity
    """
    if not existing_descriptions:
        return False
    
    try:
        # Combine new text with existing descriptions
        all_texts = existing_descriptions + [new_text]
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(stop_words='english', lowercase=True)
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # Calculate cosine similarity between new text and existing ones
        new_text_vector = tfidf_matrix[-1]
        existing_vectors = tfidf_matrix[:-1]
        
        similarities = cosine_similarity(new_text_vector, existing_vectors).flatten()
        
        # Check if any similarity exceeds threshold
        max_similarity = max(similarities) if len(similarities) > 0 else 0
        
        return bool(max_similarity > threshold)
    
    except Exception as e:
        print(f"Error in duplicate detection: {e}")
        return False

def preprocess_text(text):
    """
    Clean and preprocess text for better analysis
    """
    # Remove special characters and extra whitespace
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()