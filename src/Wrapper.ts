import * as CryptoJS from "crypto-js";

type Result<T, E> = [T, null] | [null, E];

export const PLATFORM = "Floatplane";
export const BASE_URL = "https://www.floatplane.com/api";
export const PLATFORM_URL = "https://www.floatplane.com";
export const PLATFORM_CLAIMTYPE = 3;

export const API = {
    USER: {
        SUBSCRIPTIONS: BASE_URL + "/v3/user/subscriptions"
    },
    CREATOR: {
        INFO: BASE_URL + "/v3/creator/info"
    },
    DELIVERY: {
        INFO: BASE_URL + "/v3/delivery/info"
    },
    CONTENT: {
        CREATOR: {
            LIST: BASE_URL + "/v3/content/creator/list"
        },
        POST: BASE_URL + "/v3/content/post"
    }
}

export const FP_Headers = {
    "User-Agent": "Grayjay v242",
    "Cookie": "sails.sid=s:51yVLlSvGVV10xKEVmH76hKsuytiBVX4.hsDRtgFhlpEvI83M1XaRGxVQvWnDQbsm+x5wS7I9ISc",
}

/** Fetches data from the Floatplane API and converts to JSON. */
export function Fetch(url: string, params: object): Result<object, BridgeHttpResponse> {
    const url_params = new URLSearchParams();
    for(var key in params) {
        url_params.append(key, params[key]);
    }

    const uri = url + "?" + url_params.toString();
    const resp = http.GET(uri, FP_Headers, true);
    if(!resp.isOk) {
        return [null, resp];
    }
    return [JSON.parse(resp.body), null];
}


/** Converts any timestamp to a Unix timestamp */
export function Timestamp(time: number | string): number {
    return Math.floor(Number(new Date(time)) / 1000);
}


/** Fetches an [FP_Creator] from the API given its ID */
export function CreatorFromId(id: string): FP_Creator {
    let [resp, err] = Fetch(API.CREATOR.INFO, { id: id });
    if(err) {
        throw new ScriptException(`Failed to fetch creator ${id}: ${err.code}`);
    }
    return resp as FP_Creator;
}


/** Fetches an [FP_Post] from the API given its ID */
export function BlogFromId(id: string): FP_Post {
    let [resp, err] = Fetch(API.CONTENT.POST, { id: id });
    if(err) {
        throw new ScriptException(`Failed to fetch blogPost ${id}: ${err.code}`);
    }
    return resp as FP_Post;
}

/** Creates a channel URL from an [FP_Post] */
export function ChannelUrlFromBlog(blog: FP_Post): string {
    return PLATFORM_URL + "/channel/" + blog.creator.urlname + "/home/" + blog.channel.urlname;
}

export function getHlsSequenceNo(url: string): CryptoJS.lib.WordArray {
    const match = url.match(/\/Videos\/[a-zA-Z0-9]+\/\d+\.mp4\/([a-zA-Z0-9]+)\.ts\?/);
    if(!match) {
        throw new ScriptException("Not a valid Floatplane HLS URL: " + url);
    }
    const data = JSON.parse(atob(match[1]));
    const seq = data.sequence.toString(16).padStart(32, "0");
    return CryptoJS.enc.Hex.parse(seq);
}

export function getHlsToken(url: string): CryptoJS.lib.WordArray {
    // Fetch M3U8 playlist
    let resp = http.GET(url, FP_Headers, true);
    if(!resp.isOk) {
        throw new ScriptException(`Failed to fetch HLS stream: ${resp.code}`);
    }

    // Find line with encryption key
    let line: string = "";
    for(var l of resp.body.split(/\n/g)) {
        if(l.startsWith("#EXT-X-KEY:")) {
            line = l;
            break;
        }
    }

    if(line == "")
        throw new ScriptException("No HLS encryption key found");

    let parts = line.slice("#EXT-X-KEY:".length).split(",");
    let data = {};
    for(var part of parts) {
        let key = part.split("=")[0];
        data[key] = part.slice(key.length + 1);
    }

    // Download encryption key
    let uri = data["URI"];
    if(uri.startsWith('"') && uri.endsWith('"'))
        uri = uri.slice(1, -1);

    log(uri)
    console.log(data);
    let key = http.GET(uri, FP_Headers, true);
    if(!key.isOk) {
        throw new ScriptException(`Failed to download HLS encryption key: ${key.code}`);
    }

    return CryptoJS.enc.Utf8.parse(key.body);
}

