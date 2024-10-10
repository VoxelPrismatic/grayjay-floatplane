//Reference Scriptfile
//Intended exclusively for auto-complete in your IDE, not for execution

declare class ScriptException extends Error {
  plugin_type: string;
  msg: string;
  message: string;

  //If only one parameter is provided, acts as msg
  constructor(type: string, msg: string) {
    if (arguments.length == 1) {
      super(arguments[0]);
      this.plugin_type = 'ScriptException';
      this.message = arguments[0];
    } else {
      super(msg);
      this.plugin_type = type ?? ''; //string
      this.msg = msg ?? ''; //string
    }
  }
}

declare class LoginRequiredException extends ScriptException {
  constructor(msg: string) {
    super('ScriptLoginRequiredException', msg);
  }
}

//Alias
declare class ScriptLoginRequiredException extends ScriptException {
  constructor(msg: string) {
    super('ScriptLoginRequiredException', msg);
  }
}

declare class CaptchaRequiredException extends ScriptException {
  plugin_type: string;
  url: string;
  body: any;

  constructor(url: string, body: string) {
    super(
      JSON.stringify({ plugin_type: 'CaptchaRequiredException', url, body }),
    );
    this.plugin_type = 'CaptchaRequiredException';
    this.url = url;
    this.body = body;
  }
}

declare class CriticalException extends ScriptException {
  constructor(msg: string) {
    super('CriticalException', msg);
  }
}

declare class UnavailableException extends ScriptException {
  constructor(msg: string) {
    super('UnavailableException', msg);
  }
}

declare class AgeException extends ScriptException {
  constructor(msg: string) {
    super('AgeException', msg);
  }
}

declare class TimeoutException extends ScriptException {
  plugin_type: string;

  constructor(msg: string) {
    super(msg);
    this.plugin_type = 'ScriptTimeoutException';
  }
}

declare class ScriptImplementationException extends ScriptException {
  plugin_type: string;

  constructor(msg: string) {
    super(msg);
    this.plugin_type = 'ScriptImplementationException';
  }
}

declare class Thumbnails {
  constructor(thumbnails: Thumbnail[]) {
    this.sources = thumbnails ?? []; // Thumbnail[]
  }
}
declare class Thumbnail {
  constructor(url: string, quality: number) {
    this.url = url ?? ''; //string
    this.quality = quality ?? 0; //integer
  }
}

declare class PlatformID {
  constructor(
    platform: string,
    id: string,
    pluginId: string,
    claimType?: number = 0,
    claimFieldType?: number = -1,
  ) {
    this.platform = platform ?? ''; //string
    this.pluginId = pluginId; //string
    this.value = id; //string
    this.claimType = claimType ?? 0; //int
    this.claimFieldType = claimFieldType ?? -1; //int
  }
}

declare class PlatformContent {
  contentType: number;
  id: PlatformID;
  name: string;
  thumbnails: Thumbnail[];
  author: PlatformAuthorLink;
  datetime: number;
  url: string;

  constructor(obj: any, type: number) {
    this.contentType = type;
    obj = obj ?? {};
    this.id = obj.id ?? PlatformID(); //PlatformID
    this.name = obj.name ?? ''; //string
    this.thumbnails = obj.thumbnails; //Thumbnail[]
    this.author = obj.author; //PlatformAuthorLink
    this.datetime = obj.datetime ?? obj.uploadDate ?? 0; //OffsetDateTime (Long)
    this.url = obj.url ?? ''; //String
  }
}

declare class PlatformContentDetails {
  contentType: number;
  constructor(type) {
    this.contentType = type;
  }
}

declare class PlatformNestedMediaContent extends PlatformContent {
  contentUrl: string;
  contentName: any;
  contentDescription: any;
  contentProvider: any;
  contentThumbnails: Thumbnails;

  constructor(obj) {
    super(obj, 11);
    obj = obj ?? {};
    this.contentUrl = obj.contentUrl ?? '';
    this.contentName = obj.contentName;
    this.contentDescription = obj.contentDescription;
    this.contentProvider = obj.contentProvider;
    this.contentThumbnails = obj.contentThumbnails ?? new Thumbnails();
  }
}
declare class PlatformLockedContent extends PlatformContent {
  contentName: any;
  contentThumbnails: Thumbnails;
  unlockUrl: string;
  lockDescription: any;

  constructor(obj) {
    super(obj, 70);
    obj = obj ?? {};
    this.contentName = obj.contentName;
    this.contentThumbnails = obj.contentThumbnails ?? new Thumbnails();
    this.unlockUrl = obj.unlockUrl ?? '';
    this.lockDescription = obj.lockDescription;
  }
}

