from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.issue import Issue
from models.user import User

admin_bp = Blueprint('admin', __name__)

def check_admin_role():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    return user and user.get('role') == 'admin'

import json

@admin_bp.route('/issues', methods=['GET'])
@jwt_required()
def get_all_issues():
    try:
        if not check_admin_role():
            return jsonify({'error': 'Admin access required'}), 403
        
        issues = Issue.find_all()
        formatted_issues = []
        
        for issue in issues:
            # Handle joined user data
            # Supabase returns 'user' as a dict or None if not found
            user_data = issue.get('user') or {}
            
            # Parse location if it's a string
            loc = issue.get('location', {})
            if isinstance(loc, str):
                try:
                    # Replace single quotes with double quotes for valid JSON if needed
                    loc = loc.replace("'", '"')
                    loc = json.loads(loc)
                except:
                    loc = {}

            formatted_issues.append({
                'id': issue['id'],
                'description': issue['description'],
                'category': issue['category'],
                'urgency': issue['urgency'],
                'status': issue['status'],
                'location': loc,
                'image_data': issue.get('image_data'),
                'is_duplicate': issue.get('is_duplicate', False),
                'created_at': issue['created_at'], # Already ISO string
                'user': {
                    'name': user_data.get('name', 'Unknown'),
                    'email': user_data.get('email', 'Unknown')
                }
            })
        
        return jsonify({'issues': formatted_issues}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/issues/<issue_id>/status', methods=['PUT'])
@jwt_required()
def update_issue_status(issue_id):
    try:
        if not check_admin_role():
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'in_progress', 'resolved']:
            return jsonify({'error': 'Invalid status'}), 400
        
        # Get issue before update to check if it's being resolved
        issue = Issue.get_by_id(issue_id)
        was_resolved = issue and issue['status'] == 'resolved'
        
        success = Issue.update_status(issue_id, new_status)
        
        if success:
            # Award points if issue is being resolved for the first time
            if new_status == 'resolved' and not was_resolved:
                User.update_points(issue['user_id'], 10)
            
            return jsonify({'message': 'Status updated successfully'}), 200
        else:
            return jsonify({'error': 'Issue not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        if not check_admin_role():
            return jsonify({'error': 'Admin access required'}), 403
        
        stats = Issue.get_analytics()
        
        return jsonify({
            'total_issues': stats.get('total', 0),
            'pending_issues': stats.get('pending', 0),
            'in_progress_issues': stats.get('in_progress', 0),
            'resolved_issues': stats.get('resolved', 0),
            'high_priority_issues': stats.get('high_priority', 0)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500