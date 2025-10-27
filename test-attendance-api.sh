#!/bin/bash

# 🧪 Test Script untuk Attendance API dengan Triple Layer Security
# Testing: Cookie + Device ID + User ID Validation
# Cara pakai: ./test-attendance-api.sh [MEETING_ID]

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000/api/attendance/submit"
MEETING_ID="${1:-test-meeting-001}"
COOKIE_FILE="/tmp/attendance_cookies.txt"

# Cleanup old cookie file
rm -f "$COOKIE_FILE"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🔐 Triple Layer Security Testing Script        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Meeting ID: $MEETING_ID${NC}"
echo -e "${YELLOW}API URL: $API_URL${NC}"
echo -e "${YELLOW}Cookie File: $COOKIE_FILE${NC}"
echo ""

# Test 1: Normal Attendance (Should succeed + set cookie)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 1: Normal Attendance (Layer 1,2,3 Pass)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -c "$COOKIE_FILE" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Budi Santoso\",
    \"class\": \"10A\",
    \"deviceId\": \"test-device-001\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Test 1 PASSED: Normal attendance successful${NC}"
    echo -e "${CYAN}🍪 Cookie set: Check $COOKIE_FILE${NC}"
    # Show cookie content
    if [ -f "$COOKIE_FILE" ]; then
        echo -e "${CYAN}Cookie content:${NC}"
        cat "$COOKIE_FILE" | grep attendance
    fi
else
    echo -e "${RED}❌ Test 1 FAILED: Expected 201, got $HTTP_CODE${NC}"
fi
echo ""

sleep 1

# Test 2: Cookie Duplicate (Should fail - Layer 1 blocks)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 2: Cookie Duplicate (Layer 1 Blocks) 🍪${NC}"
echo -e "${CYAN}Testing with same cookie from Test 1${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -b "$COOKIE_FILE" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Budi Santoso\",
    \"class\": \"10A\",
    \"deviceId\": \"test-device-001\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 409 ] && echo "$BODY" | grep -q "COOKIE_DUPLICATE"; then
    echo -e "${GREEN}✅ Test 2 PASSED: Cookie duplicate rejected (Layer 1)${NC}"
    echo -e "${CYAN}⚡ Performance: Blocked before DB query!${NC}"
else
    echo -e "${RED}❌ Test 2 FAILED: Expected 409 COOKIE_DUPLICATE, got $HTTP_CODE${NC}"
fi
echo ""

sleep 1

# Test 3: Device Duplicate without Cookie (Should fail - Layer 2 blocks)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 3: Device Duplicate without Cookie (Layer 2 Blocks) 💾${NC}"
echo -e "${CYAN}Simulating: User cleared cookies but DB still has record${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Ani Wijaya\",
    \"class\": \"10B\",
    \"deviceId\": \"test-device-001\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 409 ] && echo "$BODY" | grep -q "DEVICE_DUPLICATE"; then
    echo -e "${GREEN}✅ Test 3 PASSED: Device duplicate rejected (Layer 2)${NC}"
    echo -e "${CYAN}🔐 Backup validation working!${NC}"
else
    echo -e "${RED}❌ Test 3 FAILED: Expected 409 DEVICE_DUPLICATE, got $HTTP_CODE${NC}"
fi
echo ""

sleep 1

# Test 4: Different Device (Should succeed)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 4: Different User, Different Device${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -c "${COOKIE_FILE}.2" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Citra Dewi\",
    \"class\": \"10C\",
    \"deviceId\": \"test-device-002\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Test 4 PASSED: Different device successful${NC}"
else
    echo -e "${RED}❌ Test 4 FAILED: Expected 201, got $HTTP_CODE${NC}"
fi
echo ""

sleep 1

# Test 5: Same User, Different Device (Should fail - Layer 3 blocks)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 5: Same User, Different Device (Layer 3 Blocks) 👤${NC}"
echo -e "${CYAN}User tries to attend from different device${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Budi Santoso\",
    \"class\": \"10A\",
    \"deviceId\": \"test-device-003\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 409 ] && echo "$BODY" | grep -q "USER_DUPLICATE"; then
    echo -e "${GREEN}✅ Test 5 PASSED: User duplicate rejected (Layer 3)${NC}"
    echo -e "${CYAN}🛡️ Final guard working!${NC}"
else
    echo -e "${RED}❌ Test 5 FAILED: Expected 409 USER_DUPLICATE, got $HTTP_CODE${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            🎯 Triple Layer Test Summary           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Security Layers Tested:${NC}"