//Playlist
declare class PlatformPlaylist extends PlatformContent {
  plugin_type: string;
  videoCount: number;
  thumbnail: any;
  constructor(obj) {
    super(obj, 4);
    this.plugin_type = 'PlatformPlaylist';
    this.videoCount = obj.videoCount ?? 0;
    this.thumbnail = obj.thumbnail;
  }
}

declare class PlatformPlaylistDetails extends PlatformPlaylist {
  plugin_type: string;
  contents: any;
  constructor(obj) {
    super(obj);
    this.plugin_type = 'PlatformPlaylistDetails';
    this.contents = obj.contents;
  }
}

//Ratings
declare class RatingLikes {
  type: number;
  likes: number;

  constructor(likes) {
    this.type = 1;
    this.likes = likes;
  }
}

declare class RatingLikesDislikes {
  type: number;
  likes: number;
  dislikes: number;
  constructor(likes: number, dislikes: number) {
    this.type = 2;
    this.likes = likes;
    this.dislikes = dislikes;
  }
}

declare class RatingScaler {
  type: number;
  value: any;
  constructor(value) {
    this.type = 3;
    this.value = value;
  }
}

declare class PlatformComment {
  plugin_type: string;
  contextUrl: string;
  author: PlatformAuthorLink;
  message: string;
  rating: IRating;
  date: number;
  replyCount: number;
  context: any;

  constructor(obj) {
    this.plugin_type = 'Comment';
    this.contextUrl = obj.contextUrl ?? '';
    this.author = obj.author ?? new PlatformAuthorLink(null, '', '', null);
    this.message = obj.message ?? '';
    this.rating = obj.rating ?? new RatingLikes(0);
    this.date = obj.date ?? 0;
    this.replyCount = obj.replyCount ?? 0;
    this.context = obj.context ?? {};
  }
}

//Sources
declare class VideoSourceDescriptor {
  plugin_type: string;
  isUnMuxed: boolean;
  videoSources: any[];

  constructor(obj) {
    obj = obj ?? {};
    this.plugin_type = 'MuxVideoSourceDescriptor';
    this.isUnMuxed = false;

    if (obj.constructor === Array) this.videoSources = obj;
    else this.videoSources = obj.videoSources ?? [];
  }
}

declare class UnMuxVideoSourceDescriptor {
  plugin_type: string;
  isUnMuxed: boolean;
  videoSources: any[];
  audioSources: any[];

  constructor(videoSourcesOrObj, audioSources) {
    videoSourcesOrObj = videoSourcesOrObj ?? {};
    this.plugin_type = 'UnMuxVideoSourceDescriptor';
    this.isUnMuxed = true;

    if (videoSourcesOrObj.constructor === Array) {
      this.videoSources = videoSourcesOrObj;
      this.audioSources = audioSources;
    } else {
      this.videoSources = videoSourcesOrObj.videoSources ?? [];
      this.audioSources = videoSourcesOrObj.audioSources ?? [];
    }
  }
}

type VideoSource = VideoUrlSource | HLSSource | DashSource | VideoUrlRangeSource;
type AudioSource = AudioUrlSource | AudioUrlRangeSource;

declare class VideoUrlSource {
  plugin_type?: string;
  width: number;
  height: number;
  container: string;
  codec: string;
  name: string;
  bitrate: number;
  duration: number;
  url: string;
  requestModifier?: any;

  constructor(obj: VideoUrlSource) {
    obj = obj ?? {};
    this.plugin_type = 'VideoUrlSource';
    this.width = obj.width ?? 0;
    this.height = obj.height ?? 0;
    this.container = obj.container ?? '';
    this.codec = obj.codec ?? '';
    this.name = obj.name ?? '';
    this.bitrate = obj.bitrate ?? 0;
    this.duration = obj.duration ?? 0;
    this.url = obj.url;
    if (obj.requestModifier) this.requestModifier = obj.requestModifier;
  }
}

declare class VideoUrlRangeSource extends VideoUrlSource {
  plugin_type: string;
  itagId: any;
  initStart: any;
  initEnd: any;
  indexStart: any;
  indexEnd: any;

  constructor(obj: VideoUrlRangeSource) {
    super(obj);
    this.plugin_type = 'VideoUrlRangeSource';

    this.itagId = obj.itagId ?? null;
    this.initStart = obj.initStart ?? null;
    this.initEnd = obj.initEnd ?? null;
    this.indexStart = obj.indexStart ?? null;
    this.indexEnd = obj.indexEnd ?? null;
  }
}

declare class AudioUrlSource {
  plugin_type: string;
  name: string;
  bitrate: number;
  container: string;
  codec: string;
  duration: number;
  url: string;
  language: Language;
  requestModifier?: any;

