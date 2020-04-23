import firebaseConfig from './config.js';

const CHECK_DISTANCE = 100;
const DISPLAY_CHECK_DISTANCE = 25;
const PRESS_DURATION = 250;

const db = getFirebase();
const collectionId = 'lists';

window.data = {
    displaySettings: false,
    accountKey: '',
    keyword: '',
    displayAll: false,
    items: [],
    filteredItems: function () {
        if (this.keyword.length > 0) {
            this.items.forEach(i => i.visible = i.section || i.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1);
        }
        else if (!this.displayAll) {
            this.items.forEach((i, index, array) => {
                if (!i.section) {
                    i.visible = !i.checked
                } else {
                    const nextSectionIndex = array.findIndex((i2, index2) => i2.section && index2 > index);
                    const result = array.some((i3, index3) => {
                        return !i3.checked && index3 > index && (index3 < nextSectionIndex || nextSectionIndex == -1)
                    });
                    i.visible = result;
                }
            });
        } else {
            this.items.forEach(i => i.visible = true);
        }

        return this.items;
    },
    add: function (e) {
        let name = this.keyword.trim();
        let isSection = false;
        if (name.startsWith('#')) {
            name = name.substring(1);
            isSection = true;
        }

        const li = e.target.closest('li');
        const sectionIndex = li.getAttribute('data-index');
        let nextSectionIndex = this.items.findIndex((i, index) => i.section && index > sectionIndex);
        nextSectionIndex = nextSectionIndex > 0 ? nextSectionIndex : this.items.length;
        this.items.splice(nextSectionIndex, 0, { name: name, checked: false, section: isSection });
        save();
        this.clear();
    },
    remove: function (index) {
        this.items.splice(index, 1);
        save();
    },
    clear: function () {
        this.keyword = '';
        document.querySelector('.action-bar>.mdl-textfield').MaterialTextfield.change();
    },
    init: function () {
        this.accountKey = localStorage.getItem('accountKey') || 'test';
        load(this).then(items => {
            this.items = items;
            registerTouchActions(this);
        });
    },
    saveSettings: function () {
        localStorage.setItem('accountKey', this.accountKey);
        load(this).then(items => {
            this.items = items;
        });
    }
}

function registerTouchActions(data) {
    const list = document.querySelector('ul');
    let li = null;
    let item = null;
    let startPosX = null;
    let startPosY = null;
    let startTime = null;
    let pressTimeout = null;

    list.addEventListener("touchstart", handleStart, false);
    list.addEventListener("touchend", handleEnd, false);
    list.addEventListener("touchcancel", handleCancel, false);
    list.addEventListener("touchmove", handleMove, false);

    function getStats(e) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startPosX;
        const deltaY = touch.clientY - startPosY;
        const duration = Date.now() - startTime;
        const velocity = Math.abs(deltaX) / duration;
        return { deltaX, deltaY, duration, velocity }
    }

    function handleStart(e) {
        li = e.target.closest('li');
        item = data.items[li.getAttribute('data-index')];

        if (!item.section) {
            startTime = Date.now();
            startPosX = e.targetTouches[0].clientX;
        }

        pressTimeout = setTimeout(handlePress, PRESS_DURATION);
    }

    function handleMove(e) {
        const stats = getStats(e);

        if (!item.section) {
            li.style.marginLeft = stats.deltaX + "px";

            if (stats.deltaX > DISPLAY_CHECK_DISTANCE) {
                li.classList.add('display-check');
            } else {
                li.classList.remove('display-check');
            }

            const checked = item.checked;
            const hasDistance = stats.deltaX > CHECK_DISTANCE;

            if (!checked && hasDistance || checked && !hasDistance) {
                li.classList.add('checked');
            } else if (!checked && !hasDistance || checked && hasDistance) {
                li.classList.remove('checked');
            }
        }

        if (stats.deltaY > CHECK_DISTANCE || stats.deltaY > CHECK_DISTANCE) {
            window.clearTimeout(pressTimeout);
        }
    }

    function handleEnd(e) {
        window.clearTimeout(pressTimeout);

        if (!item.section) {
            const stats = getStats(e);

            if (stats.deltaX > CHECK_DISTANCE) {
                item.checked = !item.checked;
                save();
                data.clear();
            }

            li.classList.remove('display-check');
            li.classList.remove('checked');
            li.style.marginLeft = "0px";
        }
    }

    function handleCancel(e) {
        console.log('cancel', e);
    }

    function handlePress() {
        item.hover = !item.hover;
    }
}

function getFirebase() {
    firebase.initializeApp(firebaseConfig);
    return firebase.firestore();
}

function load(data) {
    return new Promise((resolve, reject) => {
        let docRef = db.collection(collectionId).doc(data.accountKey);
        docRef.onSnapshot(function (doc) {
            if (doc.exists) {
                resolve(JSON.parse(doc.data().value || '[{"name":"section 1","section":true}]'));
            } else {
                reject('No such document!')
                console.error('No such document!');
            }
        });
    });
};

function save() {
    db.collection(collectionId).doc(data.accountKey).set({
        value: JSON.stringify(data.items)
    })
        .catch(function (error) {
            console.error("Error writing document: ", error);
        });
}