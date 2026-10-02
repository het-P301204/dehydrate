FROM python:3.11-slim

WORKDIR /app

RUN useradd -u 1000 -m labuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
RUN mkdir -p /app/events && chown -R labuser:labuser /app

USER labuser

EXPOSE 8080
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
