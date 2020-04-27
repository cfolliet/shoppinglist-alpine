import { load, save, remove } from './firebase.js';

const CHECK_DISTANCE = 100;
const DISPLAY_CHECK_DISTANCE = 25;

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
        const item = { name: name, checked: false, section: isSection };
        this.items.splice(nextSectionIndex, 0, item);
        save(data.accountKey, item.name, item);
        this.clear();
    },
    remove: function (item) {
        this.items.splice(this.items.indexOf(item), 1);
        remove(data.accountKey, item.name);
    },
    clear: function () {
        this.keyword = '';
        document.querySelector('.action-bar>.mdl-textfield').MaterialTextfield.change();
    },
    init: function () {
        this.accountKey = localStorage.getItem('accountKey') || 'test';
        load(this.accountKey).then(items => {
            this.items = items;
            registerTouchActions(this);
        });
    },
    saveSettings: function () {
        localStorage.setItem('accountKey', this.accountKey);
        load(this.accountKey).then(items => {
            this.items = items;
        });
    }
}

function registerTouchActions(data) {
    let li = null;
    let item = null;
    let startPosX = null;

    const list = document.querySelector('ul');
    list.addEventListener("touchstart", handleStart);
    list.addEventListener("touchend", handleEnd);
    list.addEventListener("touchmove", handleMove);

    function handleStart(e) {
        li = e.target.closest('li');
        item = data.items[li.getAttribute('data-index')];
        startPosX = e.targetTouches[0].clientX;
    }

    function handleMove(e) {
        if (!item.section) {
            const deltaX = e.changedTouches[0].clientX - startPosX;

            if (deltaX > DISPLAY_CHECK_DISTANCE) {
                li.classList.add('display-check');
                li.style.marginLeft = deltaX + "px";
            } else {
                li.classList.remove('display-check');
                li.style.marginLeft = "0px";
            }

            const checked = item.checked;
            const hasDistance = deltaX > CHECK_DISTANCE;

            if (!checked && hasDistance || checked && !hasDistance) {
                li.classList.add('checked');
            } else if (!checked && !hasDistance || checked && hasDistance) {
                li.classList.remove('checked');
            }
        }
    }

    function handleEnd(e) {
        const deltaX = e.changedTouches[0].clientX - startPosX;

        if (deltaX < -CHECK_DISTANCE) {
            item.hover = !item.hover;
        } else if (!item.section) {
            if (deltaX > CHECK_DISTANCE) {
                item.checked = !item.checked;
                save(data.accountKey, item.name, item);
                data.clear();
            }

            li.classList.remove('display-check', 'checked');
            li.style.marginLeft = "0px";
        }
    }
}