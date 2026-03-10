import { input, search } from '@inquirer/prompts';
import { readdir } from 'fs/promises';
import { readFileSync } from 'fs';
import { spawn, exec } from 'child_process';
import os from 'os';
import { Command } from "commander";
import chalk from 'chalk';
import open from 'open';

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
    });

  program
    .command("web")
    .action(() => {
      searchMode = "web";
    });

  program
    .command("start")
    .action(() => {
      searchMode = "start";
    });


  program.parse(process.argv);
}
HandleArgv();

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
  exec(e, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      return;
    }
    //console.log(stdout);
  });
  //process.exit(0);
}

async function searchApp(apps: any) {
  try {
    const answer = await search({
      message: 'app',
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
      console.log(answer);
    }
  } catch (err) {
    console.log("Goodbye");
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
    console.log("Goodbye");
    return;
  }



}

async function initSearchModeWeb() {
  console.clear();
  try {
    const webSearch = await input({ message: 'web' });
    await open('https://google.com/search?q=' + webSearch);
  } catch (err) {
    console.log("Goodbye");
    return;
  }

}

async function main() {
  switch (searchMode) {
    case "app":
      initSearchModeApp();
      break;
    case "web":
      initSearchModeWeb();
      break;
    case "start":
      initStartMenu();
      break;
  }


}

main();
