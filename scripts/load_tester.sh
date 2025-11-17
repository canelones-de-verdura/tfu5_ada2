#!/bin/bash

INTERVAL=${1:-3}
GATEWAY_URL="http://localhost:8080"

echo "Levantando load tester - Intervalo: ${INTERVAL}s"

counter=0

while true; do
    counter=$((counter + 1))
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo ""
    echo "[$timestamp] Request #$counter"
    echo "---"
    
    echo "GET a /api/customers atrás del gateway"
    customer_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${GATEWAY_URL}/api/customers" 2>/dev/null)
    customer_code=$(echo "$customer_response" | grep "HTTP_CODE:" | cut -d: -f2)
    customer_body=$(echo "$customer_response" | sed '/HTTP_CODE:/d')
    
    if [ "$customer_code" = "200" ]; then
        customer_count=$(echo "$customer_body" | grep -o '"id"' | wc -l | xargs)
        echo "Status: $customer_code - Customers: $customer_count"
    else
        echo "Status: ${customer_code:-ERROR}"
    fi
    
    echo "GET a /api/products atrás del gateway"
    product_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${GATEWAY_URL}/api/products" 2>/dev/null)
    product_code=$(echo "$product_response" | grep "HTTP_CODE:" | cut -d: -f2)
    product_body=$(echo "$product_response" | sed '/HTTP_CODE:/d')
    
    if [ "$product_code" = "200" ]; then
        product_count=$(echo "$product_body" | grep -o '"id"' | wc -l | xargs)
        echo "Status: $product_code - Products: $product_count"
    else
        echo "Status: ${product_code:-ERROR}"
    fi
    
    sleep "$INTERVAL"
done
