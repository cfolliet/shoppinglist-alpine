const data = {
    keyword: 'keyword',
    items: [
        { name: 'aaaa', checked: false },
        { name: 'bbb', checked: true },
        { name: 'cc', checked: false }
    ],
    add: function(){
        this.items.push({ name: this.keyword, checked: false })
    }
}