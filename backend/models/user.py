from supabase_client import supabase
from datetime import datetime
import bcrypt

class User:
    @staticmethod
    def create_user(email, password, name, role='student'):
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user = {
            'email': email,
            'password': hashed_password,
            'name': name,
            'role': role,
            'points': 0,
            'badges': [],
            'created_at': datetime.utcnow().isoformat()
        }
        try:
            response = supabase.table('users').insert(user).execute()
            if response.data:
                return response.data[0]['id']
            return None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    @staticmethod
    def find_by_email(email):
        try:
            response = supabase.table('users').select('*').eq('email', email).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error finding user by email: {e}")
            return None
    
    @staticmethod
    def find_by_id(user_id):
        try:
            response = supabase.table('users').select('*').eq('id', user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error finding user by id: {e}")
            return None
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))
    
    @staticmethod
    def update_points(user_id, points_to_add):
        try:
            # First get current user data
            user = User.find_by_id(user_id)
            if user:
                current_points = user.get('points', 0)
                new_points = current_points + points_to_add
                badges = user.get('badges', [])
                
                # Award badges based on points
                if new_points >= 50 and 'bronze' not in badges:
                    badges.append('bronze')
                if new_points >= 100 and 'silver' not in badges:
                    badges.append('silver')
                if new_points >= 200 and 'gold' not in badges:
                    badges.append('gold')
                
                # Sort badges
                badge_order = {'bronze': 1, 'silver': 2, 'gold': 3}
                badges.sort(key=lambda x: badge_order.get(x, 0))
                
                # Update user
                response = supabase.table('users').update({
                    'points': new_points, 
                    'badges': badges
                }).eq('id', user_id).execute()
                
                return new_points
            return 0
        except Exception as e:
            print(f"Error updating points: {e}")
            return 0
    
    @staticmethod
    def get_leaderboard(limit=10):
        try:
            response = supabase.table('users').select('name, points, badges')\
                .eq('role', 'student')\
                .order('points', desc=True)\
                .limit(limit)\
                .execute()
            return response.data
        except Exception as e:
            print(f"Error getting leaderboard: {e}")
            return []