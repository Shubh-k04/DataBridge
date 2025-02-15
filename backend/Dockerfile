# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install mysql-connector-python
RUN pip install pandas
RUN pip install pymongo
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the rest of the application code
COPY . .

EXPOSE 5000

ENV FLASK_APP=app.py
ENV FLASK_ENV=development
ENV FLASK_DEBUG=1

CMD ["flask", "run", "--host=0.0.0.0", "--reload"]
