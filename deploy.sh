#!/usr/bin/env sh

set -e

# https://cli.vuejs.org/guide/deployment.html#github-pages

# Note that this guide doesn't build an app that supports
# visiting non-root pages directly
# eg https://kshefchek.github.io/kg-covid-dash/about 404s

# See https://github.com/monarch-initiative/monarch-ui/blob/master/src/gh_404.html
# for a (probably outdated) hack around this

REMOTENAME=${1:-origin}
REMOTE=`git remote get-url --push ${REMOTENAME}`

# change to Monarch QC Dashboard (Vue + Vite) Project
cd monarch-qc-dashboard
yarn build

cd dist

# remove .git if it exists
rm -rf .git

# initialize new git environment and commit changes
git init
git add -A
git commit -m 'deploy to gh-pages'

# add remote and force push new updated to gh-pages
git remote add ${REMOTENAME} ${REMOTE}
git push --force ${REMOTENAME} main:gh-pages

cd -