  constructor(obj: AudioUrlSource) {
    obj = obj ?? {};
    this.plugin_type = 'AudioUrlSource';
    this.name = obj.name ?? '';
    this.bitrate = obj.bitrate ?? 0;
    this.container = obj.container ?? '';
    this.codec = obj.codec ?? '';
    this.duration = obj.duration ?? 0;
    this.url = obj.url;
    this.language = obj.language ?? Language.UNKNOWN;
    if (obj.requestModifier) this.requestModifier = obj.requestModifier;
  }
}

declare class AudioUrlWidevineSource extends AudioUrlSource {
  plugin_type: string;
  bearerToken: any;
  licenseUri: any;

  constructor(obj: AudioUrlWidevineSource) {
    super(obj);
    this.plugin_type = 'AudioUrlWidevineSource';

    this.bearerToken = obj.bearerToken;
    this.licenseUri = obj.licenseUri;
  }
}

declare class AudioUrlRangeSource extends AudioUrlSource {
  plugin_type: string;
  itagId: any;
  initStart: any;
  initEnd: any;
  indexStart: any;
  indexEnd: any;
  audioChannels: number;

  constructor(obj: AudioUrlRangeSource) {
    super(obj);
    this.plugin_type = 'AudioUrlRangeSource';

    this.itagId = obj.itagId ?? null;
    this.initStart = obj.initStart ?? null;
    this.initEnd = obj.initEnd ?? null;
    this.indexStart = obj.indexStart ?? null;
    this.indexEnd = obj.indexEnd ?? null;
    this.audioChannels = obj.audioChannels ?? 2;
  }
}

declare class HLSSource {
  plugin_type?: string;
  name: string;
  duration: number;
  url: string;
  priority: boolean;
  language?: any;
  requestModifier?: any;

  constructor(obj: HLSSource) {
    obj = obj ?? {};
    this.plugin_type = 'HLSSource';
    this.name = obj.name ?? 'HLS';
    this.duration = obj.duration ?? 0;
    this.url = obj.url;
    this.priority = obj.priority ?? false;
    if (obj.language) this.language = obj.language;
    if (obj.requestModifier) this.requestModifier = obj.requestModifier;
  }
}

declare class DashSource {
  plugin_type: string;
  name: string;
  duration: number;
  url: string;
  language?: any;
  requestModifier?: any;

  constructor(obj) {
    obj = obj ?? {};
    this.plugin_type = 'DashSource';
    this.name = obj.name ?? 'Dash';
    this.duration = obj.duration ?? 0;
    this.url = obj.url;
    if (obj.language) this.language = obj.language;
    if (obj.requestModifier) this.requestModifier = obj.requestModifier;
  }
}

declare class RequestModifier {
  allowByteSkip: any;

  constructor(obj) {
    obj = obj ?? {};
    this.allowByteSkip = obj.allowByteSkip; //Kinda deprecated.. wip
  }
}

interface PluginSetting {
  variable?: string;
  name?: string;
  description?: string;
  type?: string;
  default?: string;
  options?: string[];
}

declare class Config {
  name?: string;
  platformUrl?: string;
  description?: string;
  author?: string;
  authorUrl?: string;
  sourceUrl?: string;
  scriptUrl?: string;
  repositoryUrl?: string;
  version?: number;
  iconUrl?: string;
  id: string;
  scriptSignature?: string;
  scriptPublicKey?: string;
  packages?: string[];
  allowEval?: boolean;
  allowUrls?: string[];
  settings?: PluginSetting[];
  allowAllHttpHeaderAccess?: boolean;
}

declare class ResultCapabilities {
  types: string[];
  sorts: string[];
  filters?: FilterGroup[];

  constructor(types: string[], sorts: string[], filters: FilterGroup[]) {
    this.types = types ?? [];
    this.sorts = sorts ?? [];
    this.filters = filters ?? [];
  }
}

declare class FilterGroup {
  name: string;
  filters: any[];
  isMultiSelect: boolean;
  id: any;

  constructor(
    name: string,
    filters: string[],
    isMultiSelect: boolean,
    id: string,
  ) {
    if (!name) throw new ScriptException('No name for filter group');
    if (!filters) throw new ScriptException('No filter provided');

    this.name = name;
    this.filters = filters;
    this.isMultiSelect = isMultiSelect;
    this.id = id;
  }
}

declare class FilterCapability {
  name: string;
  value: any;
  id: any;

  constructor(name: string, value: string, id: string) {
    if (!name) throw new ScriptException('No name for filter');
    if (!value) throw new ScriptException('No filter value');

    this.name = name;
    this.value = value;
    this.id = id;
  }
}

declare class PlatformAuthorLink {
  id: PlatformID;
  name: string;
  url: string;
  thumbnail: string;
  subscribers?: any;
  membershipUrl?: string | null;

