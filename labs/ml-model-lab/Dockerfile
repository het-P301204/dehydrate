FROM python:3.11-slim

WORKDIR /lab

RUN useradd -u 1000 -m labuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
RUN chown -R labuser:labuser /lab

USER labuser

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
