import Element from './vm-dom'

var vir = new Element('div', [], null, {})

export function update() {
    document.getElementById('app').innerHTML = ''
    document.getElementById('app').appendChild(vir.updateScope())
}

export function setRootVir(vdom) {
    vir = vdom
    update()
}
