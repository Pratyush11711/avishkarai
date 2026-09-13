@echo off
title Lusion Hero Section Standalone
echo Starting standalone hero on http://localhost:5500/ ...
start "" "http://localhost:5500/"
python serve.py
pause
