const data = {
    keyword: '',
    displayAll: false,
    items: [
        { name: 'aaaa', checked: false },
        { name: 'section 1', section: true },
        { name: 'bbbbbbbb', checked: false },
        { name: 'cc', checked: false },
        { name: 'dddddd', checked: false },
        { name: 'eeeeeee', checked: false },
        { name: 'ffffff', checked: false },
        { name: 'gggggg', checked: false },
        { name: 'section 2', section: true },
        { name: 'hhhhhhhh', checked: false },
        { name: 'iiiii', checked: false },
        { name: 'jjjjjjjjj', checked: false },
        { name: 'kkkkkk', checked: false },
        { name: 'llllllll', checked: false },
        { name: 'mmmmmmmmm', checked: false },
        { name: 'nnnnnnnnn', checked: false },
        { name: 'section 3', section: true },
        { name: 'oooooooo', checked: false },
        { name: 'ppppppppp', checked: false },
        { name: 'qqqqqqq', checked: true },
        { name: 'rrrrrrr', checked: false },
        { name: 'ssssss', checked: false },
        { name: 'tttttt', checked: false }
    ],
    filteredItems: function () {
        if (this.keyword.length > 0) {
            return this.items.filter(i => i.section || i.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1);
        }
        else if (!this.displayAll) {
            return this.items.filter((i, index, array) => {
                if (!i.section) {
                    return !i.checked
                } else {
                    const nextSectionIndex = array.findIndex((i2, index2) => i2.section && index2 > index);
                    const result = array.some((i3, index3) => {
                        return !i3.checked && index3 > index && (index3 < nextSectionIndex || nextSectionIndex == -1)
                    });
                    return result;
                }
            });
        } else {
            return this.items;
        }
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
        this.clear();
    },
    remove: function (index) {
        this.items.splice(index, 1);
    },
    clear: function () {
        this.keyword = '';
        document.querySelector('.action-bar>.mdl-textfield').MaterialTextfield.change();
    },
    update: function () {
        // trick to refresh data when modified from the js
        this.items = this.items;
    }
}

function registerTouchActions() {
    const list = document.querySelector('ul');
    let li = null;
    let item = null;
    let manager = new Hammer.Manager(list);
    let Press = new Hammer.Press();
    manager.add(Press);
    manager.on('press', function (e) {
        const item = data.items[e.target.closest('li').getAttribute('data-index')];
        item.hover = !item.hover;
    })
    let Pan = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL });
    manager.add(Pan);
    manager.on('panstart', function (e) {
        li = e.target.closest('li');
        item = data.items[li.getAttribute('data-index')];
        if (!item.section) {
            li.classList.add('pan');
        }
    });
    manager.on('panmove', function (e) {
        if (!item.section) {
            li.style.marginLeft = e.deltaX + "px";
            if (e.deltaX > 10 && e.overallVelocityX > 0.3) {
                li.classList.add('checked');
            } else {
                li.classList.remove('checked');
            }
        }
    });
    manager.on('panend', function (e) {
        if (!item.section) {
            li.classList.remove('pan');
            li.style.marginLeft = "0px";

            if (e.deltaX > 10 && e.overallVelocityX > 0.3) {
                item.checked = !item.checked;
            } else {
                li.classList.remove('checked');
            }
        }
    });
    manager.on('pancancel', function (e) {
        if (!item.section) {
            li.style.marginLeft = "0px";
            li.classList.remove('pan');
        }
    })
}