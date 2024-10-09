interface FP_Config {
    streamFormat?: string;
}

interface FP_Creator {
    id: string;
    owner: string;
    title: string;
    urlname: string;
    description: string;
    about: string;
    category: FP_Creator_Category | string;
    cover: FP_Parent_Image | null;
    icon: FP_Parent_Image | null;
    liveStream: FP_LiveStream | null;
    subscriptionPlans: FP_SubscriptionPlans[] | null;
    discoverable: boolean;
    subscriberCountDisplay: string;
    incomeDisplay: boolean;
    socialLinks?: object;
}

interface FP_Channel {
    id: string;
    creator: string;
    title: string;
    urlname: string;
    about: string;
    order: number;
    cover: FP_Parent_Image | null;
    card: FP_Parent_Image | null;
    icon: FP_Parent_Image | null;
    tags: any[];
}

interface FP_Creator_Category {
    title: string;
}

interface FP_Image {
    width: number;
    height: number;
    path: string;
}

interface FP_Parent_Image extends FP_Image {
    childImages: FP_Image[];
}

interface FP_LiveStream {
    id: string;
    title: string;
    description: string;
    thumbnail: FP_Parent_Image | null;
    owner: string;
    streamPath: string;
    offline: FP_LiveStream_Offline | null;
}

interface FP_LiveStream_Offline {
    title: string;
    description: string;
    thumbnail: FP_Parent_Image | null;
}

interface FP_SubscriptionPlans {
    id: string;
    title: string;
    description: string;
    price: string;
    priceYearly: string;
    currency: string;
    logo: FP_Parent_Image | null;
    interval: string;
    featured: boolean;
    allowGrandfatheredAccess: boolean;
    discordServers: any[];
    discordRoles: any[];
}

interface FP_Post {
    id: string;
    guid: string;
    title: string;
    text: string;
    type: string;
    tags: string[];
    attachmentOrder: string[];
    metadata: FP_Post_Metadata;
    releaseDate: string;
    likes: number;
    dislikes: number;
    score: number;
    comments: number;
    creator: FP_Creator;
    channel: FP_Channel;
    wasReleasedSilently: boolean;
    thumbnail: FP_Parent_Image | null;
    isAccessible: boolean;
    userInteraction: any[];
    videoAttachments: FP_VideoAttachment[];
    audioAttachments: FP_AudioAttachment[];
    pictureAttachments: FP_PictureAttachment[];
    galleryAttachments: FP_GalleryAttachment[];
}

interface FP_Post_Metadata {
    hasVideo: boolean;
    videoCount: number;
    videoDuration: number;
    hasAudio: boolean;
    audioCount: number;
    audioDuration: number;
    hasPicture: boolean;
    pictureCount: number;
    hasGallery: boolean;
    galleryCount: number;
    isFeatured: boolean;
}

interface FP_Attachment {
    id: string;
    guid: string;
    title: string;
    type: string;
    description: string;
    creator: string;
    likes: number;
    dislikes: number;
    score: number;
    isProcessing: boolean;
    primaryBlogPost: string;
    isAccessible: boolean;
}

interface FP_VideoAttachment extends FP_Attachment {
    type: "video";
    duration: number;
    thumbnail: FP_Parent_Image | null;
}

interface FP_AudioAttachment extends FP_Attachment {
    type: "audio";
    duration: number;
    waveform: FP_AudioWaveform;
}

interface FP_PictureAttachment extends FP_Attachment {
    type: "picture";
}

interface FP_GalleryAttachment extends FP_Attachment {
    type: "gallery";
}

interface FP_AudioWaveform  {
    dataSetLength: number;
    highestValue: number;
    lowestValue: number;
    data: number[];
}

interface FP_Delivery {
    groups: FP_DeliveryGroup[];
}

interface FP_DeliveryGroup {
    origin: FP_DeliveryOrigin[];
    variants: FP_DeliveryVariant[];
}

interface FP_DeliveryOrigin {
    url: string;
}

interface FP_DeliveryVariant {
    name: string;
    label: string;
    url: string;
    mimeType: string;
    order: number;
    hidden: boolean;
    enabled: boolean;
    meta: FP_DeliveryMetadata;
}

interface FP_DeliveryMetadata {
    video?: FP_DeliveryVideoMetadata;
    audio?: FP_DeliveryAudioMetadata;
}

interface FP_DeliveryVideoMetadata {
    codec: string;
    codecSimple: string;
    bitrate: FP_Metadata_Bitrate;
    width: number;
    height: number;
    isHdr: boolean;
    fps: number;
    mimeType: string;
}

interface FP_DeliveryAudioMetadata {
    codec: string;
    bitrate: FP_Metadata_Bitrate;
    mimeType: string;
    channelCount: number;
    samplerate: number;
}

interface FP_Metadata_Bitrate {
    average: number;
    maximum?: number;
}
