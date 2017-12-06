const youtube_config = require("../../youtube.config.json");
const axios = require("axios");
const ytdl = require('ytdl-core');

class YouTube
{
    /**
     * Check if ear rapes are enabled by config
     *
     * @return {boolean}
     */
    static earRapeEnabled() {
        if( !youtube_config.ear_rapes_enabled ){
            return false;
        }
        return youtube_config.ear_rapes_enabled;
    }

    /**
     * Get the YouTube api key defined by config
     *
     * @return {string}
     */
    static get API_KEY() {
        if( !youtube_config.API_KEY ){
            throw "Undefined API_KEY in youtube.config.json";
        }
        return youtube_config.API_KEY;
    }

    /**
     * Get the array of blacklisted YouTube ids
     *
     * @return {array}
     */
    static get BLACKLIST() {
        return youtube_config.blacklist;
    }

    /**
     * Get the YouTube watch url
     *
     * @return {string}
     */
    static get WATCH_VIDEO_URL() {
        return 'https://www.youtube.com/watch?v=';
    }

    /**
     * Get the YouTube search API uri
     *
     * @return {string}
     */
    static get API_URL() {
        return 'https://www.googleapis.com/youtube/v3/search';
    }

    /**
     * Static list of ear rapes
     *
     * @return {array}
     */
    static get EAR_RAPES() {
        return [
            "Q27UzUZuMMk",
            "gg7IQuHpVOs",
            "stlZEKoJg10",
            "wAj0BCaV4vU",
            "oxxgzQbtKMg",
            "dgha9S39Y6M",
            "qO-9P28ESBQ",
            "sxPMHtiJh30",
            "Dmr03ek_yB8",
            "6ua6OahzdwQ",
            "equC7GEUt6k",
        ];
    }

    /**
     * Get random ear rape
     *
     * @return {string}
     */
    static get RAPE() {
        return YouTube.EAR_RAPES[Math.floor(Math.random() * YouTube.EAR_RAPES.length)]
    }

    /**
     * Get random ear rape
     *
     * @return {string}
     */
    static get RANDOM_RAPE_STREAM() {
        return YouTube.getDataStream(YouTube.RAPE, false);
    }

    /**
     * Search for a youtube song
     *
     * @return {Promise}
     */
    static search( query ) {
        const query_url = `${YouTube.API_URL}?part=snippet&q=${query}&key=${YouTube.API_KEY}`;

        return new Promise( (then, reject) => {
            axios.get(query_url)
                .then( response => {
                    if(response.data.items[0].snippet.liveBroadcastContent === 'live')
                        return reject('I\'m sorry, I can\'t broadcast live streams 😔');

                    if(YouTube.BLACKLIST.indexOf(response.data.items[0].id.videoId) >= 0)
                        return reject('This song is blacklisted by the owner 😔');

                    return then(
                        {
                            "data": response.data.items[0].snippet,
                            "stream": YouTube.getDataStream(response.data.items[0].id.videoId, false),
                            "url": `${YouTube.WATCH_VIDEO_URL}${response.data.items[0].id.videoId}`,
                            "videoId": response.data.items[0].id.videoId
                        }
                    );
                })
                .catch(function (error) {
                    throw error;
                });
        });
    }

    static isBlacklisted( videoId ) {
        return YouTube.BLACKLIST.indexOf(videoId) >= 0;
    }

    /**
     * Get data stream from YouTube videoId
     *
     * @return {Promise}
     */
    static getDataStream( videoId, validateBlacklist ) {
        if (!validateBlacklist && typeof validateBlacklist !== 'undefined'){
            return ytdl(`${YouTube.WATCH_VIDEO_URL}${videoId}`, {filter: 'audioonly'});
        } else {
            return new Promise((then, reject) => {
                if (YouTube.isBlacklisted(videoId))
                    return reject('This song is blacklisted by the owner 😔');

                return then(ytdl(`${YouTube.WATCH_VIDEO_URL}${videoId}`, {filter: 'audioonly'}));
            });
        }
    }

    constructor() {
        throw "Class YouTube must explicitly be called statically";
    }
}

module.exports = YouTube;