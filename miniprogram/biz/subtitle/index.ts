import { Handler, BaseDomain } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client/index";
import { Result } from "@/types/index";
import { MediaOriginCountry } from "@/constants/index";

import { parseSubtitleContent, parseSubtitleUrl, timeStrToSeconds } from "./utils";
import { SubtitleFileSuffix, SubtitleFileTypes, SubtitleParagraph } from "./types";

// [DOMAIN]player - load https://ccp-bj29-video-preview.oss-enet.aliyuncs.com/lt/344D6FD24209239ADF04D6958742C1412DE68210_9552465454__sha1_bj29_e78ad19a/QHD/media.m3u8?di=bj29&dr=2549939630&f=6656f6d170830ae9fa6b46f3b17d51ef075906fb&pds-params=%7B%22ap%22%3A%22pJZInNHN2dZWk8qg%22%7D&security-token=CAISvgJ1q6Ft5B2yfSjIr5fFBdXng451wPSvbBfIjzYWRttrhJL4kDz2IHhMf3NpBOkZvvQ1lGlU6%2Fcalq5rR4QAXlDfNTO8XEO9q1HPWZHInuDox55m4cTXNAr%2BIhr%2F29CoEIedZdjBe%2FCrRknZnytou9XTfimjWFrXWv%2Fgy%2BQQDLItUxK%2FcCBNCfpPOwJms7V6D3bKMuu3OROY6Qi5TmgQ41Uh1jgjtPzkkpfFtkGF1GeXkLFF%2B97DRbG%2FdNRpMZtFVNO44fd7bKKp0lQLs0ARrv4r1fMUqW2X543AUgFLhy2KKMPY99xpFgh9a7j0iCbSGyUu%2FhcRm5sw9%2Byfo34lVYneo3xWZ4tbObP7AhWvDNQ3S7jN6YihvSt3zmA4YsrdqJPW1dKDogPIx4aBwHbHMFKlwddMkwuiQothevXtuMkagAFpyPNYYT4%2BsAKSIRaJkc5HgAry3gkOJ2WquZ2sENghBA4dOwezQAWptVCbrmV5e2EzVVxiI8f%2FNZoDk7JnzJ81Fq5E%2Bkqlx1dMgMymjb7b9jsyCCcb29wZptdQly1TIdA77UN97zI2%2FCy3CXqsxh1uGZj8rPWA4enlvm574PEMqCAA&u=f4f8b630dbfa41c1be2de2ba904bacc5&x-oss-access-key-id=STS.NTpNoSnQTw6Dn1yk6CJTGkWSr&x-oss-expires=1718538097&x-oss-process=hls%2Fsign%2Cparams_ZGksZHIsZix1LHBkcy1wYXJhbXM%3D&x-oss-signature=mZUuOpHgDvuPxHL1yuncNXRvFpro%2F7U9aP4MANFvJC8%3D&x-oss-signature-version=OSS2 {"$node": {"play": "<Function: bound p>", "pause": "<Function: bound p>", "stop": "<Function: bound p>", "seek": "<Function: bound p>", "sendDanmu": "<Function: bound p>", "playbackRate": "<Function: bound p>", "requestFullScreen": "<Function: bound p>", "exitFullScreen": "<Function: bound p>", "showStatusBar": "<Function: bound p>", "hideStatusBar": "<Function: bound p>", "exitPictureInPicture": "<Function: bound p>", "requestBackgroundPlayback": "<Function: bound p>", "exitBackgroundPlayback": "<Function: bound p>", "hidePoster": "<Function: bound p>", "startCasting": "<Function: bound p>", "switchCasting": "<Function: bound p>", "reconnectCasting": "<Function: bound p>", "exitCasting": "<Function: bound p>", "_videoId": "<Undefined>", "_webviewId": "<Undefined>", "onloadstart": "<Function>", "onloadedmetadata": "<Function>", "onload": "<Function>", "oncanplay": "<Function>", "onplay": "<Function>", "onplaying": "<Function>", "ontimeupdate": "<Function>", "onpause": "<Function>", "onwaiting": "<Function>", "onended": "<Function>", "onvolumechange": "<Function>", "onresize": "<Function>", "onerror": "<Function>"}, "play": "<Function: play>", "pause": "<Function: pause>", "canPlayType": "<Function: canPlayType>", "load": "<Function: load>", "setCurrentTime": "<Function: setCurrentTime>", "setRate": "<Function: setRate>", "setVolume": "<Function: setVolume>", "requestFullscreen": "<Function: requestFullscreen>", "exitFullscreen": "<Function: exitFullscreen>", "disableFullscreen": "<Function: disableFullscreen>", "enableFullscreen": "<Function: enableFullscreen>", "showSubtitle": "<Function: showSubtitle>", "hideSubtitle": "<Function: hideSubtitle>", "showAirplay": "<Function: showAirplay>", "pictureInPicture": "<Function: pictureInPicture>"}

enum Events {
  StateChange,
}
type TheTypesOfEvents = {
  [Events.StateChange]: SubtitleState;
};
type SubtitleLine = SubtitleParagraph;
type SubtitleProps = {
  filename: string;
  language: MediaOriginCountry[];
  suffix?: SubtitleFileSuffix;
  lines: SubtitleLine[];
};
type SubtitleState = {
  curLine: SubtitleLine | null;
};

