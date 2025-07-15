import childProcess, { ChildProcessWithoutNullStreams } from "child_process";

const song = process.cwd() + "/src/static/soback.mp3";

export interface FFMpegOptions {
  rtpPort: number;
  rtcpPort?: number;
}

export class FFmpeg {
  constructor(options: FFMpegOptions) {
    this.options = options;
    this.createProcess();
    this.initListeners();
  }

  private process: ChildProcessWithoutNullStreams;
  private options: FFMpegOptions;

  private createProcess() {
    this.process = childProcess.spawn("ffmpeg", this.getArgs(this.options));
  }

  private getArgs(options: FFMpegOptions) {
    return [
      "-re",
      "-v",
      "info",
      "-stream_loop",
      "-1",
      "-i",
      song,
      "-map",
      "0:a:0",
      "-acodec",
      "libopus",
      "-ab",
      "128k",
      "-ac",
      "2",
      "-ar",
      "48000",
      "-f",
      "tee",
      `[select=a:f=rtp:ssrc=11111111:payload_type=101]rtp://127.0.0.1:${options.rtpPort}?rtcpport=${options.rtcpPort}`,
    ];
  }

  private initListeners() {
    if (this.process.stderr) {
      this.process.stderr.setEncoding("utf-8");
      this.process.stderr.on("data", (data) => {
        console.log("process::stderr::data", data);
      });
    }

    if (this.process.stdout) {
      this.process.stdout.setEncoding("utf-8");
      this.process.stdout.on("data", (data) => {
        console.log("process::stdout::data", data);
      });
    }

    this.process.on("message", (message) => {
      console.log("process::message", message);
    });

    this.process.on("error", (error) => {
      console.error("process::error", error);
    });

    this.process.once("close", () => {
      console.log("process::close");
    });
  }
}
