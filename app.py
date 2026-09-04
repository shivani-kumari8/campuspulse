from flask import Flask, request, jsonify, send_from_directory
import mysql.connector
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# -----------------------------
# MySQL Connection
# -----------------------------

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="12345",
    database="campus_pulse"
)

print("MySQL connected successfully!")


# -----------------------------
# Photo Upload Settings
# -----------------------------

UPLOAD_FOLDER = "uploads"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# -----------------------------
# Home
# -----------------------------

@app.route("/")
def home():
    return "Campus Pulse Backend is Running!"


# -----------------------------
# Submit Issue
# -----------------------------

@app.route("/submit-issue", methods=["POST"])
def submit_issue():

    try:
        title = request.form.get("title")
        description = request.form.get("description")
        category = request.form.get("category")
        location = request.form.get("location")
        severity = request.form.get("severity")
        affected_students = request.form.get("affected_students")

        # Convert affected students to number
        if affected_students:
            affected_students = int(affected_students)
        else:
            affected_students = None

        # Handle photo
        photo = request.files.get("photo")
        photo_filename = None

        if photo and photo.filename:

            filename = secure_filename(photo.filename)

            photo_filename = filename

            photo.save(
                os.path.join(
                    app.config["UPLOAD_FOLDER"],
                    filename
                )
            )

        # Insert into MySQL
        cursor = db.cursor()

        sql = """
        INSERT INTO issues
        (
            title,
            description,
            category,
            location,
            severity,
            affected_students,
            photo,
            status
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            title,
            description,
            category,
            location,
            severity,
            affected_students,
            photo_filename,
            "Reported"
        )

        cursor.execute(sql, values)

        db.commit()

        # Get ID of newly created issue
        issue_id = cursor.lastrowid

        cursor.close()

        return jsonify({
            "success": True,
            "message": "Issue submitted successfully!",
            "issue_id": issue_id
        })

    except Exception as e:

        print("ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Something went wrong."
        }), 500


# -----------------------------
# Get All Issues
# -----------------------------

@app.route("/issues", methods=["GET"])
def get_issues():

    try:

        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                title,
                description,
                category,
                location,
                severity,
                affected_students,
                photo,
                status,
                created_at
            FROM issues
            ORDER BY created_at DESC
        """)

        issues = cursor.fetchall()

        cursor.close()

        return jsonify(issues)

    except Exception as e:

        print("ERROR:", e)

        return jsonify({
            "success": False,
            "message": "Could not fetch issues."
        }), 500


# -----------------------------
# Serve Uploaded Photos
# -----------------------------

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):

    return send_from_directory(
        app.config["UPLOAD_FOLDER"],
        filename
    )


# -----------------------------
# Run Flask
# -----------------------------

if __name__ == "__main__":
    app.run(debug=True)