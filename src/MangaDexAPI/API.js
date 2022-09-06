import axios from "axios"
import axiosRetry from 'axios-retry';
import React from "react";
import { isDevBuild, slugify, getTimeDiff } from "../utility";

/*
 * Duty: Take care of ALL MangaDex API interactions
 * Duty: Handle login tokens (and saving them)
 */

export const CORS_BYPASS = isDevBuild() ? "" : "https://corsheaderproxy.corry.workers.dev/corsproxy/";

axiosRetry(axios, { 
	retries: 3,
	retryCondition: e => {
		return e.response.status >= 500 || e.response.status === 401
	},
	retryDelay: axiosRetry.exponentialDelay
});

//TODO: Checkout scripts\reader\api.js
class MdData {
	constructor(data,p=null) {
		this.parent = p;
		this.relationships = {};
		this._Inject(data);
	}
	//I cannot modify the constructor to do post processing, because of attribute injection
	//So all mods must go in postFix
	postFix() {}
	_InjectRelation(rtype, data) {
		for (var i in this.relationships[rtype]) {
			const k = this.relationships[rtype][i];
			if (i.id == k.id) {
				if (!("attributes" in k)) {
					this.relationships[rtype][i] = data;
					break;
				}
			}
		}

		this.relationships[rtype].push(data);
	}
	_Inject(data) {
		for (const [key, value] of Object.entries(data)) {
			if (key != "relationships") {
				this[key] = value;
			}
		}

		if ("relationships" in data) {
			for (var key in data["relationships"]) {
				const rdata = data["relationships"][key];
				const rtype = data["relationships"][key]["type"];

				if (!(rtype in this.relationships)) {
					this.relationships[rtype] = [];
				}

				//TODO: Overwrite same id
				this._InjectRelation(rtype, RELATION_MAP[rtype](rdata,this));
			}
		}
		this.postFix();
	}
	async Resolve(custom={}) {
		var params = {
			"ids": [this.id]
		};

		Object.assign(params, custom);

		const req = await axios.get(`${CORS_BYPASS}https://api.mangadex.org/${this.type}`, { params: params });
		this._Inject(req.data.data[0]);
	}
	PutRelationship(type,data) {
		if (!(type in this.relationships)) {
			this.relationships[type] = [];
		}
		this.relationships[type].push(data);
	}
	GetRelationship(type, def=null) {
		if (!(type in this.relationships)) {
			return def;
		}
		return this.relationships[type];
	}
	getUpdateDiff() {
		const ms = (Date.now() - Date.parse(this.attributes.updatedAt));
		return getTimeDiff(ms);
	}
	getId() {
		return this.id;
	}
}

class Chapter extends MdData {
	isAvailable() {
		return this.attributes.pages > 0;
	}
	isExternal() {
		const ext = this.attributes.externalUrl;
		return ext != null && ext != "";
	}
	getExternalUrl() {
		return this.attributes.externalUrl;
	}
	/*getTitle() {
		const chap = this.attributes.chapter;
		const vol = this.attributes.volume;

		if (vol == null && chap == null) {
			return "Oneshot";
		}
		if (vol == null) {
			return `Chapter ${chap}`;
		}

		return `Vol. ${vol} Chapter ${chap}`;
	}*/
	getTitle(numOnly = false) {
		var title = "";
		if (this.attributes.volume) { title += `Vol. ${this.attributes.volume} ` }
		if (this.attributes.chapter) { title += `Ch. ${this.attributes.chapter} ` }
		if (this.attributes.title && !numOnly) { title += `${this.attributes.title}` }
		if (!title) { title = "Oneshot"; }
		return title.trim();
	}
	getUrl() {
		if (this.isExternal()) {
			return `/outside/${this.getExternalUrl()}`;
		}

		return `/chapter/${this.id}`;
	}
	getLang() {
		return this.attributes.translatedLanguage;
	}
}

class Group extends MdData {
	getName() {
		return this.attributes.name;
	}
	getUrl() {
		return `/group/${this.id}/${slugify(this.getName())}`
	}
	getLang() {
		return this.attributes.focusedLanguages.length > 0 ? this.attributes.focusedLanguages[0] : "unknown"
	}
}

class User extends MdData {
	getName() {
		return this.attributes.username;
	}
	getUrl() {
		return `/user/${this.id}/${slugify(this.getName())}`
	}
}

