let config: Config;
let settings: FP_Config;

import * as FP from "./Wrapper.ts";


source.setSettings = (sets: FP_Config) => {
    settings = sets ?? {};
    console.log("Floatplane settings set");
}

source.enable = (conf: Config, sets: FP_Config) => {
    config = conf ?? {};
    settings = sets ?? {};
    console.log("Floatplane enabled");
}

source.disable = () => {
    console.log("Floatplane disabled");
}

source.isContentDetailsUrl = (url: string) => {
    return /^https?:\/\/(www\.)?floatplane\.com\/post\/[\w\d]+$/.test(url);
}

source.getHome = function() {
    let [resp, err] = FP.Fetch(FP.API.USER.SUBSCRIPTIONS, {});
    if(err) {
        throw new ScriptException("ScriptException", "Failed to fetch subscriptions: " + err.code);
    }

    const pager = new CreatorPager((resp as FP_Subscription[]).map(c => c.creator));
    return pager;
}

source.getContentDetails = (url: string): PlatformVideoDetails => {
    const post_id: string = url.split("/").pop() as string;

    let [r, err] = FP.Fetch(FP.API.CONTENT.POST, { id: post_id });
    if(err) {
        throw new ScriptException("ScriptException", "Failed to fetch post " + post_id + ": " + err.code);
    }

    const resp: FP_Post = r as FP_Post;

    if(resp.metadata.hasVideo) {
        if(resp.metadata.hasAudio || resp.metadata.hasPicture || resp.metadata.hasGallery) {
            bridge.toast("Mixed content not supported; only showing video");
        }
        const videos = ToGrayjayVideoSource(resp.videoAttachments);
        console.log(videos);

        return new PlatformVideoDetails({
            id: new PlatformID(FP.PLATFORM, post_id, config.id),
            name: resp.title,
            description: resp.text,
            thumbnails: ToThumbnails(resp.thumbnail),
            author: new PlatformAuthorLink(
                new PlatformID(FP.PLATFORM, resp.channel.creator + ":" + resp.channel.id, config.id),
                resp.channel.title,
                FP.ChannelUrlFromBlog(resp),
                resp.channel.icon?.path || ""
            ),
            datetime: FP.Timestamp(resp.releaseDate),
            uploadDate: FP.Timestamp(resp.releaseDate),
            duration: resp.metadata.videoDuration,
            viewCount: resp.likes + resp.dislikes, // TODO: implement view count
            url: FP.PLATFORM_URL + "/post/" + resp.id,
            isLive: false,
            video: videos,
            rating: new RatingLikesDislikes(resp.likes, resp.dislikes),
            subtitles: []
        })
    }

    if(resp.metadata.hasAudio) {
        throw new ScriptException("ScriptException", "Audio content not supported");
    }

    if(resp.metadata.hasPicture) {
        throw new ScriptException("ScriptException", "Picture content not supported");
    }

    if(resp.metadata.hasGallery) {
        throw new ScriptException("ScriptException", "Gallery content not supported");
    }

    throw new ScriptException("ScriptException", "Content type not supported");
}

