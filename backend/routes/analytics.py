from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.issue import Issue
from models.user import User

analytics_bp = Blueprint('analytics', __name__)

def check_admin_role():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    return user and user.get('role') == 'admin'

@analytics_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_category_analytics():
    try:
        if not check_admin_role():
            return jsonify({'error': 'Admin access required'}), 403
        
        category_stats = Issue.get_category_stats()
        formatted_stats = []
        
        for stat in category_stats:
            formatted_stats.append({
                'name': stat['_id'].title(),
                'value': stat['count']
            })
        
        return jsonify({'categories': formatted_stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/urgency', methods=['GET'])
@jwt_required()
def get_urgency_analytics():
    try:
        if not check_admin_role():
            return jsonify({'error': 'Admin access required'}), 403
        
        urgency_stats = Issue.get_urgency_stats()
        formatted_stats = []
        
        for stat in urgency_stats:
            formatted_stats.append({
                'name': stat['_id'].title(),
                'value': stat['count']
            })
        
        return jsonify({'urgency': formatted_stats}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_trend_analytics():
    try:
        if not check_admin_role():
            return jsonify({'error': 'Admin access required'}), 403
        
        trend_data = Issue.get_trend_data()
        formatted_trends = []
        
        for trend in trend_data:
            date_obj = trend['_id']
            date_str = f"{date_obj['year']}-{date_obj['month']:02d}-{date_obj['day']:02d}"
            formatted_trends.append({
                'date': date_str,
                'count': trend['count']
            })
        
        return jsonify({'trends': formatted_trends}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500