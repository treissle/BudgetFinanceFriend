from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
import MySQLdb.cursors


app = Flask(__name__)

app.secret_key = 'cactus'

app.config['MYSQL_HOST'] = '107.180.1.16'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'spring2024Cteam10'
app.config['MYSQL_PASSWORD'] = 'spring2024Cteam10'
app.config['MYSQL_DB'] = 'spring2024Cteam10'

mysql = MySQL(app)

@app.route('/')
@app.route('/login', methods =['GET','POST'])
def login():
	msg = ''
	if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
		username = request.form['username']
		password = request.form['password']
		cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
		cursor.execute('SELECT * FROM 401K WHERE username = % s AND password = % s', (username, password, ))
		account = cursor.fetchone()
		if account:
			session['loggedin'] = True
			session['id'] = account['id']
			session['username'] = account['username']
			msg = 'Logged in successfully !'
			return render_template('401k.html', msg = msg, username=username)
		else:
			msg = 'Incorrect username and/or password, please try again'
	return render_template('login.html', msg = msg)

@app.route('/save_user_inputs', methods=['POST'])
def save_user_inputs():
    if 'loggedin' in session:
        username = session['username']
        user_inputs = {
            'currentAge': request.form['currentAge'],
            'currentSalary': request.form['currentSalary'],
            'currentBalance': request.form['currentBalance'],
            'contributionPercentage': request.form['contributionPercentage'],
            'employerMatch': request.form['employerMatch'],
            'employerMatchLimit': request.form['employerMatchLimit'],
            'retirementAge': request.form['retirementAge']
        }

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("""
            UPDATE 401K
            SET 
                currentAge = %(currentAge)s,
                currentSalary = %(currentSalary)s,
                currentBalance = %(currentBalance)s,
                contributionPercentage = %(contributionPercentage)s,
                employerMatch = %(employerMatch)s,
                employerMatchLimit = %(employerMatchLimit)s,
                retirementAge = %(retirementAge)s,
		saved =1
            WHERE username = %(username)s
        """, {'username': username, **user_inputs})

        mysql.connection.commit()
        cursor.close()

        return 'User inputs saved successfully!'

    return 'User not logged in!'
	
@app.route('/logout')
def logout():
	session.pop('loggedin', None)
	session.pop('id', None)
	session.pop('username', None)
	return redirect(url_for('login'))

@app.route('/register', methods =['GET','POST'])
def register():
	msg = ''
	if request.method == 'POST' and 'username' in request.form and 'password' in request.form :
		username = request.form['username']
		password = request.form['password']
		cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
		cursor.execute('SELECT * FROM 401K WHERE username = % s', (username, ))
		account = cursor.fetchone()
		if account:
			msg = 'Account already exists !'
		else:
			cursor.execute('INSERT INTO 401K VALUES (NULL, % s, % s, NULL, NULL, NULL, NULL, NULL, NULL, NULL)', (username, password, ))
			mysql.connection.commit()
			msg = 'You have successfully registered'
			return render_template('login.html', msg = msg, username=username)
	return render_template('register.html', msg = msg)

if __name__ == '__main__':
    app.run(debug=True, port=8080)
