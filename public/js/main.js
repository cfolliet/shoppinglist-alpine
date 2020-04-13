const data = {
    keyword: 'keyword',
    items: [
        { name: 'aaaa', checked: false, hover: false },
        { name: 'bbb', checked: true, hover: false },
        { name: 'cc', checked: false, hover: false }
    ],
    add: function () {
        this.items.push({ name: this.keyword, checked: false });
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