FROM python:3.11-slim
RUN pip install flask mysql-connector-python pyjwt
WORKDIR /app
COPY . .
CMD ["python","app.py"]
