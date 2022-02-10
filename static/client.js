const app = Vue.createApp({
	data: () => ({
		password: null,
		files: [],
		popup: {
			enabled: false,
		},
		selectionState: "none",
	}),
	mounted(){
		this.auth();
		this.getFiles()
	},
	methods: {
		openUpload(){this.popup.enabled = true; this.popup.type = "upload"},
		fileChanged(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.file = files[0]
    },
		async getIcon(filename){
			let icon = await require('file-icons-js').getClass(filename);
			if (icon.includes("icon-file-text")){
				icon = icon.replace("icon-file-text", "default-icon");
			}
			if (icon.includes("icon-file-pdf")){
				icon = icon.replace("icon-file-pdf", "default-icon");
			}
			return icon;
		},
		upload(){
			this.popup.type = "loading";
			this.apiReq("POST /api/uploadFile", {
				file: this.file,
				data: {
					path: `/root/${this.file.name}`
				}
			}).then(() => {
				this.popup.enabled = false;
			})
		},
		getFiles(){
			this.apiReq("GET /api/getFiles").then(async ({files}) => {
				console.log("Got, ", files);
				this.files = files;
				for (let idx in this.files){
						 this.getIcon(this.files[idx].realName).then(icon => {
							 this.files[idx].icon = icon;
						 })
				}
			})
		},
		refresh(){this.getFiles()},
		auth(){
			this.password = localStorage.password || prompt("What is the password");
			localStorage.password = this.password;
		},
		setSelectionState(target, evt_target){
			if (target && evt_target){
				let idx = this.files.findIndex(i => JSON.stringify(i) === JSON.stringify(target));
				this.files[idx].selected = evt_target.closest("input").checked;
			}
			let files = this.files;
			if (!files.find(i => i.selected)){
				this.selectionState = "none";
			}
			if (files.find(i => i.selected) && !files.every(i => i.selected)){
				this.selectionState = "some";
			}
			if (files.every(i => i.selected)){
				this.selectionState = "every";
			}
		},
		selectAllClicked(){
			switch (this.selectionState){
				case "every":
					files(false)
					break;
				case "some":
					files(false)
					break;
				case "none":
					files(true)
					break;
				default:
					break;
			};
			function files(state){
				[...document.querySelectorAll("#file_explorer > ul > li input[type=checkbox]")].filter(i => i.checked !== state).forEach(i => i.click());
				// app.files = [...app.files.map(i => {
				// 	return {...i, selected: state};
				// })]
			}
			this.setSelectionState();
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