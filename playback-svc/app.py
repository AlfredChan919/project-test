from flask import Flask, send_from_directory, jsonify
import mysql.connector, os, jwt
from functools import wraps

app = Flask(__name__)
cfg = {'host':'mysql','user':'root','password':'rootpass','database':'video'}

def auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    token = None
    if 'Authorization' in request.headers:
      token = request.headers['Authorization'].split()[1]
    if not token: return '', 401
    try:
      decoded = jwt.decode(token, 'SECRET', algorithms=['HS256'])
    except: return '', 403
    return f(*args, **kwargs)
  return decorated

@app.route('/videos')
@auth
def list_videos():
  cnx = mysql.connector.connect(**cfg)
  cur = cnx.cursor(dictionary=True)
  cur.execute("SELECT id,name FROM videos")
  rows = cur.fetchall()
  cnx.close()
  return jsonify(rows)

@app.route('/video/<int vid>')
@auth
def serve_video(vid):
  cnx = mysql.connector.connect(**cfg)
  cur = cnx.cursor()
  cur.execute("SELECT path FROM videos WHERE id=%s", (vid,))
  row = cur.fetchone()
  cnx.close()
  if not row: return '', 404
  return send_from_directory('/storage', row[0])

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=3003)
