<img width="2281" height="263" alt="Nero Launcher" src="https://github.com/user-attachments/assets/f59dabf5-1987-44d3-928e-a0a63de0aa9e" />

<br>
<br>



<img width="1121" height="729" alt="screenshot-2026-03-13_20-23-20" src="https://github.com/user-attachments/assets/1ac5c029-361d-49d7-a202-c0b797aea383" />

# Usage 
<pre>
Usage: nero-launcher [options] [command]

cli app launcher for linux

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  apps            search for apps
  app name        start app
  web             search the web
  aw              search the arch wiki
  start           start menu
  help [command]  display help for command
</pre>

# Run From Source

```bash
cd nero-launcher/src
bun install
bun run index.ts
```

# Config
reads config at:
```bash
~/.config/nero-launcher/config.toml
```


# Features
- [x] load flatpak apps (system,user flatpaks)
- [x] locally installed apps
- [x] user installed apps
- [x] search in the web
- [x] search in the arch wiki
