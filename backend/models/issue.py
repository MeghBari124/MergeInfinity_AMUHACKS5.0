from supabase_client import supabase
from datetime import datetime

class Issue:
    @staticmethod
    def create_issue(user_id, description, image_data, location, category, urgency, is_duplicate=False):
        issue = {
            'user_id': user_id,
            'description': description,
            'image_data': image_data,
            'location': location,
            'category': category,
            'urgency': urgency,
            'status': 'pending',
            'is_duplicate': is_duplicate,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        try:
            response = supabase.table('issues').insert(issue).execute()
            if response.data:
                return response.data[0]['id']
            return None
        except Exception as e:
            print(f"Error creating issue: {e}")
            return None
    
    @staticmethod
    def find_by_user(user_id):
        try:
            response = supabase.table('issues').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            print(f"Error finding issues by user: {e}")
            return []
    
    @staticmethod
    def find_all():
        try:
            # Join with users table
            response = supabase.table('issues').select('*, user:users(*)').order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            print(f"Error finding all issues: {e}")
            return []
    
    @staticmethod
    def update_status(issue_id, status):
        try:
            response = supabase.table('issues').update({
                'status': status,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', issue_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error updating status: {e}")
            return False
    
    @staticmethod
    def get_by_id(issue_id):
        try:
            response = supabase.table('issues').select('*').eq('id', issue_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting issue by id: {e}")
            return None
    
    @staticmethod
    def get_all_descriptions():
        try:
            response = supabase.table('issues').select('description').execute()
            return [issue['description'] for issue in response.data]
        except Exception as e:
            print(f"Error getting descriptions: {e}")
            return []
    
    @staticmethod
    def get_analytics():
        # This is more complex in Supabase/Postgres if we want single query
        # For simplicity, we can fetch all and aggregate in python or make multiple queries
        # Or better, use RPC/Views in Supabase. For now, multiple queries is safer for migration speed.
        try:
            total = supabase.table('issues').select('*', count='exact', head=True).execute().count
            pending = supabase.table('issues').select('*', count='exact', head=True).eq('status', 'pending').execute().count
            in_progress = supabase.table('issues').select('*', count='exact', head=True).eq('status', 'in_progress').execute().count
            resolved = supabase.table('issues').select('*', count='exact', head=True).eq('status', 'resolved').execute().count
            high_priority = supabase.table('issues').select('*', count='exact', head=True).eq('urgency', 'high').execute().count
            
            return {
                'total': total,
                'pending': pending,
                'in_progress': in_progress,
                'resolved': resolved,
                'high_priority': high_priority
            }
        except Exception as e:
            print(f"Error getting analytics: {e}")
            return {}
    
    @staticmethod
    def get_category_stats():
        try:
            # Using a simplified approach: fetch all categories and count in python
            # In production, use a SQL view or RPC
            response = supabase.table('issues').select('category').execute()
            counts = {}
            for item in response.data:
                cat = item['category']
                counts[cat] = counts.get(cat, 0) + 1
            return [{'_id': k, 'count': v} for k, v in counts.items()]
        except Exception as e:
            print(f"Error getting category stats: {e}")
            return []
    
    @staticmethod
    def get_urgency_stats():
        try:
            response = supabase.table('issues').select('urgency').execute()
            counts = {}
            for item in response.data:
                urg = item['urgency']
                counts[urg] = counts.get(urg, 0) + 1
            return [{'_id': k, 'count': v} for k, v in counts.items()]
        except Exception as e:
            print(f"Error getting urgency stats: {e}")
            return []
    
    @staticmethod
    def get_trend_data():
        try:
            # Fetch created_at dates
            response = supabase.table('issues').select('created_at').execute()
            dates = {}
            for item in response.data:
                # Extract date part YYYY-MM-DD
                dt = item['created_at'][:10]
                dates[dt] = dates.get(dt, 0) + 1
            
            # Format to match previous output structure
            result = []
            for dt_str, count in sorted(dates.items()):
                year, month, day = map(int, dt_str.split('-'))
                result.append({
                    '_id': {'year': year, 'month': month, 'day': day},
                    'count': count
                })
            return result
        except Exception as e:
            print(f"Error getting trend data: {e}")
            return []