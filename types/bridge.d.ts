// https://gitlab.futo.org/videostreaming/grayjay/-/blob/master/app/src/main/java/com/futo/platformplayer/engine/packages/PackageHttp.kt#L139
interface BridgeHttpResponse {
    url: string;
    code: number;
    headers: object | null;
    body: string;
    isOk: boolean;
}
