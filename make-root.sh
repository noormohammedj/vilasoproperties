#!/bin/sh
# Builds the home page (/index.html) from sample1/index.html so the site opens at vilasoproperties.com/
# with no redirect. Run after changing sample1/index.html:  sh make-root.sh
cd "$(dirname "$0")"
sed -E 's#(href|src)="(style\.css|data\.js|fx\.js|app\.js)#\1="sample1/\2#g' sample1/index.html > index.html