  constructor(
    id: PlatformID,
    name: string,
    url: string,
    thumbnail: string,
    subscribers?: any,
    membershipUrl?: string | null,
  ) {
    this.id = id ?? PlatformID(); //PlatformID
    this.name = name ?? ''; //string
    this.url = url ?? ''; //string
    this.thumbnail = thumbnail; //string
    if (subscribers) this.subscribers = subscribers;
    if (membershipUrl) this.membershipUrl = membershipUrl ?? null; //string (for backcompat)
  }
}

declare class PlatformAuthorMembershipLink {
  id: PlatformID;
  name: string;
  url: string;
  thumbnail: string;
  subscribers?: any;
  membershipUrl?: string | null;

  constructor(
    id: PlatformID,
    name: string,
    url: string,
    thumbnail: string,
    subscribers?: any,
    membershipUrl?: string | null,
  ) {
    this.id = id ?? PlatformID(); //PlatformID
    this.name = name ?? ''; //string
    this.url = url ?? ''; //string
    this.thumbnail = thumbnail; //string
    if (subscribers) this.subscribers = subscribers;
    if (membershipUrl) this.membershipUrl = membershipUrl ?? null; //string
  }
}

declare interface PlatformVideoDef {
  id: PlatformID;
  name: string;
  description: string;
  thumbnails: Thumbnails;
  author: PlatformAuthorLink;
  uploadDate?: number;
  datetime: number;
  url: string;
  duration?: number;
  viewCount: number;
  isLive: boolean;
  shareUrl?: any;
}

declare class PlatformVideo extends PlatformContent {
  plugin_type: string;
  shareUrl: any;
  duration: number;
  viewCount: number;
  isLive: boolean;

  constructor(obj: PlatformVideoDef) {
    super(obj, 1);
    obj = obj ?? {};
    this.plugin_type = 'PlatformVideo';
    this.shareUrl = obj.shareUrl;

    this.duration = obj.duration ?? -1; //Long
    this.viewCount = obj.viewCount ?? -1; //Long

    this.isLive = obj.isLive ?? false; //Boolean
  }
}

declare interface PlatformVideoDetailsDef extends PlatformVideoDef {
  description: string;
  video: VideoSourceDescriptor | null;
  dash?: DashSource | null;
  hls?: HLSSource | null;
  live?: IVideoSource | null;
  rating: RatingLikesDislikes;
  subtitles: ISubtitleSource[];
}

interface ISubtitleSource {
  name: String;
  url: String?;
  format: String?;
  getSubtitles?: Function;
}

declare class PlatformVideoDetails extends PlatformVideo {
  plugin_type: string;
  description: string;
  video: VideoSourceDescriptor;
  dash: any;
  hls: any;
  live: any;
  rating: any;
  subtitles: any[];
  getContentRecommendations: () => VideoPager;

  constructor(obj: PlatformVideoDetailsDef) {
    super(obj);
    obj = obj ?? {};
    this.plugin_type = 'PlatformVideoDetails';

    this.description = obj.description ?? ''; //String
    this.video = obj.video ?? {}; //VideoSourceDescriptor
    this.dash = obj.dash ?? null; //DashSource, deprecated
    this.hls = obj.hls ?? null; //HLSSource, deprecated
    this.live = obj.live ?? null; //VideoSource

    this.rating = obj.rating ?? null; //IRating
    this.subtitles = obj.subtitles ?? [];
  }
}

declare interface PlatformContentDef {
  id: PlatformID;
  name: string;
  thumbnails: Thumbnails;
  author: PlatformAuthorLink;
  datetime: integer;
  url: string;
}

declare interface PlatformPostDef extends PlatformContentDef {
  thumbnails: string[];
  thumbnails: Thumbnails[];
  images: string[];
  description: string;
}

class PlatformPost extends PlatformContent {
  plugin_type: string;
  thumbnails: Thumbnails[];
  images: any[];
  description: string;

  constructor(obj) {
    super(obj, 2);
    obj = obj ?? {};
    this.plugin_type = 'PlatformPost';
    this.thumbnails = obj.thumbnails ?? [];
    this.images = obj.images ?? [];
    this.description = obj.description ?? '';
  }
}

class PlatformPostDetails extends PlatformPost {
  plugin_type: string;
  rating: any;
  textType: number;
  content: string;

  constructor(obj) {
    super(obj);
    obj = obj ?? {};
    this.plugin_type = 'PlatformPostDetails';
    this.rating = obj.rating ?? RatingLikes(-1);
    this.textType = obj.textType ?? 0;
    this.content = obj.content ?? '';
  }
}

// Sources
declare interface IVideoSourceDescriptor {}

declare interface MuxVideoSourceDescriptorDef {
  isUnMuxed: boolean;
  videoSources: VideoSource[];
}
declare class MuxVideoSourceDescriptor implements IVideoSourceDescriptor {
  constructor(obj: MuxVideoSourceDescriptorDef);
}

