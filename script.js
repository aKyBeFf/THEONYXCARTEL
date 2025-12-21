const LOGO_URL = 'https://i.imgur.com/I7sZuLM.jpeg';

const CLIENT_ID = '1451284313109954650'; 
const GUILD_ID = '1451234520006266933';
const ADMIN_ROLE_IDS = ['1451258370127429804', '1451257290702196827', '1451348634359697418']; 
const TECH_SUPPORT_ROLE_ID = '1451736104498888899';

const RANK_ROLE_IDS = {
    "1": "1451252022392131727",
    "2": "1451255428162916552",
    "3": "1451255653992628266",
    "4": "1451255819734876391",
    "5": "1451256069782507580",
    "6": "1451256164645081088",
    "7": "1451348361725739038",
    "8": "1451348634359697418",
    "9": "1451257290702196827",
    "10": "1451258370127429804"
};

const RANK_NAMES = {
    "1": "⦉ ◈ С О К О Л ◈ ⦊",
    "2": "⦉ ◈ П О С Ы Л Ь Н Ы Й ◈ ⦊",
    "3": "⦉ ◈ С И К А Р И О ◈ ⦊",
    "4": "⦉ ◈ Б О Е Ц Г Б Р ◈ ⦊",
    "5": "⦉ ◈ С Б О Р Щ И К ◈ ⦊",
    "6": "⦉ ◈ О П Е Р А Т О Р ◈ ⦊",
    "7": "⦉ ◈ Л Е Й Т Е Н А Н Т ◈ ⦊",
    "8": "⦉ ◈ Л И Д Е Р Г Б Р ◈ ⦊",
    "9": "⦉ ◈ К О Н С И Л Ь Е Р ◈ ⦊",
    "10": "⦉ ◈ Д О Н ◈ ⦊"
};

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1451275072907247768/LrlLl54X2us-sLRSg1xipbqPZhBeZrYUdg7o51g9zKtB6knNqf_eVt5q7G-U7NJqMHYU';
const WEBHOOK_BLACKLIST = 'https://discord.com/api/webhooks/1451685341089108181/FU6g9i_5oqUwC0qn-IejPqXa97bCOgQl2HVBDAhW5wG2Lmj5BY_PpEXrdJ6YqqeWvH5I';

const REDIRECT_URI = 'https://akybeff.github.io/THEONYXCARTEL/';
let userData = null;
let userMemberData = null; 

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('mainLogo').src = LOGO_URL;
    document.getElementById('modalLogo').src = LOGO_URL;
    checkAuth();
    setupInputs();
});

function setupInputs() {
    function formatPassportInput(inputElement) {
        inputElement.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 6) value = value.slice(0, 6);
            if (value.length > 3) value = value.slice(0, 3) + '-' + value.slice(3);
            this.value = value;
        });
    }

    formatPassportInput(document.getElementById('passportId'));
    formatPassportInput(document.getElementById('blId'));

    const ageInput = document.getElementById('age');
    const btnMinus = document.getElementById('ageMinus');
    const btnPlus = document.getElementById('agePlus');

    btnMinus.addEventListener('click', () => {
        let val = parseInt(ageInput.value) || 16;
        if (val > 1) ageInput.value = val - 1;
    });

    btnPlus.addEventListener('click', () => {
        let val = parseInt(ageInput.value) || 16;
        if (val < 99) ageInput.value = val + 1;
    });

    document.getElementById('techDebugBtn').addEventListener('click', () => {
        const consoleDiv = document.getElementById('debugConsole');
        const rolesList = userMemberData ? userMemberData.roles : "Нет данных";
        const calculatedRank = document.getElementById('currentRank').value;
        
        let debugText = `[INFO] User: ${userData.username} (${userData.id})\n`;
        debugText += `[ROLES] ${JSON.stringify(rolesList)}\n`;
        debugText += `[SYSTEM] Calculated Rank ID: ${calculatedRank}\n`;
        debugText += `[SYSTEM] Admin Access: ${document.getElementById('adminBlacklistBtn').style.display === 'block' ? 'YES' : 'NO'}\n`;
        
        consoleDiv.innerText = debugText;
        openModal('debugModal');
    });
}

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
        userMemberData = member; 
        let isAdmin = false;
        let isTech = false;
        let foundRank = 0;

        if (member.roles) {
            isAdmin = member.roles.some(roleId => ADMIN_ROLE_IDS.includes(roleId));
            isTech = member.roles.includes(TECH_SUPPORT_ROLE_ID);
            
            for (let [rankVal, roleId] of Object.entries(RANK_ROLE_IDS)) {
                if (member.roles.includes(roleId)) {
                    if (parseInt(rankVal) > foundRank) {
                        foundRank = parseInt(rankVal);
                    }
                }
            }
        }
        
        revealForm(user, isAdmin);
        updateRankDisplay(user, foundRank, isAdmin, isTech);
    })
    .catch(err => {
        console.error(err);
        revealForm(user, false); 
    });
}

