//Theme Switch
const links=document.querySelectorAll(".alternate-style")
totalLinks=links.length;
function setActiveStyle(color){
  for(let i=0;i<totalLinks;i++){
    if(color===links[i].getAttribute("title")){
      links[i].removeAttribute("disabled")
    }
    else{
      links[i].setAttribute("disabled","true");
    }
  }
  try{ localStorage.setItem('portfolioTheme', color); }catch(e){}
}


//Light / Dark Mode switch
const modeSwitch=document.querySelectorAll(".mode-switch")
totalmodeSwitch=modeSwitch.length;
for(let i=0; i<totalmodeSwitch; i++){
  modeSwitch[i].addEventListener("change",function(){
    if(this.value==="dark"){
      document.body.className="dark";
      try{ localStorage.setItem('portfolioMode','dark'); }catch(e){}
    }
    else{
      document.body.className="";
      try{ localStorage.setItem('portfolioMode','light'); }catch(e){}
    }
  })
}
document.querySelector(".toggle-theme-switcher").addEventListener("click",()=>{
  document.querySelector(".theme-switch").classList.toggle("open");
})

// Restore saved theme & mode on load
(function(){
  try{
    var savedTheme = localStorage.getItem('portfolioTheme');
    var savedMode  = localStorage.getItem('portfolioMode');
    if(savedTheme && savedTheme !== 'blue'){ setActiveStyle(savedTheme); }
    if(savedMode === 'dark'){
      document.body.className = 'dark';
      var darkRadio = document.querySelector('.mode-switch[value="dark"]');
      var lightRadio = document.querySelector('.mode-switch[value="light"]');
      if(darkRadio){ darkRadio.checked = true; }
      if(lightRadio){ lightRadio.checked = false; }
    }
  }catch(e){}
})();