export class SubtitleCore extends BaseDomain<TheTypesOfEvents> {
  static async New(
    subtitle: { id: string; type: SubtitleFileTypes; url: string; name: string; language: MediaOriginCountry[] },
    extra: { currentTime?: number; hostname?: string; proxy?: boolean; client: HttpClientCore }
  ) {
    const { id, name, type, url, language } = subtitle;
    const { client } = extra;
    // console.log('[DOMAIN]biz/subtitle/index - New function', type, url);
    const content_res = await (async () => {
      if (type === SubtitleFileTypes.MediaInnerFile) {
        const r = await (async () => {
          try {
            const r = await client.fetch<string>({
              // url: ["https://media.funzm.com/api/v2/wechat/proxy?url=", encodeURIComponent(url)].join(""),
              url,
              method: "GET",
              headers: {
                Referer: "",
              },
            });
            return Result.Ok(r.data);
          } catch (err) {
            const e = err as Error;
            return Result.Err(e.message);
          }
        })();
        if (r.error) {
          return Result.Err(r.error);
        }
        return Result.Ok({
          name,
          content: r.data,
        });
      }
      if (type === SubtitleFileTypes.LocalFile) {
        try {
          const r = await client.fetch<string>({
            url: (() => {
              if (url.startsWith("http")) {
                return url;
              }
              return [extra.hostname, url].filter(Boolean).join("");
            })(),
            method: "GET",
          });
          return Result.Ok({
            name,
            content: r.data,
          });
        } catch (err) {
          const e = err as Error;
          return Result.Err(e.message);
        }
      }
      return Result.Err("未知字幕类型");
    })();
    if (content_res.error) {
      return Result.Err(content_res.error);
    }
    return SubtitleCore.NewWithContent(content_res.data, { language, currentTime: extra.currentTime });
  }
  static NewWithContent(
    data: { content: string; name: string },
    extra: { language: MediaOriginCountry[]; currentTime?: number }
  ) {
    const { content, name: subtitle_name } = data;
    const suffix = parseSubtitleUrl(subtitle_name);
    const paragraphs = parseSubtitleContent(content, suffix);
    console.log("[DOMAIN]subtitle/index - paragraphs", paragraphs.length);
    const store = new SubtitleCore({
      filename: subtitle_name,
      language: extra.language,
      suffix,
      lines: paragraphs,
    });
    if (extra.currentTime) {
      store.handleTimeChange(extra.currentTime);
    }
    return Result.Ok(store);
  }

  filename: string = "";
  lang: MediaOriginCountry[];
  suffix?: string;
  /** 字幕文件列表 */
  files: {
    language: string;
    url: string;
  }[] = [];
  /** 台词列表 */
  lines: SubtitleLine[] = [];
  /** 准备展示的台词 */
  targetLine: SubtitleLine;
  curLine: SubtitleLine | null = null;
  /** 当前展示第几行，如果是 null 表示不展示字幕 */
  curLineIndex: number | null = null;
  /** 视频当前进度 */
  curTime = 0;
  /** 基准时间 */
  baseStep = 0;

  get state(): SubtitleState {
    return {
      curLine: this.curLine,
    };
  }

  constructor(props: Partial<{ _name: string }> & SubtitleProps) {
    super(props);

    const { filename, lines, suffix, language } = props;
    this.filename = filename;
    this.lines = lines;
    this.suffix = suffix;
    this.lang = language;
    this.targetLine = lines[0];
  }

  changeTargetLine(currentTime: number) {
    let nextTargetLine = this.lines.find((l) => {
      const { start, end } = l;
      const startSecond = timeStrToSeconds(start);
      const endSecond = timeStrToSeconds(end);
      if (currentTime > startSecond && currentTime <= endSecond) {
        return true;
      }
      return false;
    });
    if (!nextTargetLine) {
      nextTargetLine = this.lines.find((l) => {
        const { start, end } = l;
        const startSecond = timeStrToSeconds(start);
        if (currentTime < startSecond) {
          return true;
        }
        return false;
      });
    }
    if (!nextTargetLine) {
      return;
    }
    this.targetLine = nextTargetLine;
  }
  handleTimeChange(currentTime: number) {
    // console.log("[DOMAIN]subtitle/index - handleTimeChange", currentTime, this.curTime, this.targetLine);
    if (Math.abs(currentTime - this.curTime) >= 1) {
      this.curLine = null;
      this.curLineIndex = null;
      this.emit(Events.StateChange, { ...this.state });
      this.changeTargetLine(currentTime);
    }
    // console.log("[DOMAIN]subtitle/index - handleTimeChange after this.changeTargetLine", this.targetLine);
    this.curTime = currentTime;
    if (!this.targetLine) {
      return;
    }
    const prevLineIndex = this.curLineIndex;
    const { startTime, endTime } = this.targetLine;
    const startSecond = startTime + this.baseStep;
    const endSecond = endTime + this.baseStep;
    (() => {
      if (this.curLine && currentTime > this.curLine.endTime) {
        this.curLineIndex = null;
      }
      if (currentTime > startSecond && currentTime <= endSecond) {
        this.curLineIndex = this.lines.findIndex((line) => line === this.targetLine);
        this.targetLine = this.lines[this.curLineIndex + 1] ?? null;
        return;
      }
    })();
    // console.log("prev line with cur line", prevLineIndex, this.curLineIndex);
    // console.log(
    //   "[DOMAIN]subtitle/index - handleTimeChange before prevLineIndex === this.curLineIndex",
    //   prevLineIndex,
    //   this.curLineIndex,
    //   this.targetLine
    // );
    if (prevLineIndex === this.curLineIndex) {
      return;
    }
    (() => {
      if (this.curLineIndex === null) {
        this.curLine = null;
        return;
      }
      this.curLine = this.lines[this.curLineIndex];
    })();
    // console.log("[DOMAIN]subtitle/index - before Event.StateChange", this.curLine, currentTime);
    this.emit(Events.StateChange, { ...this.state });
  }

  increase(step: number) {
    this.baseStep += step;
  }
  subtract(step: number) {
    this.baseStep -= step;
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
