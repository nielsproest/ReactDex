const worker = () => {
	let reportImg = (event,r,time,size,url,success) => {
		console.log(r.headers);
		console.log("reportImg", {
			url: url,
			success: success,
			cached: r != null && r.headers.get("X-Cache") == "HIT",
			bytes: size,
			duration: time
		});
	
		/*event.respondWith((async () => {
			return fetch(
				"https://api.mangadex.network/report", 
				{
					method: "POST",
					headers: {"Content-Type": "application/json"},
					body: null
				}
			);
		})());*/
	}

	let fetchImg = (event,url) => {
		const when = Date.now()
		return fetch(url)
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

	onmessage = async (e) => {
		const { msg } = e.data;

		console.log("IW Message", msg)

		if (msg.cmd == "fetch") {
			var page = 0;
			var pages = 1;

			while (page<pages) {
				const chapterId=msg.args[0];
				const JSN = await fetch(
					`${msg.CORS_BYPASS}https://api.mangadex.org/at-home/server/${chapterId}`,
				).then((rsp) => rsp.json());
				const imgs = msg.datasave ? JSN.chapter.dataSaver : JSN.chapter.data;
				console.log("IMG", imgs);

				//TODO: Preload limiting
				pages = imgs.length;
				for (; page<imgs.length; page++) {
					const file = imgs[page];
					const url = await fetchImg(e,`${msg.CORS_BYPASS}${JSN.baseUrl}/data/${JSN.chapter.hash}/${file}`);

					if (url == null) {
						await sleep(250); //TODO: Exponential wait
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
}

let code = worker.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], { type: "application/javascript" });
export default URL.createObjectURL(blob);