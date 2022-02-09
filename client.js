const app = Vue.createApp({
	data: () => ({
		password: null,
		files: [],
	}),
	mounted(){
		this.auth();
		this.getFiles()
	},
	methods: {
		fileChanged(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.file = files[0]
    },
		upload(){
			this.apiReq("POST /api/uploadFile", {
				file: this.file,
				data: {
					test: "other data",
				}
			}).then(console.log)
		},
		getFiles(){
			this.apiReq("GET /api/getFiles").then(({files}) => {
				console.log("Got, ", files);
				this.files = files;
			})
		},
		refresh(){this.getFiles()},
		auth(){
			this.password = localStorage.password || prompt("What is the password");
			localStorage.password = this.password;
		},
		apiReq(thing, body = {}){
			thing = thing.trim();
			let formData = new FormData();			
			for (let key in body) {
					if (key === "data"){
						body[key] = JSON.stringify(body[key]);
						console.log(`${key} is object: %o`, body[key])
					}
			    formData.append(key, body[key]);
			}
			formData.set("password", this.password);
			
			return new Promise(resolve => {
				let method = thing.split(" ")[0].toUpperCase().trim();
				console.log("Api request with ", {method, formData})
				let url = "https://" + location.hostname + thing.split(" ")[1];
				url = new URL(url);
				console.log({url})
				url.searchParams.append('password', this.password);
				fetch(url, {
					...(method === "GET" ? {} : {body: formData}),
					method,
				}).then(res => res.json()).then((json) => {
					resolve(json);
					if (!url.pathname.includes("/api/getFiles")){this.refresh()}
				})
			})
		}
	}
}).mount("#app")