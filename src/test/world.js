export default {
    templete: `
        <p @click="clickEvent">{{content}}</p>
    `,
    scope: {
        $data: {
            content: 'this is world?'
        },
        methods: {
            clickEvent () {
                this.content = 'yes this is'
                this.fn()
                console.log(this)
            },
            fn () {
                console.log('fn called')
            }
        }
    }
}