class Author extends MdData {
	getName() {
		return this.attributes.name;
	}
	getUrl() {
		return `/author/${this.id}/${slugify(this.getName())}`
	}
}
class Artist extends MdData {
	getName() {
		return this.attributes.name;
	}
	getUrl() {
		return `/author/${this.id}/${slugify(this.getName())}`
	}
}

class Tag extends MdData {}

class CustomList extends MdData {}

class Cover extends MdData {
	getTitle() {
		return `Volume ${this.attributes.volume} (Uploader: ${this.GetRelationship("user")[0].getName()})`;
	}
	getCover() {
		return `${CORS_BYPASS}https://uploads.mangadex.org/covers/${this.parent.id}/${this.attributes.fileName}`;
	}
	getCover256() {
		return `${this.getCover()}.256.jpg`;
	}
	getCover512() {
		return `${this.getCover()}.512.jpg`;
	}
}

class Manga extends MdData {
	postFix() {
		super.postFix();
		if ("attributes" in this && "tags" in this.attributes) {
			this.attributes.tags = this.attributes.tags.map((tdata) => new Tag(tdata, this));
		}
	}
	_getMap(map) {
		if (map == null) {
			return "";
		}

		//TODO: User config lang

		//Default en
		if ("en" in map) {
			return map["en"];
		}
		if ("ja-ro" in map) {
			return map["ja-ro"];
		}

		//Pick a random
		const titles = Object.values(map);
		if (titles.length > 0) {
			return titles[0];
		}

		return "";
	}
	getDesc() {
		return this._getMap(this.attributes.description);
	}
	getTitle() {
		return this._getMap(this.attributes.title);
	}
	getUrl() {
		return `/manga/${this.id}/${slugify(this.getTitle())}`;
	}
	getCover = () => this.GetRelationship("cover_art")[0].getCover();
	getCover256 = () => this.GetRelationship("cover_art")[0].getCover256();
	getCover512 = () => this.GetRelationship("cover_art")[0].getCover512();
	isHentai() {
		return this.attributes.contentRating.includes("erotica") || this.attributes.contentRating.includes("pornographic");
	}
}

//TODO: Move into login file
export class UserToken {
	constructor(props, boot=false) {
		this.state = {
			session: props.session,
			refresh: props.refresh,
			user: props.user != null ? (new User(props.user)) : null,
			date: props.date != null ? props.date : Date.now(),
			valid: null
		}

		this.setAuth();
		if (!boot) {
			this.refreshTimer();
			this.getInfo();
		}
	}

	setAuth() {
		axios.defaults.headers.common['Authorization'] = this.state.session;
		localStorage.setItem("USERTOKEN", JSON.stringify(this.state));
	}
	refreshTimer() {
		//Token expires after 15 minutes

		//Time diff since token
		const diff = Date.now() - this.state.date;
		//In minutes
		const dm = diff / 1000 / 60;

		//Desired refresh time (10 minutes)
		const mins = 10;

		//Time until refresh
		const time = (mins - dm) * 60 * 1000;
		console.log("RefreshTimer", time);

		setTimeout(() => {
			this.refresh().then((_) => {
				if (this.state != undefined) {
					this.refreshTimer();
				}
			})
		}, time)
	}

	valid() {
		return axios.get(`${CORS_BYPASS}https://api.mangadex.org/auth/check`).then((req) => {
			this.state.valid = req.data.isAuthenticated;
			if (this.state.valid) {
				this.refreshTimer();
			}
		})
	}

	getUser() {
		return this.state.user;
	}

	getInfo() {
		return axios.get(`${CORS_BYPASS}https://api.mangadex.org/user/me`).then((u) => {
			this.state.user = new User(u.data.data);
			localStorage.setItem("USERTOKEN", JSON.stringify(this.state));
		})
	}

	refresh() {
		if (this.state == undefined) {
			return;
		}

		return axios.post(`${CORS_BYPASS}https://api.mangadex.org/auth/refresh`, { 
			token: this.state.refresh
		}).then((req) => {
			console.log("Refresh", req);

			if (req.data.result != "ok") {
				this.state = undefined;
			} else {
				this.state.session = req.data.token.session;
				this.state.refresh = req.data.token.refresh;
				this.state.valid = true;
				this.state.date = Date.now();
				this.setAuth();
			}
		});
	}
}

const RELATION_MAP = {
	"manga": (data,p) => new Manga(data,p),
	"chapter": (data,p) => new Chapter(data,p),
	"cover_art": (data,p) => new Cover(data,p),
	"author": (data,p) => new Author(data,p),
	"artist": (data,p) => new Artist(data,p),
	"scanlation_group": (data,p) => new Group(data,p),
	"tag": (data,p) => new Tag(data,p),
	"user": (data,p) => new User(data,p),
	"custom_list": (data,p) => new CustomList(data,p),
}

