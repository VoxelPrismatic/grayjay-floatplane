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
source.getHome = function () {
    let [resp, err] = Fetch(API.USER.SUBSCRIPTIONS, {});
    if (err) {
        throw new ScriptException("ScriptException", "Failed to fetch subscriptions: " + err.code);
    }
    const pager = new CreatorPager(resp.map(c => c.creator));
    return pager;
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
            isLive: false,
            video: videos,
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
                name: `#${video_index}${group_letter}=${variant.label} - ${title}`
            });
        case "dash.m4s":
        // fall through
        case "dash.mpegts":
            throw new ScriptException("ScriptException", "Dash streams are not implemented (no streams from Floatplane)");
        default:
            return new HLSSource({
                name: `#${video_index}${group_letter}=${variant.label} - ${title}`,
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
                if (settings.logLevel)
                    bridge.toast(`Video ${video_index}:${video.id}:${group_index} has no variants`);
                continue;
            }
            for (var variant of group.variants) {
                if (variant.hidden) {
                    errors.push(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is hidden`);
                    if (settings.logLevel)
                        bridge.toast(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is hidden`);
                    continue;
                }
                if (!variant.enabled) {
                    errors.push(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is disabled`);
                    if (settings.logLevel)
                        bridge.toast(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is disabled`);
                    continue;
                }
                if (settings.logLevel)
                    bridge.toast(`SUCCESS: Video ${video_index}:${video.id}:${group_index}:${variant.name}`);
                try {
                    videos.push(ToGrayjayVideoStream(video_index, group_index, video.duration, group.origins[0].url, video.title, variant));
                }
                catch (err) {
                    log(ToGrayjayVideoStream(video_index, group_index, video.duration, group.origins[0].url, video.title, variant));
                    throw err;
                }
            }
        }
    }
    if (videos.length == 0) {
        throw new ScriptException("ScriptException", "The following errors occurred:\n- " + errors.join("\n- "));
    }
    log(videos);
    return new VideoSourceDescriptor(videos);
}
function ToThumbnails(thumbs) {
    if (thumbs == null)
        return new Thumbnails([]);
    return new Thumbnails([thumbs, ...thumbs.childImages].map((t) => new Thumbnail(t.path, t.height)));
}
function ToVideoEntry(blog) {
    if (blog.metadata.hasVideo) {
        return new PlatformVideo({
            id: new PlatformID("Floatplane", blog.id, config.id),
            name: blog.title,
            thumbnails: ToThumbnails(blog.thumbnail),
            description: blog.text,
            author: new PlatformAuthorLink(new PlatformID("Floatplane", blog.channel.creator + ":" + blog.channel.id, config.id), blog.channel.title, ChannelUrlFromBlog(blog), blog.channel.icon?.path || ""),
            datetime: Timestamp(blog.releaseDate),
            uploadDate: Timestamp(blog.releaseDate),
            duration: blog.metadata.videoDuration,
            viewCount: blog.likes + blog.dislikes, // Floatplane does not support a view count, so this is a proxy
            url: PLATFORM_URL + "/post/" + blog.id,
            isLive: false // TODO: Support live videos
        });
    }
    // TODO: Images
    // TODO: Audio
    // TODO: Gallery
    // throw new ScriptException("ScriptException", "The following blog has no video: " + blog.id);
    return null;
}
class CreatorPager extends ContentPager {
    _LIMIT = 20;
    _creators = {};
    constructor(creators) {
        super([], true, null);
        this._creators = {};
        for (var creator of creators) {
            this._creators[creator] = {
                creatorId: creator,
                blogPostId: null,
                moreFetchable: true,
            };
        }
    }
    nextPage() {
        const params = {
            limit: this._LIMIT
        };
        let n = 0;
        for (var creator of Object.values(this._creators)) {
            params[`ids[${n}]`] = creator.creatorId;
            if (creator.blogPostId) {
                params[`fetchAfter[${n}][creatorId]`] = creator.creatorId;
                params[`fetchAfter[${n}][blogPostId]`] = creator.blogPostId;
                params[`fetchAfter[${n}][moreFetchable]`] = creator.moreFetchable;
            }
            n++;
        }
        let [resp, err] = Fetch(API.CONTENT.CREATOR.LIST, params);
        if (err) {
            log(err);
            log(params);
            throw new ScriptException("ScriptException", "Failed to fetch subscriptions: " + err.code);
        }
        this.hasMore = false;
        for (var data of resp.lastElements) {
            this._creators[data.creatorId] = data;
            this.hasMore ||= data.moreFetchable;
        }
        const ret = resp.blogPosts.map(ToVideoEntry).filter(x => x !== null);
        this.results = ret;
        return this;
    }
}
