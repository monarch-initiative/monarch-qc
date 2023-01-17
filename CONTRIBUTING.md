# Contribting to Monarch Ingest Dashboard
This document describes how to setup the development and build environment and contribute to the Monarch Ingest Dashboard. These instructions will help you to install Node js, use nvm to manage Node versions, install npm/yarn for Node module management, and create a preview build of the Monarch Ingest Dashboard to verify a working tool-chain. If you run into any problems with this document please see the README.md document for how to notify the developers so we can make improvements.

## Developing Monarch Ingest Dashboard in Vue + Vite (yarn) environment
If you are new to Monarch Ingest Dashboard development please see the Initial Setup section below. Otherwise, use the instructions below for development and testing to contribute to the Monarch Ingest Dashboard.

### Re-initialize Development environment
To re-initialize a newly 

## Initial Setup
### Install Node js from nodejs.org or NodeSource
You can install Node.js on your system or simply use nvm to manage versioning. If you want to use only nvm for Node.js and not install node seperately on your system.
   * [nodejs.org](https://nodejs.org/)
   * [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md)

#### Ubuntu
These are the Node js installation instructions for Ubuntu from NodeSource. You can test to see if you have node installed.
```
node -v
```

If the above exits with an error you do not have node installed and you will need to install a system Node.js to start development. If the command tells you an old Node.js version (current is v18.12.1) you can proceed or update to a newer version. We will be installing a Node.js version manager (nvm) so you should be able to leave your system node as it is without any issues.

If your system has an old version of Node.js and node is used for system management you should probably not upgrade and only use the nvm version for development.

##### Simple Installation
```
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```


##### Manual Installation (Simple should work for most situations)
See manual installation at [NodeSource](https://github.com/nodesource/distributions)


### Install NVM (Node Version Manager)
We use nvm to manage multiple Node js versions. This allows you to quickly install and use different versions of Node js can be helpful for testing other Node versions or managing multiple projects that depend on different versions.
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
```
For further information, see [the nvm repository](https://github.com/nvm-sh/nvm#intro).

### Install Node.js lts version
Install the Node.js version lts/helium for development and yarn for node module management. This is currently the most recent lts version of Node.js if a newer version is available you may want to try to use it but we know this one should be working and it is the newest lts so it should remain stable for a long time. 
```
nvm install lts/*
nvm install lts/hydrogen
nvm use lts/hydrogen
```

### Install yarn
Install yarn globally for the nvm lts/hydrogen
```
npm install -g yarn
```

---

# Initial Vue + Vite creation using yarn
These are the initial steps used to create this Vue + Vite project. 
Create top-level directory. We will use this for git repository management and node module management (yarn).
```
mkdir monarach-ingest-dashboard
cd monarch-ingest-dashboard
git init
```

Make sure we're using the correct node version.
```
nvm use lts/hydrogen
```

Install yarn globaly for the lts Node.js version we are using
```
npm install -g yarn
yarn install
yarn create vite
```

Follow the prompts to choose a setup with Vue and Typescript with a project name of monarch-ingest-dashboard.

Finish Vue + Vite setup and test preview

```
cd monarch-ingest-dashboard
yarn
yarn dev
```

# npm run preview
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
yarn lint
```

---

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


3. Remove all node modules in project
```
rm -rf node_modules/
```
