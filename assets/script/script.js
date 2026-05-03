// Preloader
window.addEventListener("load",function(){
    document.querySelector(".preloader").classList.add("opacity-0");
    setTimeout(function(){
      document.querySelector(".preloader").style.display="none";
    },1000)
  })
  // Aside Navbar
  const nav=document.querySelector(".nav"),
  navList=nav.querySelectorAll("li"),
  totalNavList=navList.length,
  allSection=document.querySelectorAll(".section"),
  totalSection=allSection.length;
  for(let i=0;i<totalNavList;i++){
    const a=navList[i].querySelector("a");
    a.addEventListener("click",function(){
      for(let i=0;i<totalSection;i++){
        allSection[i].classList.remove("back-section");
      }
      for(let j=0; j<totalNavList;j++){
        if(navList[j].querySelector("a").classList.contains("active")){
          allSection[j].classList.add("back-section")
        }
        navList[j].querySelector("a").classList.remove("active");
      }
      this.classList.add("active");
      showSection(this);
      if(window.innerWidth<1200){
        asideSectionTogglerBtn();
      }
    })
  }
  function showSection(element){
    for(let i=0;i<totalSection;i++){
      allSection[i].classList.remove("active");
    }
    const target=element.getAttribute("href").split("#")[1];
    document.querySelector("#"+target).classList.add("active")
  }
  const navTogglerBtn=document.querySelector(".nav-toggler"),
  aside=document.querySelector(".aside");
  navTogglerBtn.addEventListener("click",()=>{
    asideSectionTogglerBtn();
  })
  function asideSectionTogglerBtn(){
    aside.classList.toggle("open")
    navTogglerBtn.classList.toggle("open");
    for(let i=0;i<totalSection;i++){
      allSection[i].classList.toggle("open");
    }
  }

// ===== Home Hero: Particle Canvas =====
(function () {
  var canvas = document.getElementById('portfolioParticles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, particles;
  var COUNT = 60, MAX_DIST = 120;
  var COLORS = ['rgba(99,102,241,', 'rgba(139,92,246,', 'rgba(129,140,248,'];
  function resize() {
    var section = canvas.parentElement;
    W = canvas.width = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function mkP() { return { x: rnd(0,W), y: rnd(0,H), vx: rnd(-0.25,0.25), vy: rnd(-0.25,0.25), r: rnd(1.5,2.8), c: COLORS[Math.floor(Math.random()*COLORS.length)] }; }
  function init() { resize(); particles = Array.from({length:COUNT}, mkP); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    for (var i=0;i<particles.length;i++) {
      var p=particles[i];
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;
      if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c+'0.7)'; ctx.fill();
      for(var j=i+1;j<particles.length;j++){
        var q=particles[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<MAX_DIST){
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
          ctx.strokeStyle='rgba(99,102,241,'+(1-d/MAX_DIST)*0.25+')';
          ctx.lineWidth=0.7; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  init(); draw();
  window.addEventListener('resize', init);
})();

// ===== Home Hero: Typewriter =====
(function () {
  var el = document.getElementById('introTypewriter');
  if (!el) return;
  var roles = ['Software Developer','AI Quality Analyst','Prompt Engineer','Data Scientist','NLP Specialist'];
  var ri=0, ci=0, del=false;
  function tick() {
    var cur = roles[ri];
    if (!del) { el.textContent=cur.slice(0,ci+1); ci++; if(ci===cur.length){del=true;setTimeout(tick,1800);return;} setTimeout(tick,80); }
    else { el.textContent=cur.slice(0,ci-1); ci--; if(ci===0){del=false;ri=(ri+1)%roles.length;setTimeout(tick,400);return;} setTimeout(tick,45); }
  }
  tick();
})();

// ===== AI Chat Widget =====
(function () {
  const WORKER_URL = 'https://bera-chat.YOUR-SUBDOMAIN.workers.dev'; // Replace after deploying the worker

  const box = document.getElementById('aiChatBox');
  const toggle = document.getElementById('aiChatToggle');
  const closeBtn = document.getElementById('aiChatClose');
  const input = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiChatSend');
  const messages = document.getElementById('aiChatMessages');

  let open = false;
  box.classList.add('hidden');

  function toggleChat() {
    open = !open;
    box.classList.toggle('hidden', !open);
  }

  toggle.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', function () { open = true; toggleChat(); });

  function appendMessage(text, role) {
    const div = document.createElement('div');
    div.className = 'ai-msg ai-msg-' + role;
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    appendMessage(text, 'user');
    const typing = appendMessage('Thinking...', 'bot ai-msg-typing');

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      typing.remove();
      appendMessage(data.reply || 'Sorry, I could not get a response.', 'bot');
    } catch (e) {
      typing.remove();
      appendMessage('Could not reach the AI service. Please try again later.', 'bot');
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
})();

// Contact form — opens default mail client with pre-filled message
function sendContactEmail() {
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const subject = document.getElementById('contact-subject').value.trim();
  const message = document.getElementById('contact-message').value.trim();
  const status = document.getElementById('contact-status');

  if (!name || !email || !message) {
    status.style.color = '#e40017';
    status.textContent = 'Please fill in your name, email, and message.';
    return;
  }

  const body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
  const mailto = 'mailto:ohamadikee98@gmail.com'
    + '?subject=' + encodeURIComponent(subject || 'Portfolio Enquiry from ' + name)
    + '&body=' + encodeURIComponent(body);

  window.location.href = mailto;
  status.style.color = '#57d131';
  status.textContent = 'Opening your mail client...';
}