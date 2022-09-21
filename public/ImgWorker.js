//TODO: This file compiles to invalid JavaScript
//Thus its in the public folder

let reportImg = (event,r,time,size,url,success) => {
	console.log(r.headers);
	const data = {
		url: url,
		success: success,
		cached: r != null && r.headers.get("X-Cache") == "HIT",
		bytes: size,
		duration: time
	};
	console.log("reportImg", data);

	/*event.respondWith((async () => {
		return fetch(
			"https://api.mangadex.network/report", 
			{
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: data
			}
		);
	})());*/
}

function makeRequest(method, url) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.responseType = "blob";
		xhr.open(method, url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				const cacheHit = xhr.getResponseHeader("X-Cache");
				console.log(cacheHit);
				resolve(URL.createObjectURL(xhr.response));
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		xhr.send();
	});
}

let fetchImg2 = async (event,url) => {
	const resp = await makeRequest("GET", url);
	console.log(resp);
	return resp;
}
let fetchImg = async (event,url) => {
	const when = Date.now()
	var headers = null;
	return await fetch(url)
		.then((r) => {
			headers = r.headers;
			return r;
		})
		.then((r) => r.blob())
		.then((blob) => URL.createObjectURL(blob))
		.catch((r) => {
			/*console.log("fetchImg failed");
			reportImg(
				event,
				r,
				Date.now() - when,
				0,
				url,
				false
			);*/
			return null;
		});
}

let sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

let exponentialBackoff = (i) => {
	return Math.min(Math.pow(2,i)+(Math.random()*1000),32000)
}

onmessage = async (e) => {
	const { msg } = e.data;

	console.log("IW Message", msg)

	if (msg.cmd == "fetch") {
		var page = 0;
		var pages = 1;
		var i=0;

		while (page<pages) {
			const chapterId=msg.args[0];
			const dlpages=msg.args[1];
			const JSN = await fetch(
				`${msg.CORS_BYPASS}https://api.mangadex.org/at-home/server/${chapterId}`,
			).then((rsp) => rsp.json());
			const imgs = msg.datasave ? JSN.chapter.dataSaver : JSN.chapter.data;
			console.log("IMG", imgs);

			pages = imgs.length;
			for (; page<imgs.length; page++) {
				if (dlpages != null && !dlpages.includes(page)) {
					continue;
				}

				const file = imgs[page];
				const url = await fetchImg2(e,`${msg.CORS_BYPASS}${JSN.baseUrl}/data/${JSN.chapter.hash}/${file}`);

				if (url == null) {
					await sleep(exponentialBackoff(i));
					i += 1;
					break;
				}

				postMessage({
					result: {
						page: page,
						pages: imgs.length,
						url: url
					}
				});
			}
		}
	}
};