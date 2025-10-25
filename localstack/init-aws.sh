#!/bin/bash

ENDPOINT="http://localhost:4566"

echo "Waiting for LocalStack to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

until curl -s $ENDPOINT/_localstack/health 2>/dev/null | grep -q "\"s3\": \"running\"\|\"s3\": \"available\"" || [ $ATTEMPT -eq $MAX_ATTEMPTS ]; do
  echo "Waiting for S3 service... (attempt $((ATTEMPT+1))/$MAX_ATTEMPTS)"
  sleep 2
  ATTEMPT=$((ATTEMPT+1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "❌ LocalStack S3 service did not become available"
  exit 1
fi

echo "✅ LocalStack is ready!"
echo ""
echo "Creating S3 bucket for payruns..."

# Use curl to create bucket via LocalStack API
curl -s -X PUT "$ENDPOINT/payroo-payruns" > /dev/null 2>&1

echo "✅ Bucket created: s3://payroo-payruns"
echo "Endpoint: $ENDPOINT"
echo ""
echo "Note: CORS is automatically configured by LocalStack for local development"
echo ""
echo "To verify bucket exists, run:"
echo "  curl -s $ENDPOINT/payroo-payruns"
