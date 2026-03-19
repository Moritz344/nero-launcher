import chalk from "chalk";

export const GruvboxTheme = {
  prefix: {
    idle: chalk.hex("#fabd2f")("❯"), // yellow
    done: chalk.hex("#b8bb26")("✔"), // green
  },
  spinner: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
  style: {
    answer: (txt: any) => chalk.hex("#b8bb26").bold(txt),
    message: (txt: any, status: any) => {
      if (status === "done") return chalk.hex("#928374")(txt);
      return chalk.hex("#ebdbb2")(txt);
    },
    error: (txt: any) => chalk.hex("#fb4934")(` ✖  ${txt}`),
    help: (txt: any) => chalk.hex("#83a598")(txt),
    highlight: (txt: any) => chalk.hex("#fe8019")(txt),
    description: (txt: any) => chalk.hex("#928374")(txt),
    disabled: (txt: any) => chalk.strikethrough.hex("#665c54")(txt),
    searchTerm: (txt: any) => chalk.white(txt),
  },
  icon: {
    cursor: chalk.hex("#fabd2f")("❯"),
  },
  helpMode: "never",
};

export const NordTheme = {
  prefix: {
    idle: chalk.hex("#88C0D0")("❯"),
    done: chalk.hex("#A3BE8C")("✔"),
  },
  spinner: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
  style: {
    answer: (txt: string) => chalk.hex("#A3BE8C").bold(txt),
    message: (txt: string, status: any) => {
      if (status === "done") return chalk.hex("#4C566A")(txt);
      return chalk.hex("#D8DEE9")(txt);
    },
    error: (txt: string) => chalk.hex("#BF616A")(`✖  ${txt}`),
    help: (txt: string) => chalk.hex("#81A1C1")(txt),
    highlight: (txt: string) => chalk.hex("#88C0D0")(txt),
    description: (txt: string) => chalk.hex("#616E88")(txt),
    disabled: (txt: string) => chalk.strikethrough.hex("#434C5E")(txt),
    searchTerm: (txt: string) => chalk.hex("#ECEFF4")(txt),
  },
  icon: {
    cursor: chalk.hex("#88C0D0")("❯"),
  },
  helpMode: "never",
};


