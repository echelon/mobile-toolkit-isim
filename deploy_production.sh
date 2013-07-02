#!/bin/bash 
# Sync to the production environment
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


print_status 'Compiling LESS'
lessc --yui-compress css/design.less > css/design.out.css

#
# DREAMHOST STATIC PRODUCTION
#

print_status 'Deploy Production: rsync to isimobile.com'
rsync . isiglobal@isimobile.com:/home/isiglobal/isimobile.com

