from flask import Flask, render_template, request, flash, redirect, url_for
import os

app = Flask(__name__)
app.secret_key = os.urandom(24) # A secret key for flashing messages

# Route for the home page
@app.route('/')
def home():
    return render_template('index.html')

# Route for handling contact form submission
@app.route('/contact', methods=['POST'])
def contact():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        message = request.form['message']

        # In a real application, you would:
        # 1. Validate the input (e.g., check for empty fields, valid email format)
        # 2. Store the message in a database
        # 3. Send an email to yourself with the message
        # For this basic template, we'll just print to console and flash a message.

        print(f"New contact form submission:")
        print(f"Name: {name}")
        print(f"Email: {email}")
        print(f"Message: {message}")

        flash('Your message has been sent successfully! We will get back to you shortly.', 'success')
        return redirect(url_for('home')) # Redirect back to the home page

if __name__ == '__main__':
    # For development, run with debug=True
    # In production, use a production-ready WSGI server like Gunicorn or uWSGI
    app.run(debug=True)