declare interface UnMuxVideoSourceDescriptorDef {
  isUnMuxed: boolean;
  videoSources: VideoSource[];
}
declare class UnMuxVideoSourceDescriptor implements IVideoSourceDescriptor {
  constructor(
    videoSourcesOrObj: VideoSource[] | UnMuxVideoSourceDescriptorDef,
    audioSources?: AudioSource[],
  );
}

declare interface IVideoSource {}

declare interface IAudioSource {}

declare interface VideoUrlSourceDef extends IVideoSource {
  width: number;
  height: number;
  container: string;
  codec: string;
  name: string;
  bitrate: number;
  duration: number;
  url: string;
}
declare class VideoUrlSource {
  constructor(obj: VideoUrlSourceDef);
}

declare interface YTVideoSourceDef extends VideoUrlSourceDef {
  itagId: number;
  initStart: number;
  initEnd: number;
  indexStart: number;
  indexEnd: number;
}
declare class YTVideoSource extends VideoUrlSource {
  constructor(obj: YTVideoSourceDef);
}

declare interface AudioUrlSourceDef extends IAudioSource {
  name: string;
  bitrate: number;
  container: string;
  codecs: string;
  duration: number;
  url: string;
  language: string;
}
declare class AudioUrlSource {
  constructor(obj: AudioUrlSourceDef);
}

declare interface YTAudioSourceDef extends AudioUrlSourceDef {
  itagId: number;
  initStart: number;
  initEnd: number;
  indexStart: number;
  indexEnd: number;
  audioChannels: number;
}
declare class YTAudioSource extends AudioUrlSource {
  constructor(obj: YTAudioSourceDef);
}

declare interface HLSSourceDef {
  name: string;
  duration: number;
  url: string;
}
declare class HLSSource implements IVideoSource {
  constructor(obj: HLSSourceDef);
}

declare interface DashSourceDef {
  name: string;
  duration: number;
  url: string;
}
declare class DashSource implements IVideoSource {
  constructor(obj: DashSourceDef);
}

// Channel
declare interface PlatformChannelDef {
  id: PlatformID;
  name: string;
  thumbnail: string;
  banner: string;
  subscribers: number;
  description: string;
  url: string;
  links?: Map<string>;
}

declare class PlatformChannel {
  plugin_type: string;
  id: string;
  name: string;
  thumbnail: string;
  banner: string;
  subscribers: number;
  description: string;
  url: string;
  urlAlternatives: string[];
  links: Map<string>;

  constructor(obj: PlatformChannelDef) {
    obj = obj ?? {};
    this.plugin_type = 'PlatformChannel';
    this.id = obj.id ?? ''; //string
    this.name = obj.name ?? ''; //string
    this.thumbnail = obj.thumbnail; //string
    this.banner = obj.banner; //string
    this.subscribers = obj.subscribers ?? 0; //integer
    this.description = obj.description; //string
    this.url = obj.url ?? ''; //string
    this.urlAlternatives = obj.urlAlternatives ?? [];
    this.links = obj.links ?? {}; //Map<string,string>
  }
}

// Ratings
declare interface IRating {
  type: number;
}
declare class RatingLikes implements IRating {
  constructor(likes: number);
}
declare class RatingLikesDislikes implements IRating {
  constructor(likes: number, dislikes: number);
}
declare class RatingScaler implements IRating {
  constructor(value: number);
}

declare interface CommentDef {
  contextUrl: string;
  author: PlatformAuthorLink;
  message: string;
  rating: IRating;
  date: number;
  replyCount: number;
  context: any;
}

//Temporary backwards compat
declare class Comment extends PlatformComment {
  constructor(obj: CommentDef) {
    super(obj);
  }
}

declare class PlaybackTracker {
  nextRequest: number;

  constructor(interval) {
    this.nextRequest = interval ?? 10 * 1000;
  }

  setProgress(seconds: number): void {
    throw new ScriptImplementationException(
      'Missing required setProgress(seconds) on PlaybackTracker',
    );
  }
}

declare class LiveEventPager {
  plugin_type: string;
  _entries: { [key: string]: any };

  constructor(results: LiveEvent[], hasMore: boolean, context: any) {
    this.plugin_type = 'LiveEventPager';
    this.results = results ?? [];
    this.hasMore = hasMore ?? false;
    this.context = context ?? {};
    this.nextRequest = 4000;
  }

  hasMorePagers(): boolean {
    return this.hasMore;
  }
  nextPage(): LiveEventPager {
    return new Pager([], false, this.context);
  } //Could be self

