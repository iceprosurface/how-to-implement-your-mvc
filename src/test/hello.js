import world from './world.js'
export default {
    templete: `
        <div class="contacts-wrap flex">
            <a :href='contact.url' class="flex">
            <div class="contacts-number"></div>
            <div class="detailed">{{contact.title}}</div>
            <div :class="()=>{return function(){cc}}">{{contact.num}}</div>
            </a>
        <div class="panel-title">实时动态</div>
        <div class="statistics-wrap flex">
            <div class="statistics-detailed">qqq</div>
            <div class="statistics-detailed">
                <div class="statistics-detailed">xxx</div>
                {{item.title}}
                <div class="statistics-detailed">bbb</div>
            </div>
            <div class="statistics-detailed">ddd</div>
            <div class="statistics-number" @click="testClick">{{item.count+1}}</div>
            <a :href="item.url">立即查看</a>
            <p>
                {{testArray.join(',')}}
            </p>
            <world><p>ksl</p></world>
        </div>
        </div>
    `,
    scope: {
        $data: {
            'item': {
                'title': 'you name',
                'count': 1,
                'url': 'www.baidu.com',
            },
            'contact': {
                'url': 'www.iceprosurface.com',
                'num': 2
            },
            'testArray': [0, 1, 2, 3, 4, 5]
        },
        methods: {
            testClick() {
                console.log('u clicked!')
                console.log('this now is ', this)
                this.item.title = 2222
            }
        },
        components: {
            world
        }
    }
}
