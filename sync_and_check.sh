#!/bin/bash

echo "=================================================="
echo "   ELLAMAE BACKEND SYNC AND DIAGNOSTIC TOOL"
echo "=================================================="
echo "This script will copy the updated PHP files to your active Apache directory and check your database."
echo ""

# Find where XAMPP or Apache is installed
HTDOCS=""
if [ -d "/opt/lampp/htdocs" ]; then
    HTDOCS="/opt/lampp/htdocs"
elif [ -d "/var/www/html" ]; then
    HTDOCS="/var/www/html"
else
    # Prompt the user for their web server directory if not in standard locations
    echo "Could not find default Apache htdocs at /opt/lampp/htdocs or /var/www/html."
    read -p "Please enter the absolute path to your Apache htdocs/web-root folder: " HTDOCS
fi

if [ -z "$HTDOCS" ] || [ ! -d "$HTDOCS" ]; then
    echo "Error: Invalid web server directory. Exiting."
    exit 1
fi

DEST="$HTDOCS/luxury-backend"
echo "Target Directory: $DEST"

# Ensure the target directory exists
if [ ! -d "$DEST" ]; then
    echo "Creating directory: $DEST"
    sudo mkdir -p "$DEST"
    sudo chmod 755 "$DEST"
fi

# Copy the updated files
echo "Copying PHP files..."
sudo cp -v /home/akash/luxuary.feature/ellamae/luxury-backend/*.php "$DEST/"

# Fix permissions
sudo chmod 644 "$DEST"/*.php
sudo chown -R daemon:daemon "$DEST" 2>/dev/null || sudo chown -R www-data:www-data "$DEST" 2>/dev/null

echo ""
echo "=================================================="
echo "              VERIFYING SYNC STATUS"
echo "=================================================="
# Test if the local dbtest.php is updated and accessible
TEST_RES=$(curl -s http://localhost/luxury-backend/dbtest.php)
echo "Response from http://localhost/luxury-backend/dbtest.php:"
echo "--------------------------------------------------"
echo "$TEST_RES"
echo "--------------------------------------------------"

if [[ "$TEST_RES" == *"DB Test"* ]]; then
    echo "✓ SUCCESS: The backend files are synced and active!"
else
    echo "✗ WARNING: The server is still not running the updated files."
    echo "Please double check if http://localhost points to $HTDOCS."
fi
echo "=================================================="