function updateRankDisplay(user, rankVal, isAdmin, isTech) {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileRank = document.getElementById('profileRank');
    const profileBadges = document.getElementById('profileBadges');
    const techBtn = document.getElementById('techDebugBtn');
    
    const rankInput = document.getElementById('currentRank');

    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
    
    profileAvatar.src = avatarUrl;
    profileName.innerText = user.username;

    if (rankVal > 0) {
        profileRank.innerText = RANK_NAMES[rankVal];
        rankInput.value = rankVal;
    } else {
        profileRank.innerText = "БЕЗ РАНГА";
        rankInput.value = "0";
    }

    profileBadges.innerHTML = ''; 

    if (isAdmin) {
        const badge = document.createElement('span');
        badge.className = 'role-badge admin-badge';
        badge.innerText = 'АДМИН';
        profileBadges.appendChild(badge);
    }

    if (isTech) {
        const badge = document.createElement('span');
        badge.className = 'role-badge tech-badge';
        badge.innerText = 'TECH';
        profileBadges.appendChild(badge);
        techBtn.style.display = 'block';
    } else {
        techBtn.style.display = 'none';
    }

    updateNextRank(rankVal);
}

function revealForm(user, isAdmin) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('formContainer').style.display = 'block';
    
    if (isAdmin) {
        document.getElementById('adminBlacklistBtn').style.display = 'block';
    }

    const profile = document.getElementById('topProfile');
    profile.style.display = 'flex';
}

function updateNextRank(currentVal) {
    const nextRankInput = document.getElementById('newRank');
    const nextVal = parseInt(currentVal) + 1;

    
    if (currentVal >= 7) {
        nextRankInput.value = "Максимальный ранг / Спец. должность";
    } else if (RANK_NAMES[nextVal]) {
        nextRankInput.value = RANK_NAMES[nextVal];
    } else {
        nextRankInput.value = "Повышение недоступно";
    }
}

document.getElementById('rankForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const passportId = document.getElementById('passportId').value; 
    if (passportId.length !== 7 || !passportId.includes('-')) {
        showError("ID Паспорта должен быть в формате XXX-XXX (например, 543-621)");
        return;
    }

    if (!WEBHOOK_URL) { alert("Ошибка: Вебхук не настроен!"); return; }

    const fullName = document.getElementById('fullname').value;
    const age = document.getElementById('age').value;
    const reason = document.getElementById('promoteReason').value;
    
    const currentRankValue = document.getElementById('currentRank').value;
    const currentRankName = RANK_NAMES[currentRankValue] || "Неизвестно";
    const nextRankName = document.getElementById('newRank').value;
    
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
                { name: "📈 Повышение", value: `${currentRankName} ➡ ${nextRankName}`, inline: false },
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
            checkGuildRoles(localStorage.getItem('discord_token'), userData);
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
    
    if (id.length !== 7 || !id.includes('-')) {
        showError("ID Игрока должен быть в формате XXX-XXX");
        return;
    }

    closeModal('blacklistModal');
    let avatarUrl = userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : LOGO_URL;

    const data = {
        username: "Onyx Security",
        content: `🚨 **ВНИМАНИЕ!** Новый нарушитель в ЧС!`,
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
    setTimeout(() => { 
        overlay.classList.add('active'); 
        modal.classList.add('active');
    }, 10); 
}
function closeModal(modalId) { 
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById(modalId);
    overlay.classList.remove('active'); 
    modal.classList.remove('active');
    setTimeout(() => { overlay.style.display = 'none'; }, 400); 
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
