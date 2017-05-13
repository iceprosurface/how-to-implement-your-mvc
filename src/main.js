import { buildScope } from './core/scope'
import { setRootVir } from './core/compnoment/update'
import { HTMLParser, HTMLCompnonentParser } from './parser/HTMLparser'

var templete = `
<div class="contacts-wrap flex">
    <a :href='contact.url' class="flex">
      <div class="contacts-number"></div>
      <div class="detailed">{{contact.title}}</div>
      <div class="()=>{return function(){cc}}">{{contact.num}}</div>
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
  </div>
</div>
`

var scope = {
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
    }
}

var vir = HTMLCompnonentParser(buildScope(scope), HTMLParser(templete), null)
document.getElementById('app').innerHTML = ''
console.log(vir.$el)
vir.create()
vir.mount()
console.log(buildScope(scope), vir)
document.getElementById('app').appendChild(vir.$el)
setRootVir(vir)
