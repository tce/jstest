#!/bin/bash
/opt/local/bin/mongod --bind_ip 163.118.75.56 --smallfiles --port 3002 --dbpath /Users/teskridge/code/jstest/meteor/leaderboard/.meteor/local/db &
export MONGO_URL=mongodb://163.118.75.56:3002/meteor
meteor