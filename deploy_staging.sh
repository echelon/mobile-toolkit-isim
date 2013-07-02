#!/bin/bash 
# Sync to the staging and testing environment
shopt -s expand_aliases
alias rsync="rsync -zrpvu -e ssh --exclude-from=exclude.txt --progress"

function print_status() {
	status=$1
	length=${#1}
	echo ''
	echo $status
	for i in $(seq $length); do echo -n '-'; done
	echo ''
}

#
# DREAMHOST STATIC STAGING
#

print_status 'Staging: rsync to staging.isimobile.com'
rsync . isiglobal@isimobile.com:/home/isiglobal/staging.isimobile.com

