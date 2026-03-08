import { input, search } from '@inquirer/prompts';
import { readdir } from 'fs/promises';
import { readFileSync } from 'fs';
import { spawn, exec } from 'child_process';
import os from 'os';
import blessed from "blessed";

// TODO: layout it like otter-launcher
// TODO: live search changes

const screen = blessed.screen({
  smartCSR: true,
  title: "Nero Launcher",
  debug: true
});

const box = blessed.box({
  parent: screen,
  tags: true,
  top: "center",
  left: "center",
  scrollable: true,
  content: "",
  width: "40%",
  border: 'line',
  height: "100%",
  style: {
  }
});


var list = blessed.list({
  parent: box,
  label: "Apps",
  top: '100',
  left: 'center',
  width: '95%',
  height: '50%',
  border: 'line',
  vi: true,
  mouse: true,
  keys: true,
  style: {
    selected: { bg: "blue", fg: "white" },
    border: { fg: "transparent" }
  },
  items: [],
});

var detailsBox = blessed.box({
  parent: box,
  label: "Details",
  bottom: "0",
  left: "center",
  scrollable: true,
  content: "",
  width: "95%",
  border: 'line',
  height: "37%",
  style: {
    selected: { bg: "blue", fg: "white" },
    border: { fg: "white" }
  }
});

var input = blessed.textbox({
  parent: box,
  top: '0',
  left: 'center',
  width: '95%',
  height: '10%',
  inputOnFocus: true,
  label: "Search",
  mouse: true,
  border: {
    type: 'line'
  },
});

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

async function launch(e: string) {
  if (!e) {
    console.log("Error: ", e)
    return;
  }
  exec(e, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      return;
    }
  });
}

function searchApp(searchString: string, apps: any) {
  let results = apps.filter((files: any) => files.name.toLowerCase().includes(searchString.toLowerCase()));
  list.setItems(results.map((app: any) => app.name))
  screen.render();
  list.focus();
  return results;
}

function displayInfo(userInfo: any) {
  console.log(userInfo.username);
  console.log(userInfo.shell);
}

function updateDetailsBox(currentApps: any) {
  const index = list.selected;
  screen.debug(index);
  const findItem = currentApps[index];
  let detailsDesc = `\n Name: ${findItem.name}\n Exec: ${findItem.exec}\n \n Description: ${findItem.desc || 'No Description found'}`;
  detailsBox.setContent(detailsDesc);
  screen.render();

}

async function main() {
  let userInfo: any = getUserInfo();
  let appsLocal = await initDesktopFiles("/usr/share/applications/"); // localy installed apps
  let appsUser = await initDesktopFiles(userInfo.homedir + "/.local/share/applications/"); // user installed apps
  let mergedArray = appsLocal.concat(appsUser);
  mergedArray.shift();

  let currentApps: any;

  input.on('submit', async (value: string) => {
    screen.debug(value);
    currentApps = searchApp(value, mergedArray);
    updateDetailsBox(currentApps);
    screen.render();
  });

  list.on("select", async (item: any, index: number) => {
    updateDetailsBox(currentApps);
    launch(currentApps[index].exec);
  });


  list.key(['up', 'down', 'j', 'k', 'C-d', 'C-u', 'g'], () => {
    updateDetailsBox(currentApps);
  });


  input.focus();

  screen.key(['escape', 'q', 'C-c'], () => {
    process.exit(0);
  });

  screen.on('error', (err: any) => {
    console.error('Screen error:', err);
  });

  screen.key(["0"], () => input.focus());
  screen.key(["1"], () => list.focus());

  screen.append(box);
  box.append(list);
  screen.render();
}

main();

