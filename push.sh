#!/bin/bash
TOKEN=$(echo -n $GITHUB_PERSONAL_ACCESS_TOKEN | tr -d '[:space:]') && git push https://aryansajiv19:${TOKEN}@github.com/aryansajiv19/ai-fitness-app.git main
