const LOGO_URL = 'https://i.imgur.com/I7sZuLM.jpeg';

const CLIENT_ID = '1451347130227757191'; 
const GUILD_ID = '1451234520006266933';
const ADMIN_ROLE_IDS = ['1451258370127429804', '1451257290702196827', '1451348634359697418']; 

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1451685341089108181/FU6g9i_5oqUwC0qn-IejPqXa97bCOgQl2HVBDAhW5wG2Lmj5BY_PpEXrdJ6YqqeWvH5I';
const WEBHOOK_BLACKLIST = 'https://discord.com/channels/1451234520006266933/1451237366441181428';

const BOT_API_URL = 'https://onyx-cartel-system.discloud.app/api/players'; 

const REDIRECT_URI = window.location.href.split('#')[0];
let userData = null;

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('mainLogo').src = LOGO_URL;
    document.getElementById('modalLogo').src = LOGO_URL;
    checkAuth();
});

function loginDiscord() {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify%20guilds.members.read`;
    window.location.href = url;
}

function checkAuth() {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    let accessToken = fragment.get('access_token');

    if (accessToken) {
        localStorage.setItem('discord_token', accessToken);
        window.history.replaceState({}, document.title, REDIRECT_URI);
    } else {
        accessToken = localStorage.getItem('discord_token');
    }

    if (accessToken) {
        fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(res => {
            if (!res.ok) throw new Error('Token expired');
            return res.json();
        })
        .then(data => { 
            userData = data; 
            checkGuildRoles(accessToken, data);
        })
        .catch(err => { 
            console.log(err);
            localStorage.removeItem('discord_token');
            document.getElementById('loginContainer').style.display = 'block';
        });
    } else {
        document.getElementById('loginContainer').style.display = 'block';
    }
}

function checkGuildRoles(token, user) {
    fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, { 
        headers: { Authorization: `Bearer ${token}` } 
    })
    .then(res => res.json())
    .then(member => {
        let isAdmin = false;
        if (member.roles) {
            isAdmin = member.roles.some(roleId => ADMIN_ROLE_IDS.includes(roleId));
        }
        revealForm(user, isAdmin);
        if(isAdmin) loadBotPlayers();
    })
    .catch(err => {
        revealForm(user, false); 
    });
}

function revealForm(user, isAdmin) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('formContainer').style.display = 'block';
    
    if (isAdmin) {
        document.getElementById('adminBlacklistBtn').style.display = 'block';
    }

    const profile = document.getElementById('topProfile');
    profile.style.display = 'flex';
    document.getElementById('userName').innerText = user.username;
    
    const avatar = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
    
    document.getElementById('userAvatar').src = avatar;
}

function loadBotPlayers() {
    if(!BOT_API_URL) return;

    const select = document.getElementById('playerSelect');
    select.innerHTML = '<option value="" selected disabled>Загрузка из базы...</option>';

    fetch(BOT_API_URL)
    .then(res => res.json())
    .then(players => {
        select.innerHTML = '<option value="" selected disabled>Выберите игрока...</option><option value="manual">-- Ввести вручную --</option>';
        players.forEach(p => {
            const opt = document.createElement('option');
            opt.value = JSON.stringify({ name: p.name, id: p.id });
            opt.text = `${p.name} (${p.id})`;
            select.appendChild(opt);
        });
    })
    .catch(err => {
        select.innerHTML = '<option value="manual" selected>Ошибка связи (Ввести вручную)</option>';
    });
}

function fillPlayerData() {
    const select = document.getElementById('playerSelect');
    const val = select.value;

    if (val === 'manual') {
        document.getElementById('blName').value = "";
        document.getElementById('blId').value = "";
    } else if (val) {
        const player = JSON.parse(val);
        document.getElementById('blName').value = player.name;
        document.getElementById('blId').value = player.id;
    }
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
    
    if (!WEBHOOK_URL) { alert("Ошибка: Вебхук не настроен!"); return; }

    const fullName = document.getElementById('fullname').value;
    const passportId = document.getElementById('passportId').value; 
    const age = document.getElementById('age').value;
    const reason = document.getElementById('promoteReason').value;
    
    let avatarUrl = userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : LOGO_URL;

    const data = {
        username: "Onyx System",
        embeds: [{
            title: "📄 ЗАЯВЛЕНИЕ НА ПОВЫШЕНИЕ",
            color: 0x99aab5,
            thumbnail: { url: avatarUrl },
            image: { url: LOGO_URL }, 
            fields: [
                { name: "👤 Агент", value: `<@${userData.id}>`, inline: true },
                { name: "🏷 Позывной", value: `**${fullName}**`, inline: true },
                { name: "🎂 Возраст", value: `${age} лет`, inline: true },
                { name: "🆔 ID", value: `**${passportId}**`, inline: true },
                { name: "📈 Повышение", value: `${currentNames[document.getElementById('currentRank').value]} ➡ ${document.getElementById('newRank').value}`, inline: false },
                { name: "📝 Почему должны повысить?", value: `>>> ${reason}`, inline: false }
            ],
            footer: { text: `Security ID: ${userData.id}` },
            timestamp: new Date()
        }]
    };

    fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(res => { 
        if (res.ok || res.status === 204) { 
            openModal('successModal'); 
            document.getElementById('rankForm').reset(); 
        } else { 
            showError("Ошибка отправки в Discord"); 
        } 
    });
});

document.getElementById('blacklistForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!WEBHOOK_BLACKLIST) { alert("Ошибка: Вебхук ЧС не настроен!"); return; }

    const name = document.getElementById('blName').value;
    const id = document.getElementById('blId').value;
    const reason = document.getElementById('blReason').value;
    const duration = document.getElementById('blDuration').value;

    closeModal('blacklistModal');
    let avatarUrl = userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : LOGO_URL;

    const data = {
        username: "Onyx Security",
        embeds: [{
            title: "⛔ ЧЕРНЫЙ СПИСОК",
            color: 0x8B0000, 
            thumbnail: { url: avatarUrl },
            fields: [
                { name: "👮 Администратор", value: `<@${userData.id}>`, inline: true },
                { name: "👤 Нарушитель", value: `**${name}**`, inline: true },
                { name: "🆔 ID Нарушителя", value: `\`${id}\``, inline: true },
                { name: "⚖️ Причина", value: reason, inline: false },
                { name: "⏳ Срок наказания", value: duration, inline: false }
            ],
            footer: { text: `BLACKLISTED BY ${userData.username}` },
            timestamp: new Date()
        }]
    };

    fetch(WEBHOOK_BLACKLIST, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(res => { 
        if (res.ok || res.status === 204) { 
            openModal('successModal'); 
            document.getElementById('blacklistForm').reset(); 
        } else { 
            showError("Ошибка отправки в Discord"); 
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
function showError(msg) {
    document.getElementById('errorMsgText').innerText = msg;
    openModal('errorModal');
}

function createSnowflake() { 
    const snow = document.createElement('div'); 
    snow.className = 'snowflake'; 
    snow.style.left = Math.random() * 100 + '%'; 
    const size = Math.random() * 4 + 2 + 'px'; 
    snow.style.width = size; snow.style.height = size; 
    snow.style.animationDuration = Math.random() * 3 + 2 + 's'; 
    const container = document.getElementById('snow-container');
    if (container) container.appendChild(snow);
    setTimeout(() => snow.remove(), 5000); 
}
setInterval(createSnowflake, 100);