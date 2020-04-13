const data = {
    keyword: 'keyword',
    items: [
        { name: 'aaaa', checked: false },
        { name: 'bbb', checked: true },
        { name: 'cc', checked: false }
    ],
    add: function () {
        this.items.push({ name: this.keyword, checked: false });
    },
    update: function () {
        // trick to refresh data when modified from the js
        this.items = this.items;
    }
}

function registerSwipe() {
    const list = document.querySelector('ul');
    var manager = new Hammer.Manager(list);
    var Swipe = new Hammer.Swipe();
    manager.add(Swipe);
    manager.on('swipe', function (e) {
        if (e.offsetDirection === 4 || e.offsetDirection === 2) { // todo replace the if with direction option on swipe
            const li = e.target.nodeName == 'LI' ? e.target : e.target.parentNode;
            const items = [...document.querySelectorAll('li')];
            const index = items.indexOf(li);
            data.items[index].checked = !data.items[index].checked;
        }
    });
}

setTimeout(registerSwipe, 100) //remove this timeout and register at the good moment