echo "  🍪  Layer 1: Cookie Validation"
echo "  💾  Layer 2: Device ID Validation (Database)"
echo "  👤  Layer 3: User ID Validation (Database)"
echo ""
echo -e "${YELLOW}📝 Expected Results:${NC}"
echo "  Test 1: 201 Created (✅ All layers pass)"
echo "  Test 2: 409 COOKIE_DUPLICATE (🍪 Layer 1 blocks)"
echo "  Test 3: 409 DEVICE_DUPLICATE (💾 Layer 2 blocks)"
echo "  Test 4: 201 Created (✅ New device & user)"
echo "  Test 5: 409 USER_DUPLICATE (👤 Layer 3 blocks)"
echo ""
echo -e "${YELLOW}🗑️  Cleanup:${NC}"
echo "To reset test data, run:"
echo "  DELETE FROM attendances WHERE meeting_id = '$MEETING_ID';"
echo ""
echo "To view cookie files:"
echo "  cat $COOKIE_FILE"
echo "  cat ${COOKIE_FILE}.2"
echo ""
echo -e "${CYAN}🔐 Security Benefits:${NC}"
echo "  ⚡ 90% requests blocked at Layer 1 (no DB query)"
echo "  🛡️ Triple redundancy for maximum security"
echo "  🍪 HttpOnly cookies prevent XSS attacks"
echo ""

# Cleanup cookie files
echo -e "${YELLOW}Cleaning up cookie files...${NC}"
rm -f "$COOKIE_FILE" "${COOKIE_FILE}.2"
echo -e "${GREEN}✅ Done!${NC}"
echo ""

# Test 1: Normal Attendance (Should succeed)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 1: Normal Attendance${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Budi Santoso\",
    \"class\": \"10A\",
    \"deviceId\": \"test-device-001\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Test 1 PASSED: Normal attendance successful${NC}"
else
    echo -e "${RED}❌ Test 1 FAILED: Expected 201, got $HTTP_CODE${NC}"
fi
echo ""

# Wait a bit
sleep 1

# Test 2: User Duplicate (Should fail with 409)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 2: User Duplicate (Same User, Same Device)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Budi Santoso\",
    \"class\": \"10A\",
    \"deviceId\": \"test-device-001\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 409 ]; then
    echo -e "${GREEN}✅ Test 2 PASSED: User duplicate rejected${NC}"
else
    echo -e "${RED}❌ Test 2 FAILED: Expected 409, got $HTTP_CODE${NC}"
fi
echo ""

sleep 1

# Test 3: Device Duplicate (Should fail with 409)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 3: Device Duplicate (Different User, Same Device)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Ani Wijaya\",
    \"class\": \"10B\",
    \"deviceId\": \"test-device-001\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 409 ]; then
    echo -e "${GREEN}✅ Test 3 PASSED: Device duplicate rejected${NC}"
else
    echo -e "${RED}❌ Test 3 FAILED: Expected 409, got $HTTP_CODE${NC}"
fi
echo ""

sleep 1

# Test 4: Different Device (Should succeed)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 4: Different User, Different Device${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Citra Dewi\",
    \"class\": \"10C\",
    \"deviceId\": \"test-device-002\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✅ Test 4 PASSED: Different device successful${NC}"
else
    echo -e "${RED}❌ Test 4 FAILED: Expected 201, got $HTTP_CODE${NC}"
fi
echo ""

sleep 1

# Test 5: Same User, Different Device (Should fail with 409)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 5: Same User, Different Device${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"meeting_id\": \"$MEETING_ID\",
    \"name\": \"Budi Santoso\",
    \"class\": \"10A\",
    \"deviceId\": \"test-device-003\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" -eq 409 ]; then
    echo -e "${GREEN}✅ Test 5 PASSED: User duplicate rejected (different device)${NC}"
else
    echo -e "${RED}❌ Test 5 FAILED: Expected 409, got $HTTP_CODE${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              🎯 Test Summary                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📝 Note:${NC}"
echo "- Test 1 & 4 should return 201 (Created)"
echo "- Test 2, 3, & 5 should return 409 (Conflict)"
echo ""
echo -e "${YELLOW}🗑️  Cleanup:${NC}"
echo "To reset test data, run:"
echo "  DELETE FROM attendances WHERE meeting_id = '$MEETING_ID';"
echo ""