class APIResponse {
	constructor(data) {
		for (const [key, value] of Object.entries(data)) {
			this[key] = value;
		}
	}
}
function APIResponseGen(data, ndata=null) {
	if (ndata != null) {
		data.data = ndata;
	}
	return new APIResponse(data);
}

class DexFS {
	constructor() {}

	//TODO: localStorage save login token
	/*
	//https://api.mangadex.org/docs/static-data/
	//https://api.mangadex.org/docs/static-data/#manga-order-options
	//https://api.mangadex.org/docs/docs/manga/
	order:
	title, year, createdAt, updatedAt, latestUploadedChapter, followedCount, relevance

	includes[]: manga, chapter, cover_art, author, artist, scanlation_group, tag, user, custom_list
	*/

	//TODO: Order
	//TODO: contentRating limits (contentRating )
	//TODO: tag limits (excludedTags)
	//TODO: Language limits (availableTranslatedLanguage)
	//TODO: Caching

	async _manga(url, custom={}, resolveRatings=false, limit=30, offset=0) {
		var params = {
			limit: limit,
			offset: offset,
			"order[updatedAt]": "desc",
			"includes": ["cover_art"]
			//"includes": Object.keys(RELATION_MAP)
		};

		Object.assign(params, custom);

		const req = await axios.get(`${CORS_BYPASS}${url}`, { params: params, headers: { "Origin": "localhost:3000" } });
		const mangas = req.data.data.map((m) => new Manga(m));

		//TODO: Move to Manga class
		if (resolveRatings) {
			const sreq = await axios.get(`${CORS_BYPASS}https://api.mangadex.org/statistics/manga`, { params: {
				manga: mangas.map((m) => m.id)
			}});

			for (var uuid in sreq.data.statistics) {
				const res_m = sreq.data.statistics[uuid];
				mangas.filter((m) => m.id == uuid).forEach((m) => m.statistics = res_m);
			}
		}

		return APIResponseGen(req.data, mangas);
	}
	async manga(custom={}, resolveRatings=false, limit=30, offset=0) {
		Object.assign(custom, {"availableTranslatedLanguage": ["en"]});
		return this._manga("https://api.mangadex.org/manga", custom, resolveRatings, limit, offset);
	}
	//TODO: /rating
	//TODO: /manga/{id}/feed
	//TODO: /manga/read?ids[]={id}

	async getFollowedManga(limit=30, offset=0) {
		const chaps = await this._chapter("https://api.mangadex.org/user/follows/manga/feed", {
			"order[readableAt]": "desc",
			"includes": ["scanlation_group", "user"]
		});

		function getGroup(chap) {
			if (chap.GetRelationship("scanlation_group") != null) {
				return chap.GetRelationship("scanlation_group")[0].id;
			}
			//TODO: Get user instead
			return ""
		}

		chaps.data = await this.resolveByManga(chaps.data, getGroup);
		return chaps;
	}

	//TODO: Top manga by follows
	//TODO: Top manga by rating

	async _chapter(url, custom={}, limit=30, offset=0) {
		var params = {
			limit: limit,
			offset: offset,
			"translatedLanguage": ["en"],
			//"includes": Object.keys(RELATION_MAP)
		};
		//Possible:
		//scanlation_group, manga, user

		Object.assign(params, custom);
		//TODO: Make Browseable
		/*
		req.data.response: "collection",
		req.data.limit: 14,
		req.data.offset: 0,
		req.data.total: 724063
		*/

		const req = await axios.get(`${CORS_BYPASS}${url}`, { params: params });
		const ch = req.data.data.map((m) => new Chapter(m));
		return APIResponseGen(req.data, ch);
	}
	async chapter(custom={}, limit=30, offset=0) {
		return this._chapter("https://api.mangadex.org/chapter", custom, limit, offset);
	}
	async chapterPages(chapterId) {
		try {
			const req = await axios.get(`${CORS_BYPASS}https://api.mangadex.org/at-home/server/${chapterId}`);
			req.data.baseUrl = `${CORS_BYPASS}${req.data.baseUrl}`;
			return APIResponseGen(req.data);
		} catch (e) {
			return null;
		}
	}
	async readChapters(mangaId) {
		const req = await axios.get(`${CORS_BYPASS}https://api.mangadex.org/manga/${mangaId}/read`);
		return APIResponseGen(req.data);
	}
	async readChapter(chapterId) {
		const req = await axios.post(`${CORS_BYPASS}https://api.mangadex.org/chapter/${chapterId}/read`);
		return APIResponseGen(req.data);
	}
	async unreadChapter(chapterId) {
		const req = await axios.delete(`${CORS_BYPASS}https://api.mangadex.org/chapter/${chapterId}/read`);
		return APIResponseGen(req.data);
	}


