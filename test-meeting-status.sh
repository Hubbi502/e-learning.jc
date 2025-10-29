#!/bin/bash

# Script untuk testing Meeting Status Management System
# Usage: ./test-meeting-status.sh [meeting-id]

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"
MEETING_API="$BASE_URL/api/attendance/meeting"
TOGGLE_API="$BASE_URL/api/admin/meeting"
SUBMIT_API="$BASE_URL/api/attendance/submit"

# Meeting ID dari argument atau default
MEETING_ID=${1:-"test-meeting-001"}
DEVICE_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Meeting Status System Test Suite${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "Meeting ID: ${YELLOW}$MEETING_ID${NC}"
echo -e "Device ID: ${YELLOW}${DEVICE_ID:0:8}...${NC}"
echo ""

# Test 1: Get Meeting Info
echo -e "${BLUE}Test 1: Get Meeting Information${NC}"
RESPONSE=$(curl -s "$MEETING_API/$MEETING_ID")
echo "$RESPONSE" | jq '.'

IS_ACTIVE=$(echo "$RESPONSE" | jq -r '.meeting.is_active')
echo ""
echo -e "Current Status: ${YELLOW}is_active = $IS_ACTIVE${NC}"
echo ""

# Test 2: Enable Meeting
echo -e "${BLUE}Test 2: Enable Meeting (Admin)${NC}"
RESPONSE=$(curl -s -X PATCH "$TOGGLE_API/$MEETING_ID/toggle" \
  -H "Content-Type: application/json" \
  -d '{"is_active": true}')

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
MESSAGE=$(echo "$RESPONSE" | jq -r '.message')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Test 2 PASSED${NC}: $MESSAGE"
else
  echo -e "${RED}❌ Test 2 FAILED${NC}: $MESSAGE"
fi
echo ""

# Test 3: Submit Attendance saat Meeting Aktif
echo -e "${BLUE}Test 3: Submit Attendance (Meeting Active)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SUBMIT_API" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Test User Active\",
    \"class\": \"10A\",
    \"deviceId\": \"$DEVICE_ID\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✅ Test 3 PASSED${NC}: Attendance successful when meeting active (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "409" ]; then
  echo -e "${YELLOW}⚠️ Test 3 WARNING${NC}: Duplicate attendance (expected if run multiple times)"
else
  echo -e "${RED}❌ Test 3 FAILED${NC}: Expected 201, got $HTTP_CODE"
  echo -e "   Response: $BODY"
fi
echo ""

# Test 4: Disable Meeting
echo -e "${BLUE}Test 4: Disable Meeting (Admin)${NC}"
RESPONSE=$(curl -s -X PATCH "$TOGGLE_API/$MEETING_ID/toggle" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}')

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
MESSAGE=$(echo "$RESPONSE" | jq -r '.message')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Test 4 PASSED${NC}: $MESSAGE"
else
  echo -e "${RED}❌ Test 4 FAILED${NC}: $MESSAGE"
fi
echo ""

# Test 5: Submit Attendance saat Meeting Tidak Aktif
echo -e "${BLUE}Test 5: Submit Attendance (Meeting Inactive)${NC}"
DEVICE_ID_2=$(uuidgen | tr '[:upper:]' '[:lower:]')
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SUBMIT_API" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Test User Inactive\",
    \"class\": \"10B\",
    \"deviceId\": \"$DEVICE_ID_2\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "403" ]; then
  ERROR_TYPE=$(echo "$BODY" | jq -r '.type')
  echo -e "${GREEN}✅ Test 5 PASSED${NC}: Attendance blocked when meeting inactive (HTTP $HTTP_CODE)"
  echo -e "   Error Type: $ERROR_TYPE"
else
  echo -e "${RED}❌ Test 5 FAILED${NC}: Expected 403, got $HTTP_CODE"
  echo -e "   Response: $BODY"
fi
echo ""

# Test 6: Check Meeting Status via API
echo -e "${BLUE}Test 6: Verify Meeting Status${NC}"
RESPONSE=$(curl -s "$MEETING_API/$MEETING_ID")
IS_ACTIVE=$(echo "$RESPONSE" | jq -r '.meeting.is_active')
STATUS_MESSAGE=$(echo "$RESPONSE" | jq -r '.meeting.status.message')

echo -e "   is_active: ${YELLOW}$IS_ACTIVE${NC}"
echo -e "   status_message: ${YELLOW}$STATUS_MESSAGE${NC}"

if [ "$IS_ACTIVE" = "false" ]; then
  echo -e "${GREEN}✅ Test 6 PASSED${NC}: Meeting status is inactive as expected"
else
  echo -e "${RED}❌ Test 6 FAILED${NC}: Meeting status should be inactive"
fi
echo ""

# Test 7: Re-enable Meeting
echo -e "${BLUE}Test 7: Re-enable Meeting${NC}"
RESPONSE=$(curl -s -X PATCH "$TOGGLE_API/$MEETING_ID/toggle" \
  -H "Content-Type: application/json" \
  -d '{"is_active": true}')

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
MESSAGE=$(echo "$RESPONSE" | jq -r '.message')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Test 7 PASSED${NC}: $MESSAGE"
else
  echo -e "${RED}❌ Test 7 FAILED${NC}: $MESSAGE"
fi
echo ""

# Test 8: Verify Meeting Re-activated
echo -e "${BLUE}Test 8: Verify Meeting Re-activated${NC}"
RESPONSE=$(curl -s "$MEETING_API/$MEETING_ID")
IS_ACTIVE=$(echo "$RESPONSE" | jq -r '.meeting.is_active')

if [ "$IS_ACTIVE" = "true" ]; then
  echo -e "${GREEN}✅ Test 8 PASSED${NC}: Meeting successfully re-activated"
else
  echo -e "${RED}❌ Test 8 FAILED${NC}: Meeting should be active"
fi
echo ""

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "All tests completed!"
echo ""
echo -e "${YELLOW}Note:${NC}"
echo -e "• Test 3 may show duplicate warning if run multiple times"
echo -e "• Meeting is currently: ${YELLOW}$IS_ACTIVE${NC}"
echo -e "• To reset: DELETE FROM attendances WHERE meeting_id = '$MEETING_ID';"
echo ""