  delete(name: string): void;
  get(name: string): any;
  getAll(name: string): any[];
  has(name: string): boolean;
  set(name: string, value: any): void;
  forEach(
    callback: (value: any, name: string, pager: LiveEventPager) => void,
  ): void;
  keys(): IterableIterator<string>;
  values(): IterableIterator<any>;
  entries(): IterableIterator<[string, any]>;
  clear(): void;
}

declare class LiveEvent {
  plugin_type: string;
  id: string;
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  thumbnail: string;
  state: number;
  upcomingText: string;
  viewCount: number;
  tracker: PlaybackTracker;
  rating: any;

  constructor(type: string) {
    this.type = type;
  }
}
declare class LiveEventComment extends LiveEvent {
  constructor(
    name: string,
    message: string,
    thumbnail?: string,
    colorName,
    badges,
  ) {
    super(1);
    this.name = name;
    this.message = message;
    this.thumbnail = thumbnail;
    this.colorName = colorName;
    this.badges = badges;
  }
}

declare class LiveEventEmojis extends LiveEvent {
  constructor(emojis) {
    super(4);
    this.emojis = emojis;
  }
}

declare class LiveEventDonation extends LiveEvent {
  constructor(
    amount: number,
    name: string,
    message: string,
    thumbnail?: string,
    expire?: any,
    colorDonation?: string,
  ) {
    super(5);
    this.amount = amount;
    this.name = name;
    this.message = message ?? '';
    this.thumbnail = thumbnail;
    this.expire = expire;
    this.colorDonation = colorDonation;
  }
}

declare class LiveEventViewCount extends LiveEvent {
  constructor(viewCount: number) {
    super(10);
    this.viewCount = viewCount;
  }
}

declare class LiveEventRaid extends LiveEvent {
  constructor(targetUrl: string, targetName: string, targetThumbnail: string) {
    super(100);
    this.targetUrl = targetUrl;
    this.targetName = targetName;
    this.targetThumbnail = targetThumbnail;
  }
}

//Pagers

declare class ContentPager {
    hasMore: boolean;
    results: object;
    context: any;
    plugin_type: string;

  constructor(results: [], hasMore: boolean, context: any) {
    this.plugin_type = 'ContentPager';
    this.results = results ?? [];
    this.hasMore = hasMore ?? false;
    this.context = context ?? {};
  }

  hasMorePagers() {
    return this.hasMore;
  }
  nextPage() {
    return new ContentPager([], false, this.context);
  }
}

declare class VideoPager {
  hasMore: boolean;
  context: any;

  constructor(results: PlatformVideo[], hasMore?: boolean, context?: any) {
    this.plugin_type = 'VideoPager';
    this.results = results ?? [];
    this.hasMore = hasMore ?? false;
    this.context = context ?? {};
  }
  hasMorePagers(): boolean {
    return this.hasMore;
  }
  nextPage(): VideoPager {
    return new VideoPager([], false, this.context);
  }
}

declare class ChannelPager {
  hasMore: boolean;
  context: any;

  constructor(results: PlatformVideo[], hasMore: boolean, context: any) {
    this.plugin_type = 'ChannelPager';
    this.results = results ?? [];
    this.hasMore = hasMore ?? false;
    this.context = context ?? {};
  }

  hasMorePagers(): boolean {
    return this.hasMore;
  }
  nextPage(): ChannelPager {
    return new Pager([], false, this.context);
  }
}

declare class PlaylistPager {
  hasMore: boolean;
  context: any;

  constructor(results: PlatformPlaylist[], hasMore?: boolean, context?: any) {
    this.plugin_type = 'PlaylistPager';
    this.results = results ?? [];
    this.hasMore = hasMore ?? false;
    this.context = context ?? {};
  }

  hasMorePagers() {
    return this.hasMore;
  }
  nextPage() {
    return new Pager([], false, this.context);
  }
}

declare class CommentPager {
  context: any;

  constructor(results: PlatformComment[], hasMore: boolean, context: any) {
    this.plugin_type = 'CommentPager';
    this.results = results ?? [];
    this.hasMore = hasMore ?? false;
    this.context = context ?? {};
  }
  hasMorePagers(): boolean {
    return this.hasMore;
  }
  nextPage(): CommentPager {
    return new Pager([], false, this.context);
  }
}

declare interface Map<T> {
  [Key: string]: T;
}

function throwException(ttype: string, message: string): void {
  throw new Error('V8EXCEPTION:' + type + '-' + message);
}

let plugin = {
  config: {},
  settings: {},
};

// Plugin configuration
// To override by plugin
interface Source {
  getHome(): VideoPager;

  enable(conf: Config, settings: Map<string>, saveStateStr: string): void;

  setSettings(settings: any): void;

  disable(): void;

  searchSuggestions(query: string): string[];
  search(
    query: string,
    type: string,
    order: string,
    filters: FilterGroup[],
  ): VideoPager;
  getSearchCapabilities(): ResultCapabilities;