export class FP_HLS_Source extends HLSSource {
    url: string;

    constructor(obj: HLSSource) {
        super(obj);
        this.url = obj.url;
    }

    generate() {
        throw new ScriptException("generate not implemented");
    }
}

export class FP_HLS_Executor {
    url: string;
    key: CryptoJS.lib.WordArray;

    constructor(url: string, key: CryptoJS.lib.WordArray) {
        this.url = url;
        this.key = key;
        log("EXECUTOR! ~ constructor");
    }

    findSegmentTime(index: number) {
        log("EXECUTOR! ~ findSegmentTime");
        throw new ScriptException("findSegmentTime not implemented");
    }

    cacheSegment(segment: object): void {
        log("EXECUTOR! ~ cacheSegment");
        throw new ScriptException("cacheSegment not implemented");
    }

    getCachedSegmentCount(): number {
        log("EXECUTOR! ~ getCachedSegmentCount");
        throw new ScriptException("getCachedSegmentCount not implemented");
    }

    getCachedSegment(index: number): string {
        log("EXECUTOR! ~ getCachedSegment");
        throw new ScriptException("getCachedSegment not implemented");
    }

    freeOldSegments(index: number | string) {
        log("EXECUTOR! ~ freeOldSegments");
        throw new ScriptException("freeOldSegments not implemented");
    }

    freeAllSegments(): void {
        log("EXECUTOR! ~ freeAllSegments");
        throw new ScriptException("freeAllSegments not implemented");
    }

    cleanup(): void {
        log("EXECUTOR! ~ cleanup");
        throw new ScriptException("cleanup not implemented");
    }

    executeRequest(url: string, headers: object, retryCount: number = 0): string {
        if(url.includes("/chunk.m3u8?")) {
            const resp = http.GET(url, { ...FP_Headers, ...headers }, true);
            if(!resp.isOk) {
                if(retryCount < 5) {
                    return this.executeRequest(url, headers, retryCount + 1);
                }
                throw new ScriptException(`Failed to fetch HLS stream: ${resp.code}`);
            }
            return "";
        }

        throw new ScriptException("executeRequest not implemented: " + url);
    }
}

function decodeSegment(url: string, key: CryptoJS.lib.WordArray): string {
    let resp = http.GET(url, FP_Headers, true);
    const seq = getHlsSequenceNo(url);
    if(!resp.isOk) {
        throw new ScriptException(`Failed to fetch HLS Segment: ${resp.code}`);
    }

    const decoded = CryptoJS.AES.decrypt(resp.body, key, {
        iv: seq,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })

    return decoded.toString(CryptoJS.enc.Utf8);
}

let key: CryptoJS.lib.WordArray;
export let segment_queue: string[] = [];
export let cached_segments: { [key: string]: string } = {};
export function pushToQueue(source: HLSSource) {
    key = getHlsToken(source.url);
    const m3u8 = http.GET(source.url, FP_Headers, true);
    const prefix = source.url.split("/chunk.m3u8")[0];

    segment_queue = [];
    cached_segments = {};

    if(!m3u8.isOk) {
        throw new ScriptException(`Failed to fetch HLS stream: ${m3u8.code}`);
    }
    for(var line of m3u8.body.split(/\n/g)) {
        if(!line.startsWith("#"))
            segment_queue.push(prefix + "/" + line)
    }
}

export function popFromQueue(): string {
    const url = segment_queue.shift();
    if(!url)
        throw new ScriptException("No more segments in queue");

    return cacheSegment(url);
}

export function cacheSegment(url: string) {
    if(!cached_segments[url])
        cached_segments[url] = decodeSegment(url, key);

    return cached_segments[url];
}
