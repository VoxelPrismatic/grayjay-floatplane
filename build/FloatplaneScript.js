'use strict';

const PLATFORM = "Floatplane";
const BASE_URL = "https://www.floatplane.com/api";
const PLATFORM_URL = "https://www.floatplane.com";
const API = {
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
};
/** Fetches data from the Floatplane API and converts to JSON. */
function Fetch(url, params) {
    const url_params = new URLSearchParams();
    for (var key in params) {
        url_params.append(key, params[key]);
    }
    const uri = url + "?" + url_params.toString();
    const resp = http.GET(uri, {
        "User-Agent": "Grayjay v242",
    }, true);
    if (!resp.isOk) {
        return [null, resp];
    }
    return [JSON.parse(resp.body), null];
}
/** Converts any timestamp to a Unix timestamp */
function Timestamp(time) {
    return Math.floor(Number(new Date(time)) / 1000);
}
/** Creates a channel URL from an [FP_Post] */
function ChannelUrlFromBlog(blog) {
    return PLATFORM_URL + "/channel/" + blog.creator.urlname + "/home/" + blog.channel.urlname;
}

let config;
let settings;
source.setSettings = (sets) => {
    settings = sets ?? {};
    console.log("Floatplane settings set");
};
source.enable = (conf, sets) => {
    config = conf ?? {};
    settings = sets ?? {};
    console.log("Floatplane enabled");
};
source.disable = () => {
    console.log("Floatplane disabled");
};
source.isContentDetailsUrl = (url) => {
    return /^https?:\/\/(www\.)?floatplane\.com\/post\/[\w\d]+$/.test(url);
};
source.getContentDetails = (url) => {
    const post_id = url.split("/").pop();
    let [r, err] = Fetch(API.CONTENT.POST, { id: post_id });
    if (err) {
        throw new ScriptException("ScriptException", "Failed to fetch post " + post_id + ": " + err.code);
    }
    const resp = r;
    if (resp.metadata.hasVideo) {
        if (resp.metadata.hasAudio || resp.metadata.hasPicture || resp.metadata.hasGallery) {
            bridge.toast("Mixed content not supported; only showing video");
        }
        const videos = ToGrayjayVideoSource(resp.videoAttachments);
        console.log(videos);
        return new PlatformVideoDetails({
            id: new PlatformID(PLATFORM, post_id, config.id),
            name: resp.title,
            description: resp.text,
            thumbnails: ToThumbnails(resp.thumbnail),
            author: new PlatformAuthorLink(new PlatformID(PLATFORM, resp.channel.creator + ":" + resp.channel.id, config.id), resp.channel.title, ChannelUrlFromBlog(resp), resp.channel.icon?.path || ""),
            datetime: Timestamp(resp.releaseDate),
            uploadDate: Timestamp(resp.releaseDate),
            duration: resp.metadata.videoDuration,
            viewCount: resp.likes + resp.dislikes, // TODO: implement view count
            url: PLATFORM_URL + "/post/" + resp.id,
            live: null,
            isLive: false,
            dash: null,
            hls: null,
            video: null,
            rating: new RatingLikesDislikes(resp.likes, resp.dislikes),
            subtitles: []
        });
    }
    if (resp.metadata.hasAudio) {
        throw new ScriptException("ScriptException", "Audio content not supported");
    }
    if (resp.metadata.hasPicture) {
        throw new ScriptException("ScriptException", "Picture content not supported");
    }
    if (resp.metadata.hasGallery) {
        throw new ScriptException("ScriptException", "Gallery content not supported");
    }
    throw new ScriptException("ScriptException", "Content type not supported");
};
/** Returns the associated Grayjay stream object */
function ToGrayjayVideoStream(video_index, group_index, duration, origin, title, variant) {
    let letters = " abcdefghijklmnopqrstuvwxyz";
    let group_letter = letters[group_index % letters.length];
    switch (settings.streamFormat) {
        case "flat":
            return new VideoUrlSource({
                width: variant.meta.video?.width || -1,
                height: variant.meta.video?.height || -1,
                container: variant.meta.video?.mimeType || "",
                codec: variant.meta.video?.codec || "",
                bitrate: variant.meta.video?.bitrate.average || 0,
                duration: duration,
                url: origin + variant.url,
                name: `#${video_index}${group_letter}=${variant.meta.video?.height}p - ${title}`
            });
        case "dash.m4s":
        // fall through
        case "dash.mpegts":
            throw new ScriptException("ScriptException", "Dash streams are not implemented (no streams from Floatplane)");
        default:
            return new HLSSource({
                name: `#${video_index}${group_letter}=${variant.meta.video?.height}p - ${title}`,
                url: origin + variant.url,
                duration: duration,
                priority: false
            });
    }
}
/** Returns video streams from an [FP_Post] */
function ToGrayjayVideoSource(attachments) {
    let videos = [];
    let errors = [];
    let video_index = 0;
    for (var video of attachments) {
        video_index++;
        if (!video.isAccessible) {
            errors.push(`Video ${video_index}:${video.id} is not accessible`);
            bridge.toast(`Video ${video_index}:${video.id} is not accessible`);
            continue;
        }
        if (video.isProcessing) {
            errors.push(`Video ${video_index}:${video.id} is processing`);
            bridge.toast(`Video ${video_index}:${video.id} is processing`);
            continue;
        }
        let [resp, err] = Fetch(API.DELIVERY.INFO, {
            // TODO: Support live streams
            scenario: settings.streamFormat == "flat" ? "download" : "onDemand",
            entityId: video.id,
            outputKind: settings.streamFormat || "hls.mpegts"
        });
        if (err) {
            errors.push(`Video ${video_index}:${video.id} is inaccessible`);
            bridge.toast(`Video ${video_index}:${video.id} is inaccessible`);
            continue;
        }
        let delivery = resp;
        let group_index = 0;
        if (delivery.groups.length == 0) {
            errors.push(`Video ${video_index}:${video.id} has no groups`);
            bridge.toast(`Video ${video_index}:${video.id} has no groups`);
            continue;
        }
        for (var group of delivery.groups) {
            group_index++;
            if (group.variants.length == 0) {
                errors.push(`Video ${video_index}:${video.id}:${group_index} has no variants`);
                bridge.toast(`Video ${video_index}:${video.id}:${group_index} has no variants`);
                continue;
            }
            for (var variant of group.variants) {
                if (variant.hidden) {
                    errors.push(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is hidden`);
                    bridge.toast(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is hidden`);
                    continue;
                }
                if (!variant.enabled) {
                    errors.push(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is disabled`);
                    bridge.toast(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is disabled`);
                    continue;
                }
                videos.push(ToGrayjayVideoStream(video_index, group_index, video.duration, group.origin[0].url, video.title, variant));
            }
        }
    }
    if (videos.length == 0) {
        throw new ScriptException("ScriptException", "The following errors occurred:\n- " + errors.join("\n- "));
    }
    return new VideoSourceDescriptor(videos);
}
function ToThumbnails(thumbs) {
    if (thumbs == null)
        return new Thumbnails([]);
    return new Thumbnails([thumbs, ...thumbs.childImages].map((t) => new Thumbnail(t.path, t.height)));
}
