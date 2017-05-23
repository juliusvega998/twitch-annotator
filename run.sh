#!/bin/bash

google-chrome http://localhost:3000 http://www.twitch.tv &
cd server
npm start