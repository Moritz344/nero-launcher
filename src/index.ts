import { input, search } from '@inquirer/prompts';
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
import { resolve } from "path";

interface App {
  name: string,
  desc: string,
  exec: any
}

// TODO: show user name and ascii art make a var for the ascii art in the config file

var config: any;
var userTheme: any;
var webSearchEngine: string = "";
var searchMode: "app" | "web" | "start" | "aw" = "app";

const pkg = JSON.parse(await Bun.file(resolve(import.meta.dirname, "../package.json")).text());

async function loadConfigFile() {
  let default_config_path = os.homedir() + "/.config/nero-launcher/config.toml";
  const file = Bun.file(default_config_path);
  let fileExists = await file.exists();

  if (!fileExists) {
    await Bun.write(default_config_path, Bun.file(resolve(import.meta.dirname, "./config.toml")));
  }

  try {
    const text = await Bun.file(default_config_path).text();
    config = toml.parse(text);

    let searchEngineInput = config.general.web_search_engine;
    let userThemeInput = config.interface.theme;

    if (searchEngineInput == "duckduckgo") {
      webSearchEngine = "duckduckgo.com";
    } else if (searchEngineInput == "google") {
      webSearchEngine = "google.com";
    } else {
      webSearchEngine = "google.com";
    }

    if (userThemeInput.toLowerCase() == "gruvbox") {
      userTheme = GruvboxTheme;
    } else if (userThemeInput.toLowerCase() == "nord") {
      userTheme = NordTheme;
    }

  } catch (err) {
    console.log("Error loading config:", err);
  }
}



const program = new Command();

async function HandleArgv() {
  program
    .name("nero-launcher")
    .description("cli app launcher for linux")
    .version(pkg.version);

  program
    .command("app")
    .description("search for apps")
    .action(() => {
      searchMode = "app";
      initSearchModeApp();
      return;
    });


  program
    .command("web")
    .description("search the web")
    .action(() => {
      searchMode = "web";
      let urlToSearch = 'https://' + webSearchEngine + '/search?q=';
      initSearchModeWeb(urlToSearch, "web");
      return;
    });

  program
    .command("aw")
    .description("search the arch wiki")
    .action(() => {
      searchMode = "aw";
      let urlToSearch = 'https://wiki.archlinux.org/index.php?search=';
      initSearchModeWeb(urlToSearch, "aw");
      return;
    });

  program
    .command("start")
    .description("start menu")
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



async function initDesktopFiles(path: string): Promise<App[]> {
  let desktopFiles = await readdir(path);
  let filteredFiles = desktopFiles.filter((element: any) => element.endsWith('.desktop'));

  let filesArray: App[] = [{ exec: "", name: "", desc: "" }];

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

  // remove placeholder
  const checkArgsForPlaceholder = () => {
    args.forEach((element: any) => {
      if (element == "@@u" || element == "%u" || element == "%U" || element == "@@") {
        let index = args.indexOf(element);
        args.splice(index);
      }
    })

  }
  checkArgsForPlaceholder();


  if (args.length > 0) {
    Bun.spawn(["sh", "-c", `${cmd!} ${args.join(' ')}`], {
      cwd: process.cwd()
    });
  } else {
    Bun.spawn(["sh", "-c", cmd!]);
  }


}

async function searchApp(apps: App[] | any) {
  try {
    const answer = await search({
      message: 'app ',
      pageSize: 20,
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
    if (!answer) {
      console.log("I was not able to launch this app", answer);
      return;
    }
    await launch(answer);
  } catch (err) {
    return;
  }
}


async function initSearchModeApp() {
  console.clear();
  let userInfo: any = getUserInfo();

  let flatpakFiles = await initDesktopFiles("/var/lib/flatpak/exports/share/applications/"); // system flatpaks
  let flatpakFilesSystem = await initDesktopFiles(userInfo.homedir + "/.local/share/flatpak/exports/share/applications/"); // user flatpaks
  let appsLocal = await initDesktopFiles("/usr/share/applications/"); // localy installed apps
  let appsUser = await initDesktopFiles(userInfo.homedir + "/.local/share/applications/"); // user installed apps

  let mergedArray = appsLocal.concat(appsUser, flatpakFiles, flatpakFilesSystem);
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
    console.log("type " + chalk.yellow('aw') + ' to search the arch wiki');
    const answer = await input({ message: '', theme: userTheme });
    if (answer == "app") {
      initSearchModeApp();
    } else if (answer == "web") {
      let urlToSearch = 'https://' + webSearchEngine + '/search?q=';
      initSearchModeWeb(urlToSearch, "web");
    } else if (answer == "aw") {
      let urlToSearch = 'https://wiki.archlinux.org/index.php?search=';
      initSearchModeWeb(urlToSearch, "aw");
    } else {
      let urlToSearch = 'https://' + webSearchEngine + '/search?q=';
      initSearchModeWeb(urlToSearch, "web");
    }
  } catch (err) {
    process.exit(0);
  }



}

async function initSearchModeWeb(urlToSearch: string, mode: "web" | "aw") {
  console.clear();
  try {
    const webSearch = await input({ message: mode, theme: userTheme });
    await open(urlToSearch + webSearch);
  } catch (err) {
    process.exit(0);
  }

}

async function main() {
  await loadConfigFile();
  await HandleArgv();
}

main();
