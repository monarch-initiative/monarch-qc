# Build environment for Monarch Ingest Dashboard
This document describes the development and build environment for the Monarch Ingest Dashboard. These instructions will help you to install Node js, use nvm to manage Node versions, install npm/yarn for Node module management, and create a preview build of the Monarch Ingest Dashboard to verify a working tool-chain. If you run into any problems with this document please notify the deve3lopers so we can improve our documentation.

## Install Node js from nodejs.org or NodeSource
   * [nodejs.org](https://nodejs.org/)
   * [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md)

### Ubuntu
These are the Node js installation instructions for Ubuntu from NodeSource

#### Simple Installation
```
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```


#### Manual Installation (Simple should work for most situations)
See manual installation at [NodeSource](https://github.com/nodesource/distributions)


## Install NVM (Node Version Manager)
We use nvm to manage multiple Node js versions. This allows you to quickly install and use different versions of Node js can be helpful for testing other Node versions or managing multiple projects that depend on different versions.
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
```
For further information, see [the nvm repository](https://github.com/nvm-sh/nvm#intro).

## Project setup
Install the older Node.js version currently being used for development. We have plans to migrate this to 18.12.1 (LTS) but right now this is what is working in the current development repositoty
```
nvm install lts/fermium
nvm use lts/fermium
```
After v14.8.0 is installed you only need to use it for future setup.

You may need to change the system npm version
```
npm install -g npm@6.14.17
```

Install npm modules for the project
```
npm install
```

Test whether a working development and build environment is installed. When we move to the new tool-chain we will use preview instead of dev
```
npm run dev
# npm run preview
```
This will provide an html reference and local service to a preview of the current project.

Compile and minify for production
```
npm run build
```

## Deploy to GitHub pages
Running the deploy script will automatically build and deploy the project to github pages with any new changes
```
./deploy.sh
```

## Linting
We will use linting to improve development and maintainability
```
npm run lint
```



# Remove all build environment tools
The purpose of this section is for testing the above tool-chain. Occassionally, we should test removing all of the tools and reinstalling them using the steps above to ensure that the build tool-chain steps above are accurate and complete.


## Remove system node installations

### Ubuntu Apt Node removal instructions
Remove apt packages containing Node js installations if they are installed. You will likely not have all (or even any) of these installed but if you want to make sure that you don't have an existing Node installation on your system these should remove all Node packages. 
```
sudo apt-get purge libnode-dev
sudo apt-get purge libnode72
sudo apt-get purge nodejs
```
### Remove Node js installation from Simple Installation (Above)
If you installed Node js using the Simple Instructions above you can remove it easily with these commands.
```
sudo apt-get purge nodejs
sudo rm -r /etc/apt/sources.list.d/nodesource.list
```

## Remove NVM (Node Version Manager)
If you use nvm to manage node versions and would like to uninstall, these instructions will allow you to remove it from your system.
  1. Find the directory nvm is installed to (`NVM_DIR`) from .bashrc or .profile (probably ~/.nvm) 
```
# rm -rf $NVM_DIR
rm -rf ~/.nvm
```
  2. Comment out NVM lines in .bashrc or .profile (grep for `NVM_DIR`)


1. Remove all node modules in project
```
rm -rf node_modules/
```
1. Remove Vue using yarn
    * ``
2. Remove yarn
    * ``
3. Remove node versions
4. Remove nvm

