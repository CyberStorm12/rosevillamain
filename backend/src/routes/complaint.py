import os
import requests
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import base64
from io import BytesIO

complaint_bp = Blueprint('complaint', __name__)

# Resend API configuration
RESEND_API_KEY = "re_ZzeJT8C1_HZSHB7ZeJ5Jupxde5zBE4e6D"
RESEND_API_URL = "https://api.resend.com/emails"
ADMIN_EMAIL = "iftekharm802@gmail.com"  # Email where complaints will be sent
FROM_EMAIL = "hello@fashionpalletbd.xyz"  # Verified sender email

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@complaint_bp.route('/submit-complaint', methods=['POST'])
def submit_complaint():
    try:
        # Get form data
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        floor = request.form.get('floor', '').strip()
        room = request.form.get('room', '').strip()
        complaint = request.form.get('complaint', '').strip()
        
        # Validate required fields
        if not all([name, email, floor, room, complaint]):
            return jsonify({
                'success': False,
                'message': 'Please fill in all required fields'
            }), 400
        
        # Handle image upload
        image_attachment = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                try:
                    # Check file size
                    file.seek(0, os.SEEK_END)
                    file_size = file.tell()
                    file.seek(0)
                    
                    if file_size > MAX_FILE_SIZE:
                        return jsonify({
                            'success': False,
                            'message': 'Image file is too large. Maximum size is 100MB.'
                        }), 400
                    
                    # Read image data directly
                    image_data = file.read()
                    image_base64 = base64.b64encode(image_data).decode('utf-8')
                    
                    # Get file extension
                    filename = secure_filename(file.filename)
                    file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
                    
                    image_attachment = {
                        'filename': f'complaint_image.{file_ext}',
                        'content': image_base64,
                        'content_type': f'image/{file_ext}'
                    }
                except Exception as e:
                    print(f"Error processing image: {e}")
                    return jsonify({
                        'success': False,
                        'message': 'Error processing uploaded image'
                    }), 400
        
        # Prepare email content
        email_subject = f"New Complaint from Rose Villa - Floor {floor}, Room {room}"
        
        email_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #2563eb, #e11d48); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #374151; }}
                .value {{ margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #2563eb; }}
                .complaint-text {{ background: #fef3c7; border-left-color: #f59e0b; }}
                .footer {{ margin-top: 20px; padding: 15px; background: #e5e7eb; border-radius: 4px; text-align: center; font-size: 14px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🏢 Rose Villa - New Complaint</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Complaint & Feedback System</p>
                </div>
                
                <div class="content">
                    <div class="field">
                        <div class="label">👤 Full Name:</div>
                        <div class="value">{name}</div>
                    </div>
                    
                    <div class="field">
                        <div class="label">📧 Email Address:</div>
                        <div class="value">{email}</div>
                    </div>
                    
                    {f'<div class="field"><div class="label">📱 Phone Number:</div><div class="value">{phone}</div></div>' if phone else ''}
                    
                    <div class="field">
                        <div class="label">🏢 Floor Number:</div>
                        <div class="value">{floor}</div>
                    </div>
                    
                    <div class="field">
                        <div class="label">🚪 Room Number:</div>
                        <div class="value">{room}</div>
                    </div>
                    
                    <div class="field">
                        <div class="label">📝 Complaint Details:</div>
                        <div class="value complaint-text">{complaint}</div>
                    </div>
                    
                    {f'<div class="field"><div class="label">📎 Image Attached:</div><div class="value">✅ Yes (see attachment)</div></div>' if image_attachment else '<div class="field"><div class="label">📎 Image Attached:</div><div class="value">❌ No</div></div>'}
                </div>
                
                <div class="footer">
                    <p>This complaint was submitted through the Rose Villa Complaint & Feedback System.</p>
                    <p>Please respond to the complainant at: <strong>{email}</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Prepare email payload
        email_data = {
            "from": FROM_EMAIL,
            "to": [ADMIN_EMAIL],
            "subject": email_subject,
            "html": email_html
        }
        
        # Add attachment if image was uploaded
        if image_attachment:
            email_data["attachments"] = [image_attachment]
        
        # Send email via Resend API
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(RESEND_API_URL, json=email_data, headers=headers)
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'message': 'Your complaint has been submitted successfully! We will get back to you soon.',
                'email_id': response.json().get('id')
            }), 200
        else:
            print(f"Resend API error: {response.status_code} - {response.text}")
            return jsonify({
                'success': False,
                'message': 'Failed to send complaint email. Please try again or contact us directly.',
                'error': response.text
            }), 500
            
    except Exception as e:
        print(f"Error submitting complaint: {e}")
        return jsonify({
            'success': False,
            'message': 'An unexpected error occurred. Please try again later.'
        }), 500

@complaint_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Rose Villa Complaint System'
    }), 200

