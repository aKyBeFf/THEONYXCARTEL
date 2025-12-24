const LOGO_URL = 'https://i.imgur.com/I7sZuLM.jpeg';

const CLIENT_ID = '1451284313109954650'; 
const GUILD_ID = '1451234520006266933';
const ADMIN_ROLE_IDS = ['1451258370127429804', '1451257290702196827', '1451348634359697418']; 
const TECH_SUPPORT_ROLE_ID = '1451736104498888899';

const RANK_ROLE_IDS = {
    "1": "1451252022392131727",
    "2": "1451255428162916552",
    "3": "1451255653992628266",
    "4": "1451256069782507580",
    "5": "1451256164645081088",
    "6": "1451255819734876391",
    "7": "1451348361725739038",
    "8": "1451348634359697418",
    "9": "1451257290702196827",
    "10": "1451258370127429804"
};

const RANK_NAMES = {
    "1": "⦉ ◈ С О К О Л ◈ ⦊",
    "2": "⦉ ◈ П О С Ы Л Ь Н Ы Й ◈ ⦊",
    "3": "⦉ ◈ Ш Л И Ф О В Щ И К ◈ ⦊",
    "4": "⦉ ◈ С Б О Р Щ И К ◈ ⦊",
    "5": "⦉ ◈ О П Е Р А Т О Р ◈ ⦊",
    "6": "⦉ ◈ С И К А Р И О ◈ ⦊",
    "7": "⦉ ◈ Л Е Й Т Е Н А Н Т ◈ ⦊",
    "8": "⦉ ◈ Ж Е Ф Е Д Е С И К А Р И О С ◈ ⦊",
    "9": "⦉ ◈ К О Н С И Л Ь Е Р ◈ ⦊",
    "10": "⦉ ◈ Д О Н ◈ ⦊"
};

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1451275072907247768/LrlLl54X2us-sLRSg1xipbqPZhBeZrYUdg7o51g9zKtB6knNqf_eVt5q7G-U7NJqMHYU';
const WEBHOOK_BLACKLIST = 'https://discord.com/api/webhooks/1451685341089108181/FU6g9i_5oqUwC0qn-IejPqXa97bCOgQl2HVBDAhW5wG2Lmj5BY_PpEXrdJ6YqqeWvH5I';
const WEBHOOK_SICARIOS = 'https://discord.com/api/webhooks/1453178584477728810/QQ3iulL-BQ3yQSRdYyHfcSK5Yg6CDGfIS3FZxhl2zhhCP4HUKRU0jobweprUv9CFoUZm';

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


    let pressTimer;

    function setupAgeControl(minusBtnId, plusBtnId, inputId) {
        const minusBtn = document.getElementById(minusBtnId);
        const plusBtn = document.getElementById(plusBtnId);
        const input = document.getElementById(inputId);

        function changeValue(isPlus) {
            let val = parseInt(input.value) || 16;
            if (isPlus) {
                if (val < 99) input.value = val + 1;
            } else {
                if (val > 1) input.value = val - 1;
            }
        }


        function handlePress(isPlus, btnElement) {
            changeValue(isPlus);

            pressTimer = setTimeout(() => {
                 pressTimer = setInterval(() => changeValue(isPlus), 100);
            }, 300);
           
        }


        minusBtn.addEventListener('mousedown', () => handlePress(false, minusBtn));
        plusBtn.addEventListener('mousedown', () => handlePress(true, plusBtn));
        

        ['mouseup', 'mouseleave'].forEach(event => {
            minusBtn.addEventListener(event, () => { clearTimeout(pressTimer); clearInterval(pressTimer); });
            plusBtn.addEventListener(event, () => { clearTimeout(pressTimer); clearInterval(pressTimer); });
        });
    }


    setupAgeControl('ageMinus', 'agePlus', 'age');
    setupAgeControl('sicAgeMinus', 'sicAgePlus', 'sicAge');


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

function switchTab(tab) {
    const reportBtn = document.querySelector('.nav-btn:nth-child(1)');
    const sicariosBtn = document.querySelector('.nav-btn:nth-child(2)');
    const reportForm = document.getElementById('formContainer');
    const sicariosForm = document.getElementById('sicariosContainer');

    if (tab === 'report') {
        reportBtn.classList.add('active');
        sicariosBtn.classList.remove('active');
        reportForm.style.display = 'block';
        sicariosForm.style.display = 'none';
    } else {
        reportBtn.classList.remove('active');
        sicariosBtn.classList.add('active');
        reportForm.style.display = 'none';
        sicariosForm.style.display = 'block';
    }
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
    document.querySelector('.top-nav').style.display = 'flex';
    
    if (isAdmin) {
        document.getElementById('adminBlacklistBtn').style.display = 'block';
    }

    const profile = document.getElementById('topProfile');
    profile.style.display = 'flex';
}

function updateNextRank(currentVal) {
    const nextRankInput = document.getElementById('newRank');
    const nextVal = parseInt(currentVal) + 1;

    if (currentVal >= 5) {
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

document.getElementById('sicariosForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!WEBHOOK_SICARIOS) { alert("Ошибка: Вебхук Сикариос не настроен!"); return; }

    const name = document.getElementById('sicName').value;
    const age = document.getElementById('sicAge').value;
    const why = document.getElementById('sicWhy').value;
    const online = document.getElementById('sicOnline').value;
    const clips = document.getElementById('sicClips').value;
    const expProj = document.getElementById('sicExpProj').value;
    const expFam = document.getElementById('sicExpFam').value;
    const otherClips = document.getElementById('sicOtherClips').value || "Нет";

    let avatarUrl = userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : LOGO_URL;

    const data = {
        username: "Sicarios Recruiter",
        embeds: [{
            title: `☠️ ЗАЯВКА В S.I.C.A.R.I.O.S`,
            color: 0x800080, 
            thumbnail: { url: avatarUrl },
            fields: [
                { name: "👤 Кандидат", value: `<@${userData.id}>`, inline: true },
                { name: "🏷 Имя", value: name, inline: true },
                { name: "🎂 Возраст", value: age, inline: true },
                { name: "📝 Почему вы?", value: `>>> ${why}`, inline: false },
                { name: "⏰ Онлайн", value: online, inline: true },
                { name: "🔫 Откаты", value: `>>> ${clips}`, inline: false },
                { name: "🌍 Опыт (Проекты)", value: expProj, inline: false },
                { name: "🏰 Опыт (Семьи)", value: expFam, inline: false },
                { name: "📹 Доп. откаты", value: `>>> ${otherClips}`, inline: false }
            ],
            footer: { text: `User ID: ${userData.id}` },
            timestamp: new Date()
        }]
    };

    fetch(WEBHOOK_SICARIOS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(res => { 
        if (res.ok || res.status === 204) { 
            openModal('successModal'); 
            document.getElementById('sicariosForm').reset(); 
        } else { 
            showError("Ошибка отправки в Discord (Сикариос)"); 
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
