const LOGO_URL = 'https://i.imgur.com/I7sZuLM.jpeg';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1451275072907247768/LrlLl54X2us-sLRSg1xipbqPZhBeZrYUdg7o51g9zKtB6knNqf_eVt5q7G-U7NJqMHYU'; 
const CLIENT_ID = '1451284313109954650';

const REDIRECT_URI = window.location.href.split('#')[0];
let userData = null;
let evidenceLinks = []; 

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('mainLogo').src = LOGO_URL;
    document.getElementById('modalLogo').src = LOGO_URL;
    checkAuth();
});

function loginDiscord() {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;
    window.location.href = url;
}

function checkAuth() {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get('access_token');
    if (accessToken) {
        fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(res => res.json())
        .then(data => { userData = data; revealForm(data); })
        .catch(err => { window.location.hash = ''; });
        window.history.replaceState({}, document.title, REDIRECT_URI);
    }
}

function revealForm(user) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('formContainer').style.display = 'block';
    
    const profile = document.getElementById('topProfile');
    profile.style.display = 'flex';
    
    document.getElementById('userName').innerText = user.username;
    if (user.avatar) {
        document.getElementById('userAvatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    } else {
        document.getElementById('userAvatar').src = `https://cdn.discordapp.com/embed/avatars/0.png`;
    }
}

function isValidUrl(string) {
    try {
        const newUrl = new URL(string);
        return newUrl.protocol === "http:" || newUrl.protocol === "https:";
    } catch (err) {
        return false;
    }
}

function addLink() {
    const input = document.getElementById('linkInput');
    const url = input.value.trim();
    
    if (!url) { showError("Введите ссылку!"); return; }
    if (!isValidUrl(url)) { showError("Это не ссылка! (Нужно http/https)"); return; }

    evidenceLinks.push(url);
    renderLinks();
    input.value = ''; 
}

function showError(message) {
    document.getElementById('errorMsgText').innerText = message;
    openModal('errorModal');
}

function removeLink(index) {
    evidenceLinks.splice(index, 1); 
    renderLinks(); 
}

function renderLinks() {
    const container = document.getElementById('linksContainer');
    container.innerHTML = ''; 
    evidenceLinks.forEach((link, index) => {
        const div = document.createElement('div');
        div.className = 'link-item';
        div.innerHTML = `<span class="link-text">${index + 1}. ${link}</span><button type="button" class="btn-remove" onclick="removeLink(${index})">✕</button>`;
        container.appendChild(div);
    });
}

const ranks = { "1": "2 | Посыльный", "2": "3 | Сикарио", "3": "4 | Стрелок", "4": "5 | Сборщик", "5": "6 | Оператор", "6": "7 | Лейтенант" };
const currentNames = { "1": "1 | Сокол", "2": "2 | Посыльный", "3": "3 | Сикарио", "4": "4 | Стрелок", "5": "5 | Сборщик", "6": "6 | Оператор", "7": "7 | Лейтенант" };

function updateNextRank() {
    const currentVal = document.getElementById('currentRank').value;
    const nextRankSelect = document.getElementById('newRank');
    nextRankSelect.innerHTML = "";
    if (ranks[currentVal]) {
        const option = document.createElement('option');
        option.value = ranks[currentVal]; option.text = ranks[currentVal]; option.selected = true;
        nextRankSelect.appendChild(option);
    } else {
        const option = document.createElement('option');
        option.text = "Макс. ранг / Спец"; nextRankSelect.appendChild(option);
    }
}

document.getElementById('rankForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (evidenceLinks.length === 0) { showError("Вы не прикрепили доказательства!"); return; }
    
    const linksFormatted = evidenceLinks.map((link, i) => `[Доказательство ${i+1}](${link})`).join('\n');
    let avatarUrl = userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : LOGO_URL;

    const fullName = document.getElementById('fullname').value;
    const passportId = document.getElementById('passportId').value; 

    const data = {
        username: "Onyx System",
        embeds: [{
            title: "💀 ОТЧЕТ О ПОВЫШЕНИИ",
            color: 0x99aab5,
            thumbnail: { url: avatarUrl },
            image: { url: LOGO_URL }, 
            fields: [
                { name: "👤 Агент", value: `<@${userData.id}>`, inline: true },
                { name: "🏷 Позывной", value: `**${fullName}**`, inline: true },
                { name: "🆔 ID", value: `**${passportId}**`, inline: true },
                { name: "📈 Повышение", value: `${currentNames[document.getElementById('currentRank').value]} ➡ ${document.getElementById('newRank').value}`, inline: false },
                { name: "📎 Доказательства", value: linksFormatted, inline: false }
            ],
            footer: { text: `Security ID: ${userData.id}` },
            timestamp: new Date()
        }]
    };

    fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(response => {
        if (response.ok || response.status === 204) {
            openModal('successModal'); 
            document.getElementById('rankForm').reset();
            evidenceLinks = []; 
            renderLinks(); 
        } else {
            alert("Ошибка сети!");
        }
    });
});

function openModal(modalId) { 
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById(modalId);
    overlay.style.display = 'flex'; 
    setTimeout(() => { modal.classList.add('active'); }, 10); 
}
function closeModal(modalId) { 
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById(modalId);
    modal.classList.remove('active'); 
    setTimeout(() => { overlay.style.display = 'none'; }, 300); 
}
function createSnowflake() { 
    const snow = document.createElement('div'); 
    snow.className = 'snowflake'; 
    snow.style.left = Math.random() * 100 + 'vw'; 
    snow.style.width = Math.random() * 4 + 2 + 'px'; 
    snow.style.height = snow.style.width; 
    snow.style.animationDuration = Math.random() * 3 + 2 + 's'; 
    document.body.appendChild(snow); 
    setTimeout(() => snow.remove(), 5000); 
}
setInterval(createSnowflake, 100);