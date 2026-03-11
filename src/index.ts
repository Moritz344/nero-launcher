import { input, search } from '@inquirer/prompts';
import { spawn, exec } from 'child_process';
import os from 'os';
import { Command } from "commander";
import chalk from 'chalk';
import open from 'open';
import toml from 'bun:toml';
import { readdir } from 'fs/promises';
import { readFileSync } from 'fs';
import {
  GruvboxTheme,
  NordTheme
} from "./themes.ts";

// TODO: theme is not working for web search only working when start => web

var config: any;
var userTheme: any;
var webSearchEngine: string = "";


async function loadConfigFile() {
  try {
    Bun.file('config.toml').text().then(text => {
      config = toml.parse(text);
      let searchEngineInput = config.general.web_search_engine;
      let userThemeInput = config.interface.theme;

      // set search engine to use for web search
      if (searchEngineInput == "duckduckgo") {
        webSearchEngine = "duckduckgo.com";
      } else if (searchEngineInput == "google") {
        webSearchEngine = "google.com";
      } else {
        webSearchEngine = "google.com";
      }

      // set user theme
      if (userThemeInput.toLowerCase() == "gruvbox") {
        userTheme = GruvboxTheme;
      } else if (userThemeInput.toLowerCase() == "nord") {
        userTheme = NordTheme;
      }

    });

  } catch (err) {
    console.log("Error loading config:", err);
  }
}

var searchMode: "app" | "web" | "start" = "app";

const program = new Command();

async function HandleArgv() {
  program
    .name("nero-launcher")
    .description("cli app launcher for linux")
    .version("0.0.0");

  program
    .command("app")
    .action(() => {
      searchMode = "app";
      initSearchModeApp();
      return;
    });

  program
    .command("web")
    .action(() => {
      searchMode = "web";
      initSearchModeWeb();
      return;
    });

  program
    .command("start")
    .action(() => {
      searchMode = "start";
      initStartMenu();
      return;
    });

  if (process.argv.length <= 2) {
    searchMode = "start";
    initStartMenu();
    return;
  }



  program.parse(process.argv);
}



async function initDesktopFiles(path: string) {
  let desktopFiles = await readdir(path);
  let filteredFiles = desktopFiles.filter((element: any) => element.endsWith('.desktop'));

  let filesArray: { exec: any, name: string, desc: string }[] = [{ exec: "", name: "", desc: "" }];

  filteredFiles.forEach((file: any) => {
    const content = readFileSync(`${path}${file}`, 'utf-8');
    const exec = content.match(/^Exec=(.+)$/m)?.[1];
    const name = content.match(/^Name=(.*)$/m)?.[1] || file;
    const desc = content.match(/^Comment=(.*)$/m)?.[1] || '';
    filesArray.push({ exec: exec, name: name, desc: desc })
  });
  return filesArray;

}

function getUserInfo() {
  return os.userInfo();
}

async function launch(e: any) {
  if (!e) {
    console.log("Error: ", e)
    return;
  }
  const args = e.split(' ');
  const cmd = args.shift();
  spawn(cmd!, args, { stdio: (config.general.show_stdout) ? 'inherit' : 'ignore' });
}

async function searchApp(apps: any) {
  try {
    const answer = await search({
      message: 'app',
      theme: userTheme,
      source: async (input) => {
        if (!input) {
          return apps;
        }

        const filtered = apps.filter((app: any) =>
          app.name.toLowerCase().includes(input.toLowerCase())
        );

        return filtered.map((app: any) => ({
          name: app.name,
          value: app.exec,
          description: app.desc,
        }));
      },
    });
    if (answer) {
      launch(answer);
    }
  } catch (err) {
    return;
  }
}


async function initSearchModeApp() {
  console.clear();
  let userInfo: any = getUserInfo();
  let appsLocal = await initDesktopFiles("/usr/share/applications/"); // localy installed apps
  let appsUser = await initDesktopFiles(userInfo.homedir + "/.local/share/applications/"); // user installed apps
  let mergedArray = appsLocal.concat(appsUser);
  mergedArray.shift();
  searchApp(mergedArray);

}

async function initStartMenu() {
  console.clear();
  try {
    let userInfo: any = getUserInfo();
    console.log(userInfo.username);
    console.log("type " + chalk.yellow('app') + ' to search for apps');
    console.log("type " + chalk.yellow('web') + ' to search in the web');
    const answer = await input({ message: '' });
    if (answer == "app") {
      initSearchModeApp();
    } else if (answer == "web") {
      initSearchModeWeb();
    }
  } catch (err) {
    process.exit(0);
  }



}

async function initSearchModeWeb() {
  console.clear();
  try {

    const webSearch = await input({ message: 'web', theme: userTheme });
    await open('https://' + webSearchEngine + '/search?q=' + webSearch);
  } catch (err) {
    process.exit(0);
  }

}

async function main() {
  await loadConfigFile();
  await HandleArgv();
}

main();
