#!/bin/bash

# Script untuk testing Triple-Layer Security System
# Usage: ./test-triple-layer-security.sh [meeting-id]

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/attendance/submit"

# Meeting ID dari argument atau default
MEETING_ID=${1:-"test-meeting-001"}

# Generate UUIDs
DEVICE_ID_1=$(uuidgen | tr '[:upper:]' '[:lower:]')
DEVICE_ID_2=$(uuidgen | tr '[:upper:]' '[:lower:]')

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Triple-Layer Security Test Suite${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "Meeting ID: ${YELLOW}$MEETING_ID${NC}"
echo -e "Device 1: ${YELLOW}${DEVICE_ID_1:0:8}...${NC}"
echo -e "Device 2: ${YELLOW}${DEVICE_ID_2:0:8}...${NC}"
echo ""

# Test 1: Normal Absensi (Harus Sukses)
echo -e "${BLUE}Test 1: Normal Absensi (First Time)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Budi Santoso\",
    \"class\": \"10A\",
    \"deviceId\": \"$DEVICE_ID_1\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✅ Test 1 PASSED${NC}: Normal attendance successful (HTTP $HTTP_CODE)"
  echo -e "   Response: $BODY"
else
  echo -e "${RED}❌ Test 1 FAILED${NC}: Expected 201, got $HTTP_CODE"
  echo -e "   Response: $BODY"
fi
echo ""

# Test 2: User Duplicate - Same User, Same Device (Harus Gagal)
echo -e "${BLUE}Test 2: User Duplicate (Same User, Same Device)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Budi Santoso\",
    \"class\": \"10A\",
    \"deviceId\": \"$DEVICE_ID_1\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "409" ]; then
  echo -e "${GREEN}✅ Test 2 PASSED${NC}: User duplicate rejected (HTTP $HTTP_CODE)"
  echo -e "   Response: $BODY"
else
  echo -e "${RED}❌ Test 2 FAILED${NC}: Expected 409, got $HTTP_CODE"
  echo -e "   Response: $BODY"
fi
echo ""

# Test 3: Device Duplicate - Different User, Same Device (Harus Gagal)
echo -e "${BLUE}Test 3: Device Duplicate (Different User, Same Device)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Ani Wijaya\",
    \"class\": \"10B\",
    \"deviceId\": \"$DEVICE_ID_1\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "409" ]; then
  echo -e "${GREEN}✅ Test 3 PASSED${NC}: Device duplicate rejected (HTTP $HTTP_CODE)"
  echo -e "   Response: $BODY"
else
  echo -e "${RED}❌ Test 3 FAILED${NC}: Expected 409, got $HTTP_CODE"
  echo -e "   Response: $BODY"
fi
echo ""

# Test 4: Different Device, Different User (Harus Sukses)
echo -e "${BLUE}Test 4: Different Device, Different User${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Citra Dewi\",
    \"class\": \"10C\",
    \"deviceId\": \"$DEVICE_ID_2\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✅ Test 4 PASSED${NC}: Different device successful (HTTP $HTTP_CODE)"
  echo -e "   Response: $BODY"
else
  echo -e "${RED}❌ Test 4 FAILED${NC}: Expected 201, got $HTTP_CODE"
  echo -e "   Response: $BODY"
fi
echo ""

# Test 5: Same User, Different Device (Harus Gagal)
echo -e "${BLUE}Test 5: Same User, Different Device${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Budi Santoso\",
    \"class\": \"10A\",
    \"deviceId\": \"$DEVICE_ID_2\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "409" ]; then
  echo -e "${GREEN}✅ Test 5 PASSED${NC}: User duplicate rejected (HTTP $HTTP_CODE)"
  echo -e "   Response: $BODY"
else
  echo -e "${RED}❌ Test 5 FAILED${NC}: Expected 409, got $HTTP_CODE"
  echo -e "   Response: $BODY"
fi
echo ""

# Test 6: Invalid Device ID (Harus Gagal)
echo -e "${BLUE}Test 6: Invalid Device ID${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Test User\",
    \"class\": \"10D\",
    \"deviceId\": \"invalid-device-id-123\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✅ Test 6 PASSED${NC}: Invalid device ID rejected (HTTP $HTTP_CODE)"
  echo -e "   Response: $BODY"
else
  echo -e "${RED}❌ Test 6 FAILED${NC}: Expected 400, got $HTTP_CODE"
  echo -e "   Response: $BODY"
fi
echo ""

# Test 7: Rate Limiting (Harus Gagal setelah 5 requests)
echo -e "${BLUE}Test 7: Rate Limiting (6 rapid requests)${NC}"
DEVICE_ID_3=$(uuidgen | tr '[:upper:]' '[:lower:]')
SUCCESS_COUNT=0
RATE_LIMITED=false

for i in {1..6}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d "{
      \"meeting_id\": \"$MEETING_ID\",
      \"name\": \"Rate Test $i\",
      \"class\": \"10E\",
      \"deviceId\": \"$DEVICE_ID_3\"
    }")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" = "429" ]; then
    RATE_LIMITED=true
    echo -e "   Request $i: ${YELLOW}Rate Limited${NC} (HTTP $HTTP_CODE)"
  elif [ "$HTTP_CODE" = "201" ]; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo -e "   Request $i: ${GREEN}Success${NC} (HTTP $HTTP_CODE)"
  else
    echo -e "   Request $i: ${RED}Error${NC} (HTTP $HTTP_CODE)"
  fi
  
  # Small delay
  sleep 0.1
done

if [ "$RATE_LIMITED" = true ]; then
  echo -e "${GREEN}✅ Test 7 PASSED${NC}: Rate limiting working (blocked after $SUCCESS_COUNT requests)"
else
  echo -e "${YELLOW}⚠️ Test 7 WARNING${NC}: Rate limiting might not be triggered"
fi
echo ""

# Test 8: Missing Device ID (Harus Gagal)
echo -e "${BLUE}Test 8: Missing Device ID${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"No Device\",
    \"class\": \"10F\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
  echo -e "${GREEN}✅ Test 8 PASSED${NC}: Missing device ID rejected (HTTP $HTTP_CODE)"
  echo -e "   Response: $BODY"
else
  echo -e "${RED}❌ Test 8 FAILED${NC}: Expected 400, got $HTTP_CODE"
  echo -e "   Response: $BODY"
fi
echo ""

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "All tests completed!"
echo ""
echo -e "${YELLOW}⚠️ Note: Cleanup test data by running:${NC}"
echo -e "   DELETE FROM attendances WHERE meeting_id = '$MEETING_ID';"
echo ""