  // Optional
  searchChannelVideos?(
    channelUrl: string,
    query: string,
    type: string,
    order: string,
    filters: FilterGroup[],
  ): VideoPager;
  getSearchChannelVideoCapabilities?(): ResultCapabilities;

  isChannelUrl(url: string): boolean;
  getChannel(url: string): PlatformChannel | null;

  getChannelVideos(
    url: string,
    type: string,
    order: string,
    filters: FilterGroup[],
  ): VideoPager;
  getChannelCapabilities(): ResultCapabilities;
  getSearchChannelContentsCapabilities(): ResultCapabilities;
  getPeekChannelTypes(): string[];
  peekChannelContents(url, type): PlatformVideo[];

  isVideoDetailsUrl(url: string): boolean;
  getVideoDetails(url: string): PlatformVideoDetails;

  // Optional
  getComments?(url: string): CommentPager;
  getSubComments?(comment: Comment): CommentPager;

  // Optional
  getUserSubscriptions?(): string[];
  getUserPlaylists?(): string[];

  // Optional
  isPlaylistUrl?(url: string): boolean;

  searchPlaylists(query, type, order, filters);

  getPlaylist?(url: string): PlatformPlaylistDetails;

  isContentDetailsUrl(url: string): boolean;

  getChannelContents(
    url: string,
    type?: string,
    order?: string,
    filters?: Map<String, List<String>>,
  ): VideoPager;

  searchChannels(query: string): ChannelPager;

  getContentDetails(url: string): PlatformVideoDetails;

  getComments(url: string): CommentPager;

  getSubComments(comment: PlatformComment): CommentPager;

  getChannelPlaylists(url: string): PlaylistPager;

  searchChannelContents(
    channelUrl: string,
    query: string,
    type: string,
    order: string,
    filters: FilterGroup[],
  ): VideoPager;

  saveState(): void;

  getChannelTemplateByClaimMap(): any;

  getContentRecommendations(url: string, initialData: any): VideoPager;
}

function parseSettings(settings) {
  if (!settings) return {};
  let newSettings = {};
  for (let key in settings) {
    if (typeof settings[key] == 'string')
      newSettings[key] = JSON.parse(settings[key]);
    else newSettings[key] = settings[key];
  }
  return newSettings;
}

function log(obj: string | object) {
  if (obj) {
    console.log(obj);
    if (typeof obj == 'string') bridge.log(obj);
    else bridge.log(JSON.stringify(obj, null, 4));
  }
}