	async cover(manga, custom={}, limit=100, offset=0) {
		var params = {
			limit: limit,
			offset: offset,
			//"includes": Object.keys(RELATION_MAP)
		};
		//Possible:
		//manga, user

		Object.assign(params, custom);

		const req = await axios.get(`${CORS_BYPASS}https://api.mangadex.org/cover`, { params: params });
		const ch = req.data.data.map((m) => new Cover(m, manga));
		return APIResponseGen(req.data, ch);
	}

	async aggregate(mangaId, custom={}) {
		var params = {
			"translatedLanguage": ["en"],
		};

		Object.assign(params, custom);

		const req = await axios.get(`${CORS_BYPASS}https://api.mangadex.org/manga/${mangaId}/aggregate`, { params: params });
		return APIResponseGen(req.data);
	}

	async followsManga(mangaId) {
		try {
			const req = await axios.get(`${CORS_BYPASS}https://api.mangadex.org/user/follows/manga/${mangaId}`);
			return req.data.result == "ok";
		} catch (e) {
			console.log(e);
			return false;
		}
	}
	async followManga(mangaId) {
		const req = await axios.post(`${CORS_BYPASS}https://api.mangadex.org/manga/${mangaId}/follow`);
		return req.data.result == "ok";
	}
	async unfollowManga(mangaId) {
		const req = await axios.delete(`${CORS_BYPASS}https://api.mangadex.org/manga/${mangaId}/follow`);
		return req.data.result == "ok";
	}

	//TODO: Move to advanced chapter display?
	async resolveByManga(items, resolver=(_) => "") {
		var mangas = [];

		function contains(ckey) {
			for (var i in mangas) {
				const [key,value] = mangas[i];
				if (key == ckey) {
					return true;
				}
			}
			return false;
		}
		function add(ckey, val) {
			for (var i in mangas) {
				const [key,value] = mangas[i];
				if (key == ckey) {
					value.PutRelationship("chapter", val);
					val.parent = value;
					return true;
				}
			}
			return false;
		}

		for (var key in items) {
			const chap = items[key];
			const mg = chap.GetRelationship("manga")[0];

			var id = `${mg.id}-${resolver(chap)}`;
			if (!contains(id)) {
				mg.PutRelationship("chapter", chap);
				chap.parent = mg;
				mangas.push([id, mg]);
			} else {
				add(id, chap);
			}
		}

		mangas = mangas.map(([key,value]) => value);

		var params = {
			"limit": 100,
			"offset": 0,
			"ids": mangas.map((m) => m.id),
			"includes": ["cover_art"]
		};

		//TODO: Standardize this entire procedure for future use
		const req = await axios.get(`${CORS_BYPASS}https://api.mangadex.org/manga`, { params: params });
		for (var i in req.data.data) {
			const res_m = req.data.data[i];
			mangas.filter((m) => m.id == res_m.id).forEach((m) => m._Inject(res_m));
		}

		return mangas;
	}

	//TODO: get top chapters in timelimit or something
	async mangaByChapterUpload(limit=30, offset=0) {
		const chaps = await this.chapter({
			"order[readableAt]": "desc",
			"includes": ["scanlation_group", "user"]
		}, limit, offset);

		function getGroup(chap) {
			if (chap.GetRelationship("scanlation_group") != null) {
				return chap.GetRelationship("scanlation_group")[0].id;
			}
			//TODO: Get user instead
			return ""
		}

		chaps.data = await this.resolveByManga(chaps.data, getGroup);
		return chaps;
	}

	async login(username, password) {
		try {
			const req = await axios.post(`${CORS_BYPASS}https://api.mangadex.org/auth/login`, { 
				username: username,
				password: password
			})
			console.log("Login", req);
		
			if (req.data.result == "ok") {
				return [new UserToken(req.data.token), req];
			}

			return [null, req];
		} catch (error) {
			return [null, error.message];
		}
	}
}
const API = new DexFS();

export default API;