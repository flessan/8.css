import { cp, mkdir, rm } from "node:fs/promises";
const root=new URL("../",import.meta.url), output=new URL("../site/",import.meta.url);
const files=["index.html","LICENSE","AGENTS.md","THIRD-PARTY-NOTICES.md","llms.txt","llms-full.txt"];
const directories=["dist","docs","examples","styles"];
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
for(const file of files)await cp(new URL(file,root),new URL(file,output));
for(const dir of directories)await cp(new URL(dir,root),new URL(dir,output),{recursive:true});
// Demo-only wallpaper assets: full resolution artwork plus the generated thumbnails.
await mkdir(new URL("styles/images/",output),{recursive:true});
await cp(new URL("styles/images/wallpapers/",root),new URL("styles/images/wallpapers/",output),{recursive:true});
await cp(new URL("styles/images/Windows8RTM/",root),new URL("styles/images/Windows8RTM/",output),{recursive:true});
await cp(new URL("styles/images/Windows8.1RTMWallpapers/",root),new URL("styles/images/Windows8.1RTMWallpapers/",output),{recursive:true});
await cp(new URL("styles/images/start-screen.jpg",root),new URL("styles/images/start-screen.jpg",output));
// The wallpaper page lives with the other examples and needs dist/ + styles/.
console.log("Copied the wallpaper pack into the static site.");
console.log("Built static site into site/");