function encodePathSegment(segment) {
  return encodeURIComponent(segment).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

class URLSearchParams {
  constructor(init) {
    this._entries = {};
    if (typeof init === 'string') {
      if (init !== '') {
        init = init.replace(/^\?/, '');
        const attributes = init.split('&');
        let attribute;
        for (let i = 0; i < attributes.length; i++) {
          attribute = attributes[i].split('=');
          this.append(
            decodeURIComponent(attribute[0]),
            attribute.length > 1 ? decodeURIComponent(attribute[1]) : '',
          );
        }
      }
    } else if (init instanceof URLSearchParams) {
      init.forEach((value, name) => {
        this.append(value, name);
      });
    }
  }
  append(name, value) {
    value = value.toString();
    if (name in this._entries) {
      this._entries[name].push(value);
    } else {
      this._entries[name] = [value];
    }
  }
  delete(name) {
    delete this._entries[name];
  }
  get(name) {
    return name in this._entries ? this._entries[name][0] : null;
  }
  getAll(name) {
    return name in this._entries ? this._entries[name].slice(0) : [];
  }
  has(name) {
    return name in this._entries;
  }
  set(name, value) {
    this._entries[name] = [value.toString()];
  }
  forEach(callback) {
    let entries;
    for (let name in this._entries) {
      if (this._entries.hasOwnProperty(name)) {
        entries = this._entries[name];
        for (let i = 0; i < entries.length; i++) {
          callback.call(this, entries[i], name, this);
        }
      }
    }
  }
  keys() {
    const items = [];
    this.forEach((value, name) => {
      items.push(name);
    });
    return createIterator(items);
  }
  values() {
    const items = [];
    this.forEach((value) => {
      items.push(value);
    });
    return createIterator(items);
  }
  entries() {
    const items = [];
    this.forEach((value, name) => {
      items.push([value, name]);
    });
    return createIterator(items);
  }
  toString() {
    let searchString = '';
    this.forEach((value, name) => {
      if (searchString.length > 0) searchString += '&';
      searchString +=
        encodeURIComponent(name) + '=' + encodeURIComponent(value);
    });
    return searchString;
  }
}

const source: Source;

declare var IS_TESTING: boolean;

let Type = {
  Source: {
    Dash: 'DASH',
    HLS: 'HLS',
    STATIC: 'Static',
  },
  Feed: {
    Videos: 'VIDEOS',
    Streams: 'STREAMS',
    Mixed: 'MIXED',
    Live: 'LIVE',
    Subscriptions: 'SUBSCRIPTIONS',
  },
  Order: {
    Chronological: 'CHRONOLOGICAL',
  },
  Date: {
    LastHour: 'LAST_HOUR',
    Today: 'TODAY',
    LastWeek: 'LAST_WEEK',
    LastMonth: 'LAST_MONTH',
    LastYear: 'LAST_YEAR',
  },
  Duration: {
    Short: 'SHORT',
    Medium: 'MEDIUM',
    Long: 'LONG',
  },
  Text: {
    RAW: 0,
    HTML: 1,
    MARKUP: 2,
  },
  Chapter: {
    NORMAL: 0,

    SKIPPABLE: 5,
    SKIP: 6,
    SKIPONCE: 7,
  },
};

let Language = {
  UNKNOWN: 'Unknown',
  ARABIC: 'ar',
  SPANISH: 'es',
  FRENCH: 'fr',
  HINDI: 'hi',
  INDONESIAN: 'id',
  KOREAN: 'ko',
  PORTUGUESE: 'pt',
  PORTBRAZIL: 'pt',
  RUSSIAN: 'ru',
  THAI: 'th',
  TURKISH: 'tr',
  VIETNAMESE: 'vi',
  ENGLISH: 'en',
};

interface HttpResponse {
  isOk: boolean;
  body: string;
  code: number;
}

domParser.parseFromString(detailsRequestHtml.body, "text/html")

let domParser = {
  parseFromString: function (elementText: string, contentType: string): Unit {},
}

//Package Bridge (variable: bridge)
let bridge = {
  /**
   * @param {String} label
   * @param {String} data
   * @return {Unit}
   **/
  devSubmit: function (label: string, data: string): Unit {},

  /**
   * @return {Boolean}
   **/
  isLoggedIn: function (): boolean {},

  /**
   * @param {String} str
   * @return {Unit}
   **/
  log: function (str: string): Unit {},

  /**
   * @param {String} str
   * @return {Unit}
   **/
  throwTest: function (str: string): Unit {},

  /**
   * @param {String} str
   * @return {Unit}
   **/
  toast: function (str: string): Unit {},
};

//Package Http (variable: http)

interface IHttp {
  /**
   * @param {String} url
   * @param {Map} headers
   * @param {Boolean} useAuth
   * @return {BridgeHttpResponse}
   **/
  GET(
    url: string,
    headers: Map<string, string>,
    useAuth?: boolean,
  ): BridgeHttpResponse;

  /**
   * @param {String} url
   * @param {String} body
   * @param {Map} headers
   * @param {Boolean} useAuth
   * @return {BridgeHttpResponse}
   **/
  POST(
    url: string,
    body: string,
    headers: Map<string, string>,
    useAuth: boolean,
  ): BridgeHttpResponse;

  /**
   * @return {BatchBuilder}
   **/
  batch(): BatchBuilder;

  /**
   * @param {Boolean} withAuth
   * @return {PackageHttpClient}
   **/
  getDefaultClient(withAuth: boolean): PackageHttpClient;

  /**
   * @param {Boolean} withAuth
   * @return {PackageHttpClient}
   **/
  newClient(withAuth: boolean): PackageHttpClient;

  /**
   * @param {String} method
   * @param {String} url
   * @param {Map} headers
   * @param {Boolean} useAuth
   * @return {BridgeHttpResponse}
   **/
  request(
    method: string,
    url: string,
    headers: Map<string, string>,
    useAuth: boolean,
  ): BridgeHttpResponse;

  /**
   * @param {String} method
   * @param {String} url
   * @param {String} body
   * @param {Map} headers
   * @param {Boolean} useAuth
   * @return {BridgeHttpResponse}
   **/
  requestWithBody(
    method: string,
    url: string,
    body: string,
    headers: Map<string, string>,
    useAuth: boolean,
  ): BridgeHttpResponse;

  /**
   * @param {String} url
   * @param {Map} headers
   * @param {Boolean} useAuth
   * @return {SocketResult}
   **/
  socket(
    url: string,
    headers: Map<string, string>,
    useAuth: boolean,
  ): SocketResult;

  /**
   * @param {Map} headers
   * @return {void}
   **/
  setDefaultHeaders(headers: Map<string, string>): void;

  /**
   * @param {Boolean} allow
   * @return {void}
   * */
  setDoAllowNewCookies(allow: boolean): void;
}

let http: IHttp;

interface IPager<T> {
  hasMorePages(): Boolean;
  nextPage();
  getResults(): List<T>;
}
