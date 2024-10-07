const PLATFORM = "Floatplane";
const BASE_URL = "https://www.floatplane.com/api";
const PLATFORM_URL = "https://www.floatplane.com";
const PLATFORM_CLAIMTYPE = 3;

var float_config = {};

const API = {
    USER: {
        SUBSCRIPTIONS: BASE_URL + "/v3/user/subscriptions"
    },
    CREATOR: {
        INFO: BASE_URL + "/v3/creator/info"
    },
    CONTENT: {
        CREATOR: {
            LIST: BASE_URL + "/v3/content/creator/list"
        }
    }
}

function float_fetch(url, params) {
    const _params = new URLSearchParams();
    for(var key of Object.keys(params)) {
        _params.append(key, params[key]);
    }
    const _url = url + "?" + _params.toString();
    const resp = http.GET(_url, {
        "User-Agent": "Grayjay v242",
    }, true);
    if(!resp.isOk) {
        return [null, resp];
    }
    return [JSON.parse(resp.body), null];
}

const float_meta = {
    timestamp: (time) => Math.floor(Number(new Date(time)) / 1000),

    fetch_creator_from_id: (id) => {
        let [resp, err] = float_fetch(API.CREATOR.INFO, { id: id });
        if(err) {
            throw new ScriptException("Failed to fetch creator: " + err.code);
        }
        return resp;
    },

    channel_url_from_blog: (blog) => {
        const creator = float_meta.fetch_creator_from_id(blog.channel.creator);
        return PLATFORM_URL + "/channel/" + creator.urlname + "/home/" + blog.channel.urlname;
    },
}

source.enable = function(config) {
    float_config = config ?? {};
    console.log("Floatplane enabled");
}

source.disable = function() {
    float_config = {};
    console.log("Floatplane disabled");
}

source.getHome = function() {
    let [resp, err] = float_fetch(API.USER.SUBSCRIPTIONS, {});
    if(err) {
        throw new ScriptException("Failed to fetch subscriptions: " + err.code);
    }

    const pager = new FloatplaneCreatorPager(resp.map(c => c.creator));
    return pager;
}

class FloatplaneCreatorPager extends ContentPager {
    _LIMIT = 20;

    constructor(creators) {
        super([], true);
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

        let [resp, err] = float_fetch(API.CONTENT.CREATOR.LIST, params);
        if(err) {
            log(err);
            log(params);
            throw new ScriptException("Failed to fetch subscriptions: " + err.code);
        }

        this.hasMore = false;
        for(var data of resp.lastElements) {
            this._creators[data.creatorId] = data;
            this.hasMore ||= data.moreFetchable;
        }

        const ret = resp.blogPosts.map(blogToGrayjay).filter(x => x !== undefined);
        log(ret);
        this.results = ret;
        return this;
    }
}

function blogToGrayjay(blog) {
    if(blog.metadata.hasVideo) {
        return new PlatformVideo({
            id: new PlatformID("Floatplane", blog.id, float_config.id),
            name: blog.title,
            thumbnails: new Thumbnails(
                [blog.thumbnail, ...blog.thumbnail.childImages].map(
                    t => new Thumbnail(t.path, t.height)
                )
            ),
            author: new PlatformAuthorLink(
                new PlatformID("Floatplane", blog.channel.creator + ":" + blog.channel.id, float_config.id),
                blog.channel.title,
                float_meta.channel_url_from_blog(blog),
                blog.channel.icon.path
            ),
            datetime: float_meta.timestamp(blog.releaseDate),
            uploadDate: float_meta.timestamp(blog.releaseDate),
            duration: blog.metadata.videoDuration,
            viewCount: blog.likes + blog.dislikes,          // Floatplane does not support a view count, so this is a proxy
            url: PLATFORM_URL + "/post/" + blog.id,
            isLive: false                                   // TODO: Support live videos
        });
    }

    // TODO: Images
    // TODO: Audio
    // TODO: Gallery
    return undefined;
}
