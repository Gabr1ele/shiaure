**/
 *Copyright 2016 Gabr1ele
 *Kodo modifikacijos leidžiamos tik asmeniniui naudojimui.
 *Gaunamas pelnas turėtų būti perleistas teisėtam savininkui.
 */


(function () {

    /*window.onerror = function() {
        var room = JSON.parse(localStorage.getItem("ShiaureRoom"));
        window.location = 'https://plug.dj' + room.name;
    };*/

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(Shiaure.room.autodisableInterval);
        clearInterval(Shiaure.room.afkInterval);
        Shiaure.status = false;
    };

    /*var socket = function () {
        function loadSocket() {
            SockJS.prototype.msg = function(a){this.send(JSON.stringify(a))};
            sock = new SockJS('https://benzi.io:4964/socket');
            sock.onopen = function() {
                console.log('Connected to socket!');
                sendToSocket();
            };
            sock.onclose = function() {
                console.log('Atsijungiama is lizdo, bandoma prisijungti kas minute ..');
                var reconnect = setTimeout(function(){ loadSocket() }, 60 * 1000);
            };
            sock.onmessage = function(broadcast) {
                var rawBroadcast = broadcast.data;
                var broadcastMessage = rawBroadcast.replace(/["\\]+/g, '');
                API.chatLog(broadcastMessage);
                console.log(broadcastMessage);
            };
        }
        if (typeof SockJS == 'Undefined') {
            $.getScript('https://cdn.jsdelivr.net/sockjs/1.0.3/sockjs.min.js', loadSocket);
        } else loadSocket();
    }
    var sendToSocket = function () {
        var ShiaureSettings = Shiaure.settings;
        var ShiaureRoom = Shiaure.room;
        var ShiaureInfo = {
            time: Date.now(),
            version: Shiaure.version
        };
        var data = {users:API.getUsers(),userinfo:API.getUser(),room:location.pathname,ShiaureSettings:ShiaureSettings,ShiaureRoom:ShiaureRoom,ShiaureInfo:ShiaureInfo};
        return sock.msg(data);
    };*/

    var storeToStorage = function () {
        localStorage.setItem("Shiauresettings", JSON.stringify(Shiaure.settings));
        localStorage.setItem("ShiaureRoom", JSON.stringify(Shiaure.room));
        var ShiaureStorageInfo = {
            time: Date.now(),
            stored: true,
            version: Shiaure.version
        };
        localStorage.setItem("ShiaureStorageInfo", JSON.stringify(ShiaureStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("Cia truksta pokalbio teksto.");
            console.log("Cia truksta pokalbio teksto.");
            return "[Klaida] Nerasta tekstines zinutes.";

            // TODO: Gauk trukstamas teksto zinutes is saltinio.
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/Gabr1ele/shiaure/lang/langIndex.json", function (json) {
            var link = Shiaure.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[Shiaure.settings.language.toLowerCase()];
                if (Shiaure.settings.chatLink !== Shiaure.chatLink) {
                    link = Shiaure.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = Shiaure.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        Shiaure.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(Shiaure.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        Shiaure.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("Shiauresettings"));
        if (settings !== null) {
            for (var prop in settings) {
                Shiaure.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("ShiaureStorageInfo");
        if (info === null) API.chatLog(Shiaure.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("Shiauresettings"));
            var room = JSON.parse(localStorage.getItem("ShiaureRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(Shiaure.chat.retrievingdata);
                for (var prop in settings) {
                    Shiaure.settings[prop] = settings[prop];
                }
                Shiaure.room.users = room.users;
                Shiaure.room.afkList = room.afkList;
                Shiaure.room.historyList = room.historyList;
                Shiaure.room.mutedUsers = room.mutedUsers;
                //Shiaure.room.autoskip = room.autoskip;
                Shiaure.room.roomstats = room.roomstats;
                Shiaure.room.messages = room.messages;
                Shiaure.room.queue = room.queue;
                Shiaure.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(Shiaure.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById("room-settings");
        info = roominfo.textContent;
        var ref_bot = "@Shiaure=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        Shiaure.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

    String.prototype.startsWith = function(str) {
      return this.substring(0, str.length) === str;
    };

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    var botCreator = "Gabr!ele";
    var botCreatorIDs = ["5115145"];

    var Shiaure = {
        version: "4.2.0",
        status: false,
        name: "Shiaure",
        loggedInID: null,
        scriptLink: "https://rawgit.com/Gabr1ele/shiaure/shiaure.js",
        cmdLink: "https://rawgit.com/Gabr1ele/shiaure/commands.md",
        chatLink: "https://rawgit.com/Gabr1ele/shiaure/lang/lt.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "Shiaure",
            language: "lietuvių",
            chatLink: "https://rawgit.com/Gabr1ele/shiaure/lang/lt.json",
            scriptLink: "https://rawgit.com/Gabr1ele/shiaure/shiaure.js",
            roomLock: false, // Reikia papildinio perkraunant script'a.
            startupCap: 20, // 1-200
            startupVolume: 10, // 0-100
            startupEmoji: true, // true or false
            autowoot: true,
            autoskip: false,
            smartSkip: true,
            cmdDeletion: true,
            maximumAfk: 120,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: true,
            voteSkipLimit: 5,
            historySkip: true,
            timeGuard: true,
            maximumSongLength: 7,
            autodisable: false,
            commandCooldown: 30,
            usercommandsEnabled: true,
            skipPosition: 3,
            skipReasons: [
                ["zanras", "Netinkamas zanras siai bendruomenei."],
                ["noreason", "Tave praskipino, nes taip norejo."],
                ["istorija", "Si daina jau grojo. "],
                ["ispejimas", "Uz tycini nesamoniu leidima gauni ispejima."],
                ["kokybe", "Sis irasas nekokybiskas arba be garso."],
                ["n18", "Vaizdo klipas negali buti rodomas vartotojams iki 18 metu."],
                ["negalima", "Daina negalima/negroja."]
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 5,
            motd: "Sios dienos pranesimas",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/Gabr1ele/shiaure/blacklists/NSFWlist.json",
                OP: "https://rawgit.com/Gabr1ele/shiaure/blacklists/OPlist.json",
                BANNED: "https://rawgit.com/Gabr1ele/shiaure/blacklists/BANNEDlist.json"
            }
        },
        room: {
            name: null,
            chatMessages: [],
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            //autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function () {
                if (Shiaure.status && Shiaure.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    Shiaure.room.roulette.rouletteStatus = true;
                    Shiaure.room.roulette.countdown = setTimeout(function () {
                        Shiaure.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(Shiaure.chat.isopen);
                },
                endRoulette: function () {
                    Shiaure.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * Shiaure.room.roulette.participants.length);
                    var winner = Shiaure.room.roulette.participants[ind];
                    Shiaure.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = Shiaure.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(Shiaure.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        Shiaure.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            },
            usersUsedThor: []
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = Shiaure.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < Shiaure.room.users.length; i++) {
                    if (Shiaure.room.users[i].id === id) {
                        return Shiaure.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < Shiaure.room.users.length; i++) {
                    var match = Shiaure.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return Shiaure.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = Shiaure.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = Shiaure.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < Shiaure.room.queue.id.length; i++) {
                            if (Shiaure.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            Shiaure.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(Shiaure.chat.alreadyadding, {position: Shiaure.room.queue.position[alreadyQueued]}));
                        }
                        Shiaure.roomUtilities.booth.lockBooth();
                        if (priority) {
                            Shiaure.room.queue.id.unshift(id);
                            Shiaure.room.queue.position.unshift(pos);
                        }
                        else {
                            Shiaure.room.queue.id.push(id);
                            Shiaure.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(Shiaure.chat.adding, {name: name, position: Shiaure.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = Shiaure.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return Shiaure.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(Shiaure.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return Shiaure.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (Shiaure.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = Shiaure.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(Shiaure.chat.toolongago, {name: Shiaure.userUtilities.getUser(user).username, time: time}));
                var songsPassed = Shiaure.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = Shiaure.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(Shiaure.chat.notdisconnected, {name: name});
                var msg = subChat(Shiaure.chat.valid, {name: Shiaure.userUtilities.getUser(user).username, time: time, position: newPosition});
                Shiaure.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!Shiaure.roomUtilities.booth.locked);
                    Shiaure.roomUtilities.booth.locked = false;
                    if (Shiaure.settings.lockGuard) {
                        Shiaure.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(Shiaure.roomUtilities.booth.locked);
                        }, Shiaure.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(Shiaure.roomUtilities.booth.locked);
                    clearTimeout(Shiaure.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!Shiaure.status || !Shiaure.settings.afkRemoval) return void (0);
                var rank = Shiaure.roomUtilities.rankToNumber(Shiaure.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, Shiaure.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = Shiaure.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = Shiaure.userUtilities.getUser(user);
                            if (rank !== null && Shiaure.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = Shiaure.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = Shiaure.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > Shiaure.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(Shiaure.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(Shiaure.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            Shiaure.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(Shiaure.chat.afkremove, {name: name, time: time, position: pos, maximumafk: Shiaure.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function (reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                Shiaure.room.queueable = false;

                if (waitlistlength == 50) {
                    Shiaure.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function (id) {
                    API.moderateForceSkip();
                    setTimeout(function () {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 500);
                    Shiaure.room.skippable = false;
                    setTimeout(function () {
                        Shiaure.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function (id) {
                        Shiaure.userUtilities.moveUser(id, Shiaure.settings.skipPosition, false);
                        Shiaure.room.queueable = true;
                        if (locked) {
                            setTimeout(function () {
                                Shiaure.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function () {
                $.getJSON('/_/rooms/state', function(data) {
                    if (data.data[0].booth.shouldCycle) { // checks "" "shouldCycle": true "" if its true
                        API.moderateDJCycle(false); // Disables the DJ Cycle
                        clearTimeout(Shiaure.room.cycleTimer); // Clear the cycleguard timer
                    } else { // If cycle is already disable; enable it
                        if (Shiaure.settings.cycleGuard) { // Is cycle guard on?
                        API.moderateDJCycle(true); // Enables DJ cycle
                        Shiaure.room.cycleTimer = setTimeout(function () {  // Start timer
                            API.moderateDJCycle(false); // Disable cycle
                        }, Shiaure.settings.maximumCycletime * 60 * 1000); // The time
                        } else { // So cycleguard is not on?
                         API.moderateDJCycle(true); // Enables DJ cycle
                        }
                    };
                });
            },
            intervalMessage: function () {
                var interval;
                if (Shiaure.settings.motdEnabled) interval = Shiaure.settings.motdInterval;
                else interval = Shiaure.settings.messageInterval;
                if ((Shiaure.room.roomstats.songCount % interval) === 0 && Shiaure.status) {
                    var msg;
                    if (Shiaure.settings.motdEnabled) {
                        msg = Shiaure.settings.motd;
                    }
                    else {
                        if (Shiaure.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = Shiaure.room.roomstats.songCount % Shiaure.settings.intervalMessages.length;
                        msg = Shiaure.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in Shiaure.settings.blacklists) {
                    Shiaure.room.blacklists[bl] = [];
                    if (typeof Shiaure.settings.blacklists[bl] === 'function') {
                        Shiaure.room.blacklists[bl] = Shiaure.settings.blacklists();
                    }
                    else if (typeof Shiaure.settings.blacklists[bl] === 'string') {
                        if (Shiaure.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(Shiaure.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    Shiaure.room.blacklists[l] = list;
                                })
                            })(bl);
                        }
                        catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(Shiaure.room.newBlacklisted);
                }
                else {
                    console.log(Shiaure.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < Shiaure.room.newBlacklisted.length; i++) {
                    var track = Shiaure.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message);
            chat.message = chat.message.trim();

            Shiaure.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]);

            for (var i = 0; i < Shiaure.room.users.length; i++) {
                if (Shiaure.room.users[i].id === chat.uid) {
                    Shiaure.userUtilities.setLastActivity(Shiaure.room.users[i]);
                    if (Shiaure.room.users[i].username !== chat.un) {
                        Shiaure.room.users[i].username = chat.un;
                    }
                }
            }
            if (Shiaure.chatUtilities.chatFilter(chat)) return void (0);
            if (!Shiaure.chatUtilities.commandCheck(chat))
                Shiaure.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < Shiaure.room.users.length; i++) {
                if (Shiaure.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                Shiaure.room.users[index].inRoom = true;
                var u = Shiaure.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                Shiaure.room.users.push(new Shiaure.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < Shiaure.room.users.length; j++) {
                if (Shiaure.userUtilities.getUser(Shiaure.room.users[j]).id === user.id) {
                    Shiaure.userUtilities.setLastActivity(Shiaure.room.users[j]);
                    Shiaure.room.users[j].jointime = Date.now();
                }

            }
            if (Shiaure.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(Shiaure.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(Shiaure.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < Shiaure.room.users.length; i++) {
                if (Shiaure.room.users[i].id === user.id) {
                    Shiaure.userUtilities.updateDC(Shiaure.room.users[i]);
                    Shiaure.room.users[i].inRoom = false;
                    if (lastDJ == user.id){
                        var user = Shiaure.userUtilities.lookupUser(Shiaure.room.users[i].id);
                        Shiaure.userUtilities.updatePosition(user, 0);
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < Shiaure.room.users.length; i++) {
                if (Shiaure.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        Shiaure.room.users[i].votes.woot++;
                    }
                    else {
                        Shiaure.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();
            var timeLeft = API.getTimeRemaining();
            var timeElapsed = API.getTimeElapsed();

            if (Shiaure.settings.voteSkip) {
                if ((mehs - woots) >= (Shiaure.settings.voteSkipLimit)) {
                    API.sendChat(subChat(Shiaure.chat.voteskipexceededlimit, {name: dj.username, limit: Shiaure.settings.voteSkipLimit}));
                    if (Shiaure.settings.smartSkip && timeLeft > timeElapsed){
                        Shiaure.roomUtilities.smartSkip();
                    }
                    else {
                        API.moderateForceSkip();
                    }
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < Shiaure.room.users.length; i++) {
                if (Shiaure.room.users[i].id === obj.user.id) {
                    Shiaure.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            if (Shiaure.settings.autowoot) {
                $("#woot").click(); // autowoot
            }

            var user = Shiaure.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < Shiaure.room.users.length; i++){
                if(Shiaure.room.users[i].id === user.id){
                    Shiaure.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (Shiaure.settings.songstats) {
                if (typeof Shiaure.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(Shiaure.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            Shiaure.room.roomstats.totalWoots += lastplay.score.positive;
            Shiaure.room.roomstats.totalMehs += lastplay.score.negative;
            Shiaure.room.roomstats.totalCurates += lastplay.score.grabs;
            Shiaure.room.roomstats.songCount++;
            Shiaure.roomUtilities.intervalMessage();
            Shiaure.room.currentDJID = obj.dj.id;

            var blacklistSkip = setTimeout(function () {
                var mid = obj.media.format + ':' + obj.media.cid;
                for (var bl in Shiaure.room.blacklists) {
                    if (Shiaure.settings.blacklistEnabled) {
                        if (Shiaure.room.blacklists[bl].indexOf(mid) > -1) {
                            API.sendChat(subChat(Shiaure.chat.isblacklisted, {blacklist: bl}));
                            if (Shiaure.settings.smartSkip){
                                return Shiaure.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                }
            }, 2000);
            var newMedia = obj.media;
            var timeLimitSkip = setTimeout(function () {
                if (Shiaure.settings.timeGuard && newMedia.duration > Shiaure.settings.maximumSongLength * 60 && !Shiaure.room.roomevent) {
                    var name = obj.dj.username;
                    API.sendChat(subChat(Shiaure.chat.timelimit, {name: name, maxlength: Shiaure.settings.maximumSongLength}));
                    if (Shiaure.settings.smartSkip){
                        return Shiaure.roomUtilities.smartSkip();
                    }
                    else {
                        return API.moderateForceSkip();
                    }
                }
            }, 2000);
            var format = obj.media.format;
            var cid = obj.media.cid;
            var naSkip = setTimeout(function () {
                if (format == 1){
                    $.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function (track){
                        if (typeof(track.items[0]) === 'undefined'){
                            var name = obj.dj.username;
                            API.sendChat(subChat(Shiaure.chat.notavailable, {name: name}));
                            if (Shiaure.settings.smartSkip){
                                return Shiaure.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                }
                else {
                    var checkSong = SC.get('/tracks/' + cid, function (track){
                        if (typeof track.title === 'undefined'){
                            var name = obj.dj.username;
                            API.sendChat(subChat(Shiaure.chat.notavailable, {name: name}));
                            if (Shiaure.settings.smartSkip){
                                return Shiaure.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                }
            }, 2000);
            clearTimeout(historySkip);
            if (Shiaure.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function () {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            Shiaure.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                            API.sendChat(subChat(Shiaure.chat.songknown, {name: name}));
                            if (Shiaure.settings.smartSkip){
                                return Shiaure.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                    if (!alreadyPlayed) {
                        Shiaure.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            if (user.ownSong) {
                API.sendChat(subChat(Shiaure.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(Shiaure.room.autoskipTimer);
            if (Shiaure.settings.autoskip) {
                var remaining = obj.media.duration * 1000;
                var startcid = API.getMedia().cid;
                Shiaure.room.autoskipTimer = setTimeout(function() {
                    var endcid = API.getMedia().cid;
                    if (startcid === endcid) {
                        //API.sendChat('Song stuck, skipping...');
                        API.moderateForceSkip();
                    }
                }, remaining + 5000);
            }
            storeToStorage();
            //sendToSocket();
        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (Shiaure.room.queue.id.length > 0 && Shiaure.room.queueable) {
                    Shiaure.room.queueable = false;
                    setTimeout(function () {
                        Shiaure.room.queueable = true;
                    }, 500);
                    Shiaure.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = Shiaure.room.queue.id.splice(0, 1)[0];
                            pos = Shiaure.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    Shiaure.room.queueing--;
                                    if (Shiaure.room.queue.id.length === 0) setTimeout(function () {
                                        Shiaure.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + Shiaure.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = Shiaure.userUtilities.lookupUser(users[i].id);
                Shiaure.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!Shiaure.settings.filterChat) return false;
            if (Shiaure.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(Shiaure.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(Shiaure.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < Shiaure.chatUtilities.spam.length; j++) {
                if (msg === Shiaure.chatUtilities.spam[j]) {
                    API.sendChat(subChat(Shiaure.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = Shiaure.userUtilities.getPermission(chat.uid);
                var user = Shiaure.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < Shiaure.room.mutedUsers.length; i++) {
                    if (Shiaure.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (Shiaure.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (Shiaure.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (Shiaure.settings.cmdDeletion && msg.startsWith(Shiaure.settings.commandLiteral)) {
                    API.moderateDeleteChat(chat.cid);
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(Shiaure.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(Shiaure.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin nebuvo įjungtas') > 0 || msg.indexOf('AFK žinutė neįjungta') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin išjungtas') > 0 || msg.indexOf('AFK žinutė išjungta') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = Shiaure.chat.roulettejoin;
                var rlLeaveChat = Shiaure.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === Shiaure.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 5 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === Shiaure.settings.commandLiteral) {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = Shiaure.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== Shiaure.settings.commandLiteral + 'join' && chat.message !== Shiaure.settings.commandLiteral + "leave") {
                    if (userPerm === 0 && !Shiaure.room.usercommand) return void (0);
                    if (!Shiaure.room.allcommand) return void (0);
                }
                if (chat.message === Shiaure.settings.commandLiteral + 'eta' && Shiaure.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = Shiaure.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in Shiaure.commands) {
                    var cmdCall = Shiaure.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (Shiaure.settings.commandLiteral + cmdCall[i] === cmd) {
                            Shiaure.commands[comm].functionality(chat, Shiaure.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    Shiaure.room.usercommand = false;
                    setTimeout(function () {
                        Shiaure.room.usercommand = true;
                    }, Shiaure.settings.commandCooldown * 1000);
                }
                if (executed) {
                    /*if (Shiaure.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }*/

                    //Shiaure.room.allcommand = false;
                    //setTimeout(function () {
                        Shiaure.room.allcommand = true;
                    //}, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = Shiaure.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < Shiaure.room.users.length; j++) {
                        if (Shiaure.userUtilities.getUser(Shiaure.room.users[j]).id === chat.uid) {
                            Shiaure.userUtilities.setLastActivity(Shiaure.room.users[j]);
                        }

                    }
                }
                Shiaure.room.roomstats.chatmessages++;
            },
            spam: [
                'eee', 'kalė', 'eiii', 'alioo', 'eiknx', 'supis', 'pizdink', 'pyzdint', 'pyzdink', 'pizda',
                'plug_dj', 'mockrusys', 'užpis', 'plug.dj/', 'uzpis', 'zajebal', 'jibala', 'zajabys', 'achujena', 'achujel', 'xuj',
                'močkrušys', 'jabala', 'smaukyk', 'smaukyt', 'dalbajob', 'suka', 'kurva', 'kurwa', 'axujena', 'axujel', 'čiulpk', 'ciulpk', 'bybi', 'bybys', 'bbd', 'pisau', 'pisk',
                'krw', 'blt', 'blet', 'pyderas', 'pz', 'pzd', 'pzz', 'nx', 'naxui', 'naxuj', 'sadfgf'
            ],
            curses: [
                'negras', 'pyderas', 'bybys', 'pizda', 'močkrušys', 'kurwa'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            if (Shiaure.userUtilities.getPermission(u) < 2) return API.chatLog(Shiaure.chat.greyuser);
            if (Shiaure.userUtilities.getPermission(u) === 2) API.chatLog(Shiaure.chat.bouncer);
            Shiaure.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "/_/chat/" + cid,
                    type: "DELETE"
                })
            };

            Shiaure.room.name = window.location.pathname;
            var Check;

            console.log(Shiaure.room.name);

            var detect = function(){
                if(Shiaure.room.name != window.location.pathname){
                    console.log("Killing bot after room change.");
                    storeToStorage();
                    Shiaure.disconnectAPI();
                    setTimeout(function () {
                        kill();
                    }, 1000);
                    if (Shiaure.settings.roomLock){
                        window.location = Shiaure.room.name;
                    }
                    else {
                        clearInterval(Check);
                    }
                }
            };

            Check = setInterval(function(){ detect() }, 2000);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = Shiaure;
            Shiaure.roomUtilities.updateBlacklists();
            setInterval(Shiaure.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            Shiaure.getNewBlacklistedSongs = Shiaure.roomUtilities.exportNewBlacklistedSongs;
            Shiaure.logNewBlacklistedSongs = Shiaure.roomUtilities.logNewBlacklistedSongs;
            if (Shiaure.room.roomstats.launchTime === null) {
                Shiaure.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < Shiaure.room.users.length; j++) {
                Shiaure.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < Shiaure.room.users.length; j++) {
                    if (Shiaure.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    Shiaure.room.users[ind].inRoom = true;
                }
                else {
                    Shiaure.room.users.push(new Shiaure.User(userlist[i].id, userlist[i].username));
                    ind = Shiaure.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(Shiaure.room.users[ind].id) + 1;
                Shiaure.userUtilities.updatePosition(Shiaure.room.users[ind], wlIndex);
            }
            Shiaure.room.afkInterval = setInterval(function () {
                Shiaure.roomUtilities.afkCheck()
            }, 10 * 1000);
            Shiaure.room.autodisableInterval = setInterval(function () {
                Shiaure.room.autodisableFunc();
            }, 60 * 60 * 1000);
            Shiaure.loggedInID = API.getUser().id;
            Shiaure.status = true;
            API.sendChat('/cap ' + Shiaure.settings.startupCap);
            API.setVolume(Shiaure.settings.startupVolume);
            if (Shiaure.settings.autowoot) {
                $("#woot").click();
            }
            if (Shiaure.settings.startupEmoji) {
                var emojibuttonoff = $(".icon-emoji-off");
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            }
            else {
                var emojibuttonon = $(".icon-emoji-on");
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatarai apriboti iki ' + Shiaure.settings.startupCap);
            API.chatLog('Garsas nustatytas į ' + Shiaure.settings.startupVolume);
            //socket();
            loadChat(API.sendChat(subChat(Shiaure.chat.online, {botname: Shiaure.settings.botName, version: Shiaure.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = Shiaure.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (Shiaure.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('klaida paskiriant minimalų leidimą');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !Shiaure.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                }
                        }
                },
             **/

            activeCommand: {
                command: 'aktyvus',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;

                        var launchT = Shiaure.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = durationOnline / 1000;

                        if (msg.length === cmd.length) time = since;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(Shiaure.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < Shiaure.room.users.length; i++) {
                            userTime = Shiaure.userUtilities.getLastActivity(Shiaure.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(Shiaure.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'prideti',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (Shiaure.room.roomevent) {
                                    Shiaure.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            Shiaure.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(Shiaure.chat.maximumafktimeset, {name: chat.un, time: Shiaure.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(Shiaure.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.afkRemoval) {
                            Shiaure.settings.afkRemoval = !Shiaure.settings.afkRemoval;
                            clearInterval(Shiaure.room.afkInterval);
                            API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.afkremoval}));
                        }
                        else {
                            Shiaure.settings.afkRemoval = !Shiaure.settings.afkRemoval;
                            Shiaure.room.afkInterval = setInterval(function () {
                                Shiaure.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        Shiaure.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(Shiaure.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = Shiaure.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = Shiaure.roomUtilities.msToStr(inactivity);

                        var launchT = Shiaure.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline){
                            API.sendChat(subChat(Shiaure.chat.inactivelonger, {botname: Shiaure.settings.botName, name: chat.un, username: name}));
                        } else {
                        API.sendChat(subChat(Shiaure.chat.inactivefor, {name: chat.un, username: name, time: time}));
                        }
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.autodisable) {
                            Shiaure.settings.autodisable = !Shiaure.settings.autodisable;
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.autodisable}));
                        }
                        else {
                            Shiaure.settings.autodisable = !Shiaure.settings.autodisable;
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.autodisable}));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.autoskip) {
                            Shiaure.settings.autoskip = !Shiaure.settings.autoskip;
                            clearTimeout(Shiaure.room.autoskipTimer);
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.autoskip}));
                        }
                        else {
                            Shiaure.settings.autoskip = !Shiaure.settings.autoskip;
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(Shiaure.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(Shiaure.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['klausti', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                            var crowd = API.getUsers();
                            var msg = chat.message;
                            var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                            var randomUser = Math.floor(Math.random() * crowd.length);
                            var randomBall = Math.floor(Math.random() * Shiaure.chat.balls.length);
                            var randomSentence = Math.floor(Math.random() * 1);
                            API.sendChat(subChat(Shiaure.chat.ball, {name: chat.un, botname: Shiaure.settings.botName, question: argument, response: Shiaure.chat.balls[randomBall]}));
                     }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = Shiaure.userUtilities.getPermission(chat.uid);
                        var permUser = Shiaure.userUtilities.getPermission(user.id);
                        if (permUser >= permFrom) return void(0);
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof Shiaure.room.blacklists[list] === 'undefined') return API.sendChat(subChat(Shiaure.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            Shiaure.room.newBlacklisted.push(track);
                            Shiaure.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(Shiaure.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            if (Shiaure.settings.smartSkip && timeLeft > timeElapsed){
                                Shiaure.roomUtilities.smartSkip();
                            }
                            else {
                                API.moderateForceSkip();
                            }
                            if (typeof Shiaure.room.newBlacklistedSongFunction === 'function') {
                                Shiaure.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(Shiaure.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (Shiaure.settings.bouncerPlus) {
                            Shiaure.settings.bouncerPlus = false;
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!Shiaure.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = Shiaure.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    Shiaure.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(Shiaure.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'vardas',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(Shiaure.chat.currentbotname, {botname: Shiaure.settings.botName}));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            Shiaure.settings.botName = argument;
                            API.sendChat(subChat(Shiaure.chat.botnameset, {botName: Shiaure.settings.botName}));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'cc',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(Shiaure.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            clearlocalstorageCommand: {
                command: 'clearlocalstorage',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        localStorage.clear();
                        API.chatLog('Cleared localstorage, please refresh the page!');
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.cmdDeletion) {
                            Shiaure.settings.cmdDeletion = !Shiaure.settings.cmdDeletion;
                            API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.cmddeletion}));
                        }
                        else {
                            Shiaure.settings.cmdDeletion = !Shiaure.settings.cmdDeletion;
                            API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.cmddeletion}));
                        }
                    }
                }
            },

            commandsCommand: {
                command: 'komandos',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(Shiaure.chat.commandslink, {botname: Shiaure.settings.botName, link: Shiaure.cmdLink}));
                    }
                }
            },

            cookieCommand: {
                command: 'duoti',
                rank: 'user',
                type: 'startsWith',
                getCookie: function (chat) {
                    var c = Math.floor(Math.random() * Shiaure.chat.cookies.length);
                    return Shiaure.chat.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(Shiaure.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = Shiaure.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(Shiaure.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(Shiaure.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(Shiaure.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        Shiaure.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.cycleGuard) {
                            Shiaure.settings.cycleGuard = !Shiaure.settings.cycleGuard;
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.cycleguard}));
                        }
                        else {
                            Shiaure.settings.cycleGuard = !Shiaure.settings.cycleGuard;
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            Shiaure.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(Shiaure.chat.cycleguardtime, {name: chat.un, time: Shiaure.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(Shiaure.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            dclookupCommand: {
                command: ['grizau', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = Shiaure.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(Shiaure.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = Shiaure.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            deletechatCommand: {
                command: 'del',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        for (var i = 1; i < Shiaure.room.chatMessages.length; i++) {
                          if (Shiaure.room.chatMessages[i].indexOf(user.id) > -1){
                            API.moderateDeleteChat(Shiaure.room.chatMessages[i][0]);
                            Shiaure.room.chatMessages[i].splice(0);
                          }
                        }
                        API.sendChat(subChat(Shiaure.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },


            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(Shiaure.chat.emojilist, {link: link}));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if(chat.message.length === cmd.length) return API.sendChat('/me Nenurodytas vartotojas.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if(typeof user === 'boolean') return API.sendChat('/me Nurodytas neteisingas vartotojas.');
                        var lang = Shiaure.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch(lang){
                            case 'en': break;
                            case 'da': ch += 'Vær venlig at tale engelsk.'; break;
                            case 'de': ch += 'Bitte sprechen Sie Englisch.'; break;
                            case 'es': ch += 'Por favor, hable Inglés.'; break;
                            case 'fr': ch += 'Parlez anglais, s\'il vous plaît.'; break;
                            case 'nl': ch += 'Spreek Engels, alstublieft.'; break;
                            case 'pl': ch += 'Proszę mówić po angielsku.'; break;
                            case 'pt': ch += 'Por favor, fale Inglês.'; break;
                            case 'sk': ch += 'Hovorte po anglicky, prosím.'; break;
                            case 'cs': ch += 'Mluvte prosím anglicky.'; break;
                            case 'sr': ch += 'Молим Вас, говорите енглески.'; break;
                            case 'lt': ch += 'Prašau kalbėti angliškai.'; break;
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'dj',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = Shiaure.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(Shiaure.chat.youaredj, {name: name}));
                        if (pos < 0) return API.sendChat(subChat(Shiaure.chat.notinwaitlist, {name: name}));
                        if (pos == 0) return API.sendChat(subChat(Shiaure.chat.youarenext, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = Shiaure.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(Shiaure.chat.eta, {name: name, time: estimateString, position: realpos}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof Shiaure.settings.fbLink === "string")
                            API.sendChat(subChat(Shiaure.chat.facebook, {link: Shiaure.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.filterChat) {
                            Shiaure.settings.filterChat = !Shiaure.settings.filterChat;
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.chatfilter}));
                        }
                        else {
                            Shiaure.settings.filterChat = !Shiaure.settings.filterChat;
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.chatfilter}));
                        }
                    }
                }
            },

            forceskipCommand: {
                command: ['forceskip', 'fs'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(Shiaure.chat.forceskip, {name: chat.un}));
                        API.moderateForceSkip();
                        Shiaure.room.skippable = false;
                        setTimeout(function () {
                            Shiaure.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            ghostbusterCommand: {
                command: 'siela',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(Shiaure.chat.ghosting, {name1: chat.un, name2: name}));
                        }
                        else API.sendChat(subChat(Shiaure.chat.notghosting, {name1: chat.un, name2: name}));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?",
                                    {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating,
                                        "tag": fixedtag
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g,"+");
                            var commatag = tag.replace(/ /g,", ");
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(Shiaure.chat.validgiftags, {name: chat.un, id: id, tags: commatag}));
                                } else {
                                    API.sendChat(subChat(Shiaure.chat.invalidgiftags, {name: chat.un, tags: commatag}));
                                }
                            });
                        }
                        else {
                            function get_random_id(api_key, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?",
                                    {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(Shiaure.chat.validgifrandom, {name: chat.un, id: id}));
                                } else {
                                    API.sendChat(subChat(Shiaure.chat.invalidgifrandom, {name: chat.un}));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: 'pagalba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "(Updated link coming soon)";
                        API.sendChat(subChat(Shiaure.chat.starterhelp, {link: link}));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.historySkip) {
                            Shiaure.settings.historySkip = !Shiaure.settings.historySkip;
                            API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.historyskip}));
                        }
                        else {
                            Shiaure.settings.historySkip = !Shiaure.settings.historySkip;
                            API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.historyskip}));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'zaisti',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.room.roulette.rouletteStatus && Shiaure.room.roulette.participants.indexOf(chat.uid) < 0) {
                            Shiaure.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(Shiaure.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        var join = Shiaure.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = Shiaure.roomUtilities.msToStr(time);
                        API.sendChat(subChat(Shiaure.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'ismesti',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = Shiaure.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));

                        var permFrom = Shiaure.userUtilities.getPermission(chat.uid);
                        var permTokick = Shiaure.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(Shiaure.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(Shiaure.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(Shiaure.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'pietus',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        //sendToSocket();
                        API.sendChat(Shiaure.chat.kill);
                        Shiaure.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'kalba',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(Shiaure.chat.currentlang, {language: Shiaure.settings.language}));
                        var argument = msg.substring(cmd.length + 1);

                        $.get("https://rawgit.com/Gabr1ele/shiaure/lang/langindex.json", function (json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === "undefined") {
                                API.sendChat(subChat(Shiaure.chat.langerror, {link: "http://git.io/vJ9nI"}));
                            }
                            else {
                                Shiaure.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(Shiaure.chat.langset, {language: Shiaure.settings.language}));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'nebezaisti',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = Shiaure.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            Shiaure.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(Shiaure.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = Shiaure.userUtilities.lookupUser(chat.uid);
                        var perm = Shiaure.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "https://youtu.be/" + media.cid;
                                API.sendChat(subChat(Shiaure.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(Shiaure.chat.songlink, {name: from, link: sound.permalink_url}));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        Shiaure.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = Shiaure.settings.lockdownEnabled;
                        Shiaure.settings.lockdownEnabled = !temp;
                        if (Shiaure.settings.lockdownEnabled) {
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.lockGuard) {
                            Shiaure.settings.lockGuard = !Shiaure.settings.lockGuard;
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.lockguard}));
                        }
                        else {
                            Shiaure.settings.lockGuard = !Shiaure.settings.lockGuard;
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            Shiaure.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(Shiaure.chat.usedlockskip, {name: chat.un}));
                                Shiaure.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    Shiaure.room.skippable = false;
                                    setTimeout(function () {
                                        Shiaure.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        Shiaure.userUtilities.moveUser(id, Shiaure.settings.lockskipPosition, false);
                                        Shiaure.room.queueable = true;
                                        setTimeout(function () {
                                            Shiaure.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < Shiaure.settings.lockskipReasons.length; i++) {
                                var r = Shiaure.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += Shiaure.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(Shiaure.chat.usedlockskip, {name: chat.un}));
                                Shiaure.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    Shiaure.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        Shiaure.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        Shiaure.userUtilities.moveUser(id, Shiaure.settings.lockskipPosition, false);
                                        Shiaure.room.queueable = true;
                                        setTimeout(function () {
                                            Shiaure.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                        }
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            Shiaure.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(Shiaure.chat.lockguardtime, {name: chat.un, time: Shiaure.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(Shiaure.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            logoutCommand: {
                command: 'atjungti',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(Shiaure.chat.logout, {name: chat.un, botname: Shiaure.settings.botName}));
                        setTimeout(function () {
                            $(".logout").mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            Shiaure.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(Shiaure.chat.maxlengthtime, {name: chat.un, time: Shiaure.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(Shiaure.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + Shiaure.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!Shiaure.settings.motdEnabled) Shiaure.settings.motdEnabled = !Shiaure.settings.motdEnabled;
                        if (isNaN(argument)) {
                            Shiaure.settings.motd = argument;
                            API.sendChat(subChat(Shiaure.chat.motdset, {msg: Shiaure.settings.motd}));
                        }
                        else {
                            Shiaure.settings.motdInterval = argument;
                            API.sendChat(subChat(Shiaure.chat.motdintervalset, {interval: Shiaure.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === Shiaure.loggedInID) return API.sendChat(subChat(Shiaure.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(Shiaure.chat.move, {name: chat.un}));
                            Shiaure.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(Shiaure.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        } else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == '' || time == null || typeof time == 'undefined'){
                                return API.sendChat(subChat(Shiaure.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = Shiaure.userUtilities.getPermission(chat.uid);
                        var permUser = Shiaure.userUtilities.getPermission(user.id);
                        if (permUser == 0) {
                            if (time > 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(Shiaure.chat.mutedmaxtime, {name: chat.un, time: '45'}));
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(Shiaure.chat.mutedtime, {name: chat.un, username: name, time: time}));
                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(Shiaure.chat.mutedtime, {name: chat.un, username: name, time: time}));
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(Shiaure.chat.mutedtime, {name: chat.un, username: name, time: time}));
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(Shiaure.chat.mutedtime, {name: chat.un, username: name, time: time}));
                            }
                        }
                        else API.sendChat(subChat(Shiaure.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof Shiaure.settings.opLink === "string")
                            return API.sendChat(subChat(Shiaure.chat.oplist, {link: Shiaure.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(Shiaure.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'rr',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        //sendToSocket();
                        storeToStorage();
                        Shiaure.disconnectAPI();
                        setTimeout(function () {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'perkrauti',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(Shiaure.chat.reload);
                        //sendToSocket();
                        storeToStorage();
                        Shiaure.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(Shiaure.settings.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'panaikinti',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = Shiaure.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(Shiaure.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.etaRestriction) {
                            Shiaure.settings.etaRestriction = !Shiaure.settings.etaRestriction;
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.etarestriction}));
                        }
                        else {
                            Shiaure.settings.etaRestriction = !Shiaure.settings.etaRestriction;
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'rulete',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!Shiaure.room.roulette.rouletteStatus) {
                            Shiaure.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'taisykles',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof Shiaure.settings.rulesLink === "string")
                            return API.sendChat(subChat(Shiaure.chat.roomrules, {link: Shiaure.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = Shiaure.room.roomstats.totalWoots;
                        var mehs = Shiaure.room.roomstats.totalMehs;
                        var grabs = Shiaure.room.roomstats.totalCurates;
                        API.sendChat(subChat(Shiaure.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: ['skip', 'smartskip'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.room.skippable) {

                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var dj = API.getDJ();
                            var name = dj.username;
                            var msgSend = '@' + name + ', ';

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(Shiaure.chat.usedskip, {name: chat.un}));
                                if (Shiaure.settings.smartSkip && timeLeft > timeElapsed){
                                    Shiaure.roomUtilities.smartSkip();
                                }
                                else {
                                    API.moderateForceSkip();
                                }
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < Shiaure.settings.skipReasons.length; i++) {
                                var r = Shiaure.settings.skipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += Shiaure.settings.skipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(Shiaure.chat.usedskip, {name: chat.un}));
                                if (Shiaure.settings.smartSkip && timeLeft > timeElapsed){
                                    Shiaure.roomUtilities.smartSkip(msgSend);
                                }
                                else {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.sendChat(msgSend);
                                    }, 500);
                                }
                            }
                        }
                    }
                }
            },

            skipposCommand: {
                command: 'skippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            Shiaure.settings.skipPosition = pos;
                            return API.sendChat(subChat(Shiaure.chat.skippos, {name: chat.un, position: Shiaure.settings.skipPosition}));
                        }
                        else return API.sendChat(subChat(Shiaure.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.songstats) {
                            Shiaure.settings.songstats = !Shiaure.settings.songstats;
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.songstats}));
                        }
                        else {
                            Shiaure.settings.songstats = !Shiaure.settings.songstats;
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.songstats}));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'saltinis',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me Botą sukūrė ' + botCreator + ".");
                    }
                }
            },

            statusCommand: {
                command: 'statusas',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '[@' + from + '] ';

                        msg += Shiaure.chat.afkremoval + ': ';
                        if (Shiaure.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += Shiaure.chat.afksremoved + ": " + Shiaure.room.afkList.length + '. ';
                        msg += Shiaure.chat.afklimit + ': ' + Shiaure.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (Shiaure.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += Shiaure.chat.blacklist + ': ';
                        if (Shiaure.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += Shiaure.chat.lockguard + ': ';
                        if (Shiaure.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += Shiaure.chat.cycleguard + ': ';
                        if (Shiaure.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += Shiaure.chat.timeguard + ': ';
                        if (Shiaure.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += Shiaure.chat.chatfilter + ': ';
                        if (Shiaure.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += Shiaure.chat.historyskip + ': ';
                        if (Shiaure.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += Shiaure.chat.voteskip + ': ';
                        if (Shiaure.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += Shiaure.chat.cmddeletion + ': ';
                        if (Shiaure.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += Shiaure.chat.autoskip + ': ';
                        if (Shiaure.settings.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        // TODO: Display more toggleable bot settings.

                        var launchT = Shiaure.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = Shiaure.roomUtilities.msToStr(durationOnline);
                        msg += subChat(Shiaure.chat.activefor, {time: since});

                        /*
                        // least efficient way to go about this, but it works :)
                        if (msg.length > 250){
                            firstpart = msg.substr(0, 250);
                            secondpart = msg.substr(250);
                            API.sendChat(firstpart);
                            setTimeout(function () {
                                API.sendChat(secondpart);
                            }, 300);
                        }
                        else {
                            API.sendChat(msg);
                        }
                        */

                        // This is a more efficient solution
                        if (msg.length > 250){
                            var split = msg.match(/.{1,250}/g);
                            for (var i = 0; i < split.length; i++) {
                                var func = function(index) {
                                    setTimeout(function() {
                                        API.sendChat("/me " + split[index]);
                                    }, 500 * index);
                                }
                                func(i);
                            }
                        }
                        else {
                            return API.sendChat(msg);
                        }
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.split('@')[1].trim();
                        var name2 = msg.split('@')[2].trim();
                        var user1 = Shiaure.userUtilities.lookupUserName(name1);
                        var user2 = Shiaure.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(Shiaure.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === Shiaure.loggedInID || user2.id === Shiaure.loggedInID) return API.sendChat(subChat(Shiaure.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 && p2 < 0) return API.sendChat(subChat(Shiaure.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(Shiaure.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 === -1){
                            API.moderateRemoveDJ(user2.id);
                            setTimeout(function (user1, p2) {
                                Shiaure.userUtilities.moveUser(user1.id, p2, true);
                            }, 2000, user1, p2);
                        }
                        else if (p2 === -1){
                            API.moderateRemoveDJ(user1.id);
                            setTimeout(function (user2, p1) {
                                Shiaure.userUtilities.moveUser(user2.id, p1, true);
                            }, 2000, user2, p1);
                        }
                        else if (p1 < p2) {
                            Shiaure.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                Shiaure.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            Shiaure.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                Shiaure.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'tema',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof Shiaure.settings.themeLink === "string")
                            API.sendChat(subChat(Shiaure.chat.genres, {link: Shiaure.settings.themeLink}));
                    }
                }
            },

            thorCommand: {
              command: 'thor',
              rank: 'user',
              type: 'exact',
              functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                      if (Shiaure.settings.thorCommand){
                        var id = chat.uid,
                              isDj = API.getDJ().id == id ? true : false,
                              from = chat.un,
                              djlist = API.getWaitList(),
                              inDjList = false,
                              oldTime = 0,
                              usedThor = false,
                              indexArrUsedThor,
                              thorCd = false,
                              timeInMinutes = 0,
                              worthyAlg = Math.floor(Math.random() * 10),
                              worthy = worthyAlg == 10 ? true : false;

                          for (var i = 0; i < djlist.length; i++) {
                              if (djlist[i].id == id)
                                  inDjList = true;
                          }

                          if (inDjList) {
                              for (var i = 0; i < Shiaure.room.usersUsedThor.length; i++) {
                                  if (Shiaure.room.usersUsedThor[i].id == id) {
                                      oldTime = Shiaure.room.usersUsedThor[i].time;
                                      usedThor = true;
                                      indexArrUsedThor = i;
                                  }
                              }

                              if (usedThor) {
                                  timeInMinutes = (Shiaure.settings.thorCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                  thorCd = timeInMinutes > 0 ? true : false;
                                  if (thorCd == false)
                                      Shiaure.room.usersUsedThor.splice(indexArrUsedThor, 1);
                              }

                              if (thorCd == false || usedThor == false) {
                                  var user = {id: id, time: Date.now()};
                                  Shiaure.room.usersUsedThor.push(user);
                              }
                          }

                          if (!inDjList) {
                              return API.sendChat(subChat(Shiaure.chat.thorNotClose, {name: from}));
                          } else if (thorCd) {
                              return API.sendChat(subChat(Shiaure.chat.thorcd, {name: from, time: timeInMinutes}));
                          }

                          if (worthy) {
                            if (API.getWaitListPosition(id) != 0)
                            Shiaure.userUtilities.moveUser(id, 1, false);
                            API.sendChat(subChat(Shiaure.chat.thorWorthy, {name: from}));
                          } else {
                            if (API.getWaitListPosition(id) != djlist.length - 1)
                            Shiaure.userUtilities.moveUser(id, djlist.length, false);
                            API.sendChat(subChat(Shiaure.chat.thorNotWorthy, {name: from}));
                          }
                        }
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.timeGuard) {
                            Shiaure.settings.timeGuard = !Shiaure.settings.timeGuard;
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.timeguard}));
                        }
                        else {
                            Shiaure.settings.timeGuard = !Shiaure.settings.timeGuard;
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.timeguard}));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = Shiaure.settings.blacklistEnabled;
                        Shiaure.settings.blacklistEnabled = !temp;
                        if (Shiaure.settings.blacklistEnabled) {
                          return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.blacklist}));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.motdEnabled) {
                            Shiaure.settings.motdEnabled = !Shiaure.settings.motdEnabled;
                            API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.motd}));
                        }
                        else {
                            Shiaure.settings.motdEnabled = !Shiaure.settings.motdEnabled;
                            API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.motd}));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.voteSkip) {
                            Shiaure.settings.voteSkip = !Shiaure.settings.voteSkip;
                            API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.voteskip}));
                        }
                        else {
                            Shiaure.settings.voteSkip = !Shiaure.settings.voteSkip;
                            API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.voteskip}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $.getJSON('/_/bans', function (json){
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = json.data;
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) return API.sendChat(subChat(Shiaure.chat.notbanned, {name: chat.un}));
                            API.moderateUnbanUser(bannedUser.id);
                            console.log('Unbanned:', name);
                        });
                    }
                }
            },

            unlockCommand: {
                command: 'atrakinti',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        Shiaure.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $.getJSON('/_/mutes', function (json){
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length+2);
                            var arg = msg.substring(cmd.length+1);
                            var mutedUsers = json.data;
                            var found = false;
                            var mutedUser = null;
                            var permFrom = Shiaure.userUtilities.getPermission(chat.uid);
                            if (msg.indexOf('@') === -1 && arg === 'all'){
                                if (permFrom > 2){
                                    for (var i = 0; i < mutedUsers.length; i++){
                                        API.moderateUnmuteUser(mutedUsers[i].id);
                                    }
                                    API.sendChat(subChat(Shiaure.chat.unmutedeveryone, {name: chat.un}));
                                } else API.sendChat(subChat(Shiaure.chat.unmuteeveryonerank, {name: chat.un}));
                            } else {
                                for (var i = 0; i < mutedUsers.length; i++){
                                    var user = mutedUsers[i];
                                    if (user.username === name){
                                        mutedUser = user;
                                        found = true;
                                    }
                                }
                                if (!found) return API.sendChat(subChat(Shiaure.chat.notbanned, {name: chat.un}));
                                API.moderateUnmuteUser(mutedUser.id);
                                console.log('Unmuted:', name);
                            }
                        });
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            Shiaure.settings.commandCooldown = cd;
                            return API.sendChat(subChat(Shiaure.chat.commandscd, {name: chat.un, time: Shiaure.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(Shiaure.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.usercommandsEnabled) {
                            API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.usercommands}));
                            Shiaure.settings.usercommandsEnabled = !Shiaure.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.usercommands}));
                            Shiaure.settings.usercommandsEnabled = !Shiaure.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(Shiaure.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = Shiaure.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(Shiaure.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(Shiaure.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(Shiaure.chat.voteskiplimit, {name: chat.un, limit: Shiaure.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!Shiaure.settings.voteSkip) Shiaure.settings.voteSkip = !Shiaure.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(Shiaure.chat.voteskipinvalidlimit, {name: chat.un}));
                        }
                        else {
                            Shiaure.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(Shiaure.chat.voteskipsetlimit, {name: chat.un, limit: Shiaure.settings.voteSkipLimit}));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'pasisveikinimas',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (Shiaure.settings.welcome) {
                            Shiaure.settings.welcome = !Shiaure.settings.welcome;
                            return API.sendChat(subChat(Shiaure.chat.toggleoff, {name: chat.un, 'function': Shiaure.chat.welcomemsg}));
                        }
                        else {
                            Shiaure.settings.welcome = !Shiaure.settings.welcome;
                            return API.sendChat(subChat(Shiaure.chat.toggleon, {name: chat.un, 'function': Shiaure.chat.welcomemsg}));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'web',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof Shiaure.settings.website === "string")
                            API.sendChat(subChat(Shiaure.chat.website, {link: Shiaure.settings.website}));
                    }
                }
            },

            whoisCommand: {
                command: 'kas',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i){
                            if (users[i].username == name){
                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;
                                if (rawlang == "en"){
                                    var language = "English";
                                } else if (rawlang == "bg"){
                                    var language = "Bulgarian";
                                } else if (rawlang == "cs"){
                                    var language = "Czech";
                                } else if (rawlang == "fi"){
                                    var language = "Finnish"
                                } else if (rawlang == "fr"){
                                    var language = "French"
                                } else if (rawlang == "pt"){
                                    var language = "Portuguese"
                                } else if (rawlang == "zh"){
                                    var language = "Chinese"
                                } else if (rawlang == "sk"){
                                    var language = "Slovak"
                                } else if (rawlang == "nl"){
                                    var language = "Dutch"
                                } else if (rawlang == "ms"){
                                    var language = "Malay"
                                } else if (rawlang == "lt"){
                                    var language = "Lietuvių"
                                }
                                var rawrank = API.getUser(id).role;
                                if (rawrank == "0"){
                                    var rank = "User";
                                } else if (rawrank == "1"){
                                    var rank = "Resident DJ";
                                } else if (rawrank == "2"){
                                    var rank = "Bouncer";
                                } else if (rawrank == "3"){
                                    var rank = "Manager"
                                } else if (rawrank == "4"){
                                    var rank = "Co-Host"
                                } else if (rawrank == "5"){
                                    var rank = "Host"
                                } else if (rawrank == "7"){
                                    var rank = "Brand Ambassador"
                                } else if (rawrank == "10"){
                                    var rank = "Admin"
                                }
                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = "https://plug.dj/@/" + slug;
                                } else {
                                    var profile = "~";
                                }

                                API.sendChat(subChat(Shiaure.chat.whois, {name1: chat.un, name2: name, id: id, avatar: avatar, profile: profile, language: language, level: level, joined: joined, rank: rank}));
                            }
                        }
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!Shiaure.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof Shiaure.settings.youtubeLink === "string")
                            API.sendChat(subChat(Shiaure.chat.youtube, {name: chat.un, link: Shiaure.settings.youtubeLink}));
                    }
                }
            }
        }
    };

    loadChat(Shiaure.startup);
}).call(this);
