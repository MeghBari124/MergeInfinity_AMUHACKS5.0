from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.issue import Issue
from models.user import User
from ai.analyzer import analyze_sentiment, categorize_issue, check_duplicate
import json

issues_bp = Blueprint('issues', __name__)

# ---------------- CREATE ISSUE ---------------- #

@issues_bp.route('/create', methods=['POST'])
@jwt_required()
def create_issue():
    try:
        user_id = get_jwt_identity()

        # Safe user lookup
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.get('role') == 'admin':
            return jsonify({'error': 'Admins cannot report issues'}), 403

        data = request.get_json()
        print(f"Received issue creation request for user: {user_id}")

        # Prevent empty JSON crash
        if not data:
            return jsonify({'error': 'Invalid or empty JSON'}), 400

        description = data.get('description', '').strip()
        image_data = data.get('image')
        if image_data:
            print(f"Image data received: {len(image_data)} characters")
        location = data.get('location', {})

        if not description:
            return jsonify({'error': 'Description required'}), 400

        # AI
        urgency = analyze_sentiment(description)
        category = categorize_issue(description)

        # Duplicate check (safe)
        existing = Issue.get_all_descriptions() or []
        is_duplicate = check_duplicate(description, existing)
        print(f"AI Analysis Result - Urgency: {urgency}, Category: {category}, Is Duplicate: {is_duplicate}")

        # Create issue (NO json.dumps)
        issue_id = Issue.create_issue(
            user_id=user_id,
            description=description,
            image_data=image_data,
            location=location,
            category=category,
            urgency=urgency,
            is_duplicate=is_duplicate
        )

        if not issue_id:
            print("Error: Failed to save issue to database")
            return jsonify({'error': 'Failed to create issue'}), 500

        print(f"Issue created successfully with ID: {issue_id}")

        return jsonify({
            "message": "Issue reported successfully",
            "issue_id": issue_id,
            "urgency": urgency,
            "category": category,
            "is_duplicate": is_duplicate
        }), 201

    except Exception as e:
        print("Create Issue Error:", e)
        return jsonify({'error': 'Server error'}), 500


# ---------------- MY REPORTS ---------------- #

@issues_bp.route('/my-reports', methods=['GET'])
@jwt_required()
def get_my_reports():
    try:
        user_id = get_jwt_identity()

        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.get('role') == 'admin':
            return jsonify({'error': 'Admins do not have personal reports'}), 403

        issues = Issue.find_by_user(user_id)

        formatted = []

        for issue in issues:
            formatted.append({
                'id': issue['id'],
                'description': issue['description'],
                'category': issue['category'],
                'urgency': issue['urgency'],
                'status': issue['status'],
                'location': issue.get('location', {}),
                'is_duplicate': issue.get('is_duplicate', False),
                'created_at': issue['created_at'],
                'points_earned': 10 if issue['status'] == 'resolved' else 0
            })

        return jsonify({'issues': formatted}), 200

    except Exception as e:
        print("My Reports Error:", e)
        return jsonify({'error': 'Server error'}), 500


# ---------------- RESOLVE ISSUE ---------------- #

@issues_bp.route('/<issue_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_issue(issue_id):
    try:
        user_id = get_jwt_identity()

        issue = Issue.get_by_id(issue_id)

        if not issue:
            return jsonify({'error': 'Issue not found'}), 404

        if issue['user_id'] != user_id:
            return jsonify({'error': 'You can resolve only your issues'}), 403

        # Award points ONLY once
        if issue['status'] != 'resolved':
            Issue.update_status(issue_id, 'resolved')
            User.update_points(issue['user_id'], 10)

        return jsonify({'message': 'Issue resolved successfully'}), 200

    except Exception as e:
        print("Resolve Error:", e)
        return jsonify({'error': 'Server error'}), 500
