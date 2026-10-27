(() => {
 const sidebar=document.querySelector(".docs-sidebar");
 const menuButton=document.querySelector(".mobile-menu-button");
 const navLinks=Array.from(document.querySelectorAll(".docs-nav a"));
 if(menuButton&&sidebar)menuButton.addEventListener("click",()=>{const open=sidebar.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));});
 navLinks.forEach(link=>link.addEventListener("click",()=>{if(sidebar)sidebar.classList.remove("open");if(menuButton)menuButton.setAttribute("aria-expanded","false");}));
 const fallback=value=>new Promise((resolve,reject)=>{const field=document.createElement("textarea");field.value=value;field.setAttribute("readonly","");field.style.position="fixed";field.style.opacity="0";document.body.appendChild(field);field.select();let ok=false;try{ok=document.execCommand("copy");}catch{}field.remove();ok?resolve():reject(new Error("Copy failed"));});
 document.querySelectorAll(".code").forEach(details=>{const button=details.querySelector(".copy"),code=details.querySelector("pre code");if(!button||!code)return;button.addEventListener("click",async()=>{const original=button.textContent;try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(code.textContent);else await fallback(code.textContent);button.textContent="Copied";}catch{button.textContent="Copy failed";}window.setTimeout(()=>{button.textContent=original;},1400);});});
 const sections=navLinks.map(link=>document.querySelector(link.getAttribute("href"))).filter(section=>section&&section.id);
 if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;navLinks.forEach(link=>{if(link.getAttribute("href")==="#"+entry.target.id)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");});}),{rootMargin:"-12% 0px -70% 0px"});sections.forEach(section=>observer.observe(section));}
})();
