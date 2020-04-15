const data = {
    keyword: '',
    displayAll: false,
    items: [
        { name: 'aaaa', checked: false },
        { name: 'section', checked: false, section: true },
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

function registerSwipe() {
    const list = document.querySelector('ul');
    let manager = new Hammer.Manager(list);
    let Swipe = new Hammer.Swipe();
    manager.add(Swipe);
    manager.on('swipe', function (e) {
        if (e.offsetDirection === 4 || e.offsetDirection === 2) { // todo replace the if with direction option on swipe
            const item = data.items[e.target.closest('li').getAttribute('data-index')];
            item.checked = !item.checked;
        }
    });
    let Press = new Hammer.Press();
    manager.add(Press);
    manager.on('press', function (e) {
        const item = data.items[e.target.closest('li').getAttribute('data-index')];
        item.hover = !item.hover;
    })
}