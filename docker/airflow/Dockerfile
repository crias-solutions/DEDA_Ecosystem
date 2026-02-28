FROM apache/airflow:2.8.3-python3.11

USER root

RUN apt-get update && apt-get install -y \
    docker.io \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    apache-airflow-providers-docker==5.1.0 \
    psycopg2-binary==2.9.9

COPY requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt

USER airflow
