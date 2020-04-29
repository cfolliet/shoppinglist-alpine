import { load, save } from './firebase.js';

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
        this.items.splice(nextSectionIndex, 0, { name: name, checked: false, section: isSection });
        save(this.accountKey, this.items);
        this.clear();
    },
    remove: function (index) {
        this.items.splice(index, 1);
        save(this.accountKey, this.items);
    },
    clear: function () {
        this.keyword = '';
        document.querySelector('.action-bar>.mdl-textfield').MaterialTextfield.change();
    },
    init: function () {
        this.accountKey = localStorage.getItem('accountKey') || 'test';
        load(this.accountKey, this.items).then(() => registerTouchActions(this));
    },
    saveSettings: function () {
        localStorage.setItem('accountKey', this.accountKey);
        load(this.accountKey, this.items)
    }
}

function registerTouchActions(data) {
    let li = null;
    let item = null;
    let itemIndex = null;
    let startPosX = null;
    let isSwipe = false;
    let hoverLi = null;

    const list = document.querySelector('ul');
    list.addEventListener("touchstart", handleStart);
    list.addEventListener("touchend", handleEnd);
    list.addEventListener("touchmove", handleMove);

    function handleStart(e) {
        const target = e.target;
        li = target.closest('li');
        itemIndex = li.getAttribute('data-index');
        item = data.items[itemIndex];
        if (target.innerText == 'swap_vert') {
            isSwipe = false;
        } else {
            isSwipe = true;
            startPosX = e.targetTouches[0].clientX;
        }
    }

    function handleMove(e) {
        if (isSwipe && !item.section) {
            const deltaX = e.changedTouches[0].clientX - startPosX;

            const hasDisplayDistance = deltaX > DISPLAY_CHECK_DISTANCE;
            li.classList.toggle('display-check', hasDisplayDistance);
            li.style.marginLeft = hasDisplayDistance ? deltaX + "px" : "0px";

            const checked = item.checked;
            const hasCheckDistance = deltaX > CHECK_DISTANCE;

            li.classList.toggle('checked', !checked && hasCheckDistance || checked && !hasCheckDistance);
        } else if (!isSwipe) {
            const element = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            const newHoverLi = element.closest('li');
            if (newHoverLi != hoverLi) {
                if (hoverLi != null) {
                    hoverLi.classList.remove('sort-hover');
                }
                hoverLi = newHoverLi;
                hoverLi.classList.add('sort-hover');
            }
        }
    }

    function handleEnd(e) {
        if (isSwipe) {
            const deltaX = e.changedTouches[0].clientX - startPosX;

            if (deltaX < -CHECK_DISTANCE) {
                item.hover = !item.hover;
            } else if (!item.section) {
                if (deltaX > CHECK_DISTANCE) {
                    item.checked = !item.checked;
                    save(data.accountKey, data.items);
                    data.clear();
                }

                li.classList.remove('display-check', 'checked');
                li.style.marginLeft = "0px";
            }
        } else if (hoverLi != null) {
            let destinationIndex = parseInt(hoverLi.getAttribute('data-index'));

            if (destinationIndex < itemIndex) {
                destinationIndex++;
            }

            hoverLi.classList.remove('sort-hover');
            hoverLi = null;

            item.hover = !item.hover;
            data.items.splice(destinationIndex, 0, data.items.splice(itemIndex, 1)[0]);

            save(data.accountKey, data.items);
        }
    }
}