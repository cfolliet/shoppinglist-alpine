const data = {
    keyword: '',
    displayAll: false,
    items: [
        { name: 'aaaa', checked: false },
        { name: 'section', section: true },
        { name: 'bbb', checked: true },
        { name: 'cc', checked: false }
    ],
    filteredItems: function () {
        if (this.keyword.length > 0) {
            return this.items.filter(i => i.section || i.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1);
        }
        else if (!this.displayAll) {
            return this.items.filter(i => !i.checked);
        } else {
            return this.items;
        }
    },
    add: function () {
        let name = this.keyword.trim();
        let isSection = false;
        if (name.startsWith('#')) {
            name = name.substring(1);
            isSection = true;
        }
        this.items.push({ name: name, checked: false, section: isSection });
        this.keyword = '';
        document.querySelector('.action-bar>.mdl-textfield').MaterialTextfield.change();
    },
    remove: function (index) {
        this.items.splice(index, 1);
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
    let Pan = new Hammer.Pan();
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
        }
    });
    manager.on('panend', function (e) {
        if (!item.section) {
            li.classList.remove('pan');
            li.style.marginLeft = "0px";

            if (e.deltaX > 10 && e.overallVelocityX > 0.3) {
                item.checked = !item.checked;
            }
        }
    });
}