/** Returns the associated Grayjay stream object */
function ToGrayjayVideoStream(
    video_index: number, group_index: number,
    duration: number, origin: string,
    title: string,variant: FP_DeliveryVariant
): VideoUrlSource | HLSSource | DashSource {
    let letters: string = " abcdefghijklmnopqrstuvwxyz";
    let group_letter = letters[group_index % letters.length];

    switch(settings.streamFormat) {
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
function ToGrayjayVideoSource(attachments: FP_VideoAttachment[]): VideoSourceDescriptor {
    let videos: VideoSource[] = [];
    let errors: string[] = [];
    let video_index: number = 0;

    for(var video of attachments) {
        video_index++;

        if(!video.isAccessible) {
            errors.push(`Video ${video_index}:${video.id} is not accessible`);
            bridge.toast(`Video ${video_index}:${video.id} is not accessible`);
            continue;
        }

        if(video.isProcessing) {
            errors.push(`Video ${video_index}:${video.id} is processing`);
            bridge.toast(`Video ${video_index}:${video.id} is processing`);
            continue;
        }

        let [resp, err] = FP.Fetch(FP.API.DELIVERY.INFO, {
            // TODO: Support live streams
            scenario: settings.streamFormat == "flat" ? "download" : "onDemand",
            entityId: video.id,
            outputKind: settings.streamFormat || "hls.mpegts"
        });

        if(err) {
            errors.push(`Video ${video_index}:${video.id} is inaccessible`);
            bridge.toast(`Video ${video_index}:${video.id} is inaccessible`);
            continue;
        }

        let delivery: FP_Delivery = resp as FP_Delivery;
        let group_index: number = 0;

        if(delivery.groups.length == 0) {
            errors.push(`Video ${video_index}:${video.id} has no groups`);
            bridge.toast(`Video ${video_index}:${video.id} has no groups`);
            continue;
        }

        for(var group of delivery.groups) {
            group_index++;
            if(group.variants.length == 0) {
                errors.push(`Video ${video_index}:${video.id}:${group_index} has no variants`);
                if(settings.logLevel)
                    bridge.toast(`Video ${video_index}:${video.id}:${group_index} has no variants`);
                continue;
            }

            for(var variant of group.variants) {
                if(variant.hidden) {
                    errors.push(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is hidden`);
                    if(settings.logLevel)
                        bridge.toast(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is hidden`);
                    continue;
                }

                if(!variant.enabled) {
                    errors.push(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is disabled`);
                    if(settings.logLevel)
                        bridge.toast(`Video ${video_index}:${video.id}:${group_index}:${variant.name} is disabled`);
                    continue;
                }

                if(settings.logLevel)
                    bridge.toast(`SUCCESS: Video ${video_index}:${video.id}:${group_index}:${variant.name}`);
                try {
                    videos.push(ToGrayjayVideoStream(
                        video_index, group_index,
                        video.duration, group.origins[0].url,
                        video.title, variant
                    ));
                } catch(err) {
                    log(ToGrayjayVideoStream(
                        video_index, group_index,
                        video.duration, group.origins[0].url,
                        video.title, variant
                    ));
                    throw err;
                }

            }
        }
    }

    if(videos.length == 0) {
        throw new ScriptException("ScriptException", "The following errors occurred:\n- " + errors.join("\n- "));
    }

    log(videos);
    return new VideoSourceDescriptor(videos);
}

function ToThumbnails(thumbs: FP_Parent_Image | null): Thumbnails {
    if(thumbs == null)
        return new Thumbnails([]);

    return new Thumbnails([thumbs, ...thumbs.childImages].map(
        (t) => new Thumbnail(t.path, t.height)
    ))
}

function ToVideoEntry(blog: FP_Post): PlatformVideo | null {
    if(blog.metadata.hasVideo) {
        return new PlatformVideo({
            id: new PlatformID("Floatplane", blog.id, config.id),
            name: blog.title,
            thumbnails: ToThumbnails(blog.thumbnail),
            description: blog.text,
            author: new PlatformAuthorLink(
                new PlatformID("Floatplane", blog.channel.creator + ":" + blog.channel.id, config.id),
                blog.channel.title,
                FP.ChannelUrlFromBlog(blog),
                blog.channel.icon?.path || ""
            ),
            datetime: FP.Timestamp(blog.releaseDate),
            uploadDate: FP.Timestamp(blog.releaseDate),
            duration: blog.metadata.videoDuration,
            viewCount: blog.likes + blog.dislikes,          // Floatplane does not support a view count, so this is a proxy
            url: FP.PLATFORM_URL + "/post/" + blog.id,
            isLive: false                                   // TODO: Support live videos
        });
    }

    // TODO: Images
    // TODO: Audio
    // TODO: Gallery
    // throw new ScriptException("ScriptException", "The following blog has no video: " + blog.id);
    return null;
}

interface CreatorPager_Memory {
    creatorId: string,
    blogPostId: string | null,
    moreFetchable: boolean
}

class CreatorPager extends ContentPager {
    _LIMIT = 20;
    _creators: { [creator: string]: CreatorPager_Memory } = {};

    constructor(creators: string[]) {
        super([], true, null);
        this._creators = {};
        for(var creator of creators) {
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
        }

        let n = 0;
        for(var creator of Object.values(this._creators)) {
            params[`ids[${n}]`] = creator.creatorId;
            if(creator.blogPostId) {
                params[`fetchAfter[${n}][creatorId]`] = creator.creatorId;
                params[`fetchAfter[${n}][blogPostId]`] = creator.blogPostId;
                params[`fetchAfter[${n}][moreFetchable]`] = creator.moreFetchable;
            }
            n++;
        }

        let [resp, err] = FP.Fetch(FP.API.CONTENT.CREATOR.LIST, params);
        if(err) {
            log(err);
            log(params);
            throw new ScriptException("ScriptException", "Failed to fetch subscriptions: " + err.code);
        }

        this.hasMore = false;
        for(var data of resp.lastElements) {
            this._creators[data.creatorId] = data;
            this.hasMore ||= data.moreFetchable;
        }

        const ret = resp.blogPosts.map(ToVideoEntry).filter(x => x !== null);
        this.results = ret;
        return this;
    }
}
