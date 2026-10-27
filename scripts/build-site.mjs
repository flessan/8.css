import { cp, mkdir, rm } from "node:fs/promises";
const root=new URL("../",import.meta.url), output=new URL("../site/",import.meta.url);
const files=["index.html","LICENSE","AGENTS.md","llms.txt","llms-full.txt"];
const directories=["dist","docs","examples"];
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
for(const file of files)await cp(new URL(file,root),new URL(file,output));
for(const dir of directories)await cp(new URL(dir,root),new URL(dir,output),{recursive:true});
console.log("Built static site into site/");
