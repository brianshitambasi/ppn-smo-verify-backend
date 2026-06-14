#!/bin/bash

echo "========================================="
echo "PPN SMO VERIFY - COMPLETE API TEST"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5000"

echo -e "${YELLOW}1. Testing Root Endpoint...${NC}"
curl -s $BASE_URL/ | jq '.'
echo ""

echo -e "${YELLOW}2. Registering Trainee User...${NC}"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Trainee","email":"john@netmarkpro.com","password":"John123","connector":"Admin NetmarkPro"}' | jq '.'
echo ""

echo -e "${YELLOW}3. Logging in as Trainee...${NC}"
TRAINEE_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@netmarkpro.com","password":"John123"}')
echo $TRAINEE_RESPONSE | jq '.'
TRAINEE_TOKEN=$(echo $TRAINEE_RESPONSE | jq -r '.token')
echo -e "${GREEN}Trainee Token: ${TRAINEE_TOKEN}${NC}"
echo ""

echo -e "${YELLOW}4. Registering Admin User...${NC}"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@netmarkpro.com","password":"Admin123","connector":"CEO"}' | jq '.'
echo ""

echo -e "${YELLOW}5. Making user an Admin in Database...${NC}"
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(async () => { const User = require('./models/User'); await User.updateOne({email:'admin@netmarkpro.com'}, {role:'admin'}); console.log('Admin role set'); mongoose.disconnect(); }).catch(err => console.log(err));"
echo ""

echo -e "${YELLOW}6. Logging in as Admin...${NC}"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@netmarkpro.com","password":"Admin123"}')
echo $ADMIN_RESPONSE | jq '.'
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')
echo -e "${GREEN}Admin Token: ${ADMIN_TOKEN}${NC}"
echo ""

echo -e "${YELLOW}7. Seeding Tasks (38 tasks)...${NC}"
curl -s -X POST $BASE_URL/api/tasks/seed \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}8. Getting Today's Task (Trainee)...${NC}"
curl -s -X GET $BASE_URL/api/tasks/today \
  -H "Authorization: Bearer $TRAINEE_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}9. Creating Test Files...${NC}"
echo "test1" > test1.jpg
echo "test2" > test2.jpg
echo "test3" > test3.jpg
echo "notes" > notes.jpg
echo "voice" > voice.mp3
echo -e "${GREEN}Test files created${NC}"
echo ""

echo -e "${YELLOW}10. Submitting Task (Trainee)...${NC}"
SUBMIT_RESPONSE=$(curl -s -X POST $BASE_URL/api/submissions/submit \
  -H "Authorization: Bearer $TRAINEE_TOKEN" \
  -F "screenshots[]=@test1.jpg" \
  -F "screenshots[]=@test2.jpg" \
  -F "screenshots[]=@test3.jpg" \
  -F "notesPhoto=@notes.jpg" \
  -F "voiceNote=@voice.mp3" \
  -F "week=1" \
  -F "day=1")
echo $SUBMIT_RESPONSE | jq '.'
echo ""

echo -e "${YELLOW}11. Getting Pending Submissions (Admin)...${NC}"
PENDING_RESPONSE=$(curl -s -X GET $BASE_URL/api/admin/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $PENDING_RESPONSE | jq '.'
SUBMISSION_ID=$(echo $PENDING_RESPONSE | jq -r '.[0]._id')
echo -e "${GREEN}Submission ID: ${SUBMISSION_ID}${NC}"
echo ""

echo -e "${YELLOW}12. Approving Submission (Admin)...${NC}"
curl -s -X PUT $BASE_URL/api/admin/approve/$SUBMISSION_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}13. Getting Today's Task Again (Should be Day 2)...${NC}"
curl -s -X GET $BASE_URL/api/tasks/today \
  -H "Authorization: Bearer $TRAINEE_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}14. Getting All Users (Admin)...${NC}"
curl -s -X GET $BASE_URL/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}15. Getting Trainee Submissions...${NC}"
curl -s -X GET $BASE_URL/api/submissions/my/all \
  -H "Authorization: Bearer $TRAINEE_TOKEN" | jq '.'
echo ""

echo -e "${GREEN}========================================="
echo "✅ ALL TESTS COMPLETED!"
echo "=========================================${NC}"
