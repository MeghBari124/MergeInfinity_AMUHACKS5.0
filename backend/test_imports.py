
try:
    import transformers
    print("transformers imported")
    from transformers import pipeline
    print("pipeline imported")
    import sklearn
    print("sklearn imported")
    from sklearn.feature_extraction.text import TfidfVectorizer
    print("TfidfVectorizer imported")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
