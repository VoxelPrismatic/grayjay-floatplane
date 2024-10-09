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

/** Fetches data from the Floatplane API and converts to JSON. */
export function Fetch(url: string, params: object): Result<object, BridgeHttpResponse> {
    const url_params = new URLSearchParams();
    for(var key in params) {
        url_params.append(key, params[key]);
    }

    const uri = url + "?" + url_params.toString();
    const resp = http.GET(uri, {
        "User-Agent": "Grayjay v242",
    }, true);
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
        throw new ScriptException("ScriptException", `Failed to fetch creator ${id}: ${err.code}`);
    }
    return resp as FP_Creator;
}


/** Fetches an [FP_Post] from the API given its ID */
export function BlogFromId(id: string): FP_Post {
    let [resp, err] = Fetch(API.CONTENT.POST, { id: id });
    if(err) {
        throw new ScriptException("ScriptException", `Failed to fetch blogPost ${id}: ${err.code}`);
    }
    return resp as FP_Post;
}

/** Creates a channel URL from an [FP_Post] */
export function ChannelUrlFromBlog(blog: FP_Post): string {
    return PLATFORM_URL + "/channel/" + blog.creator.urlname + "/home/" + blog.channel.urlname;
}

export class CreatorPager extends ContentPager {
    _LIMIT = 20;
    _creators: { [creator: string]: { creatorId: string, blogPostId: string | null, moreFetchable: boolean } } = {};

    constructor(creators: FP_Creator[]) {
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

        let [resp, err] = Floatplane.Fetch(API.CONTENT.CREATOR.LIST, params);
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
        this.results = ret;
        return this;
    }
}

