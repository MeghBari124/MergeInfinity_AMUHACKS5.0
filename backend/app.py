from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import base64
from io import BytesIO


from routes.auth import auth_bp
from routes.issues import issues_bp
from routes.admin import admin_bp
from routes.analytics import analytics_bp

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

jwt = JWTManager(app)
# Allow all origins for development
CORS(app, resources={r"/*": {"origins": "*"}})

# Supabase connection
try:
    from supabase_client import supabase
    print("Supabase client initialized successfully")
except Exception as e:
    print(f"Error initializing Supabase: {e}")


# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(issues_bp, url_prefix='/api/issues')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

from models.user import User

# Initialize admin user
def init_admin():
    try:
        admin_email = 'admin@campusfix.com'
        admin_exists = User.find_by_email(admin_email)
        
        if not admin_exists:
            # Create admin user
            User.create_user(
                email=admin_email,
                password='CampusFixAdmin#2026',
                name='Admin User',
                role='admin'
            )
            print("Admin user created: admin@campusfix.com / CampusFixAdmin#2026")
    except Exception as e:
        print(f"Error initializing admin: {e}")

if __name__ == '__main__':
    try:
        init_admin()
        
        # Pre-load AI models
        from ai.analyzer import get_analyzer
        print("Pre-loading AI models...")
        get_analyzer()
        
        print("Starting server on http://0.0.0.0:5000")
        app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
    except Exception as e:
        print(f"Error starting server: {e}")