import { setRootVir } from './core/compnoment/update'
import { createComponent } from './core/compnoment/vdom/createComponent'
import hello from './test/hello.js'

var vir = createComponent(hello, null)
document.getElementById('app').innerHTML = ''
console.log(vir.$el)
vir.create()
vir.mount()
document.getElementById('app').appendChild(vir.$el)
setRootVir(vir)
