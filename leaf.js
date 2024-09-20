import { Queue } from './Queue.js';

window.Leaf = {
    Queue : Queue,

    lModelTags : ['input', 'select'],

    directives : {

        'l-text': (el, value) => {

            el.innerText = value

        },

        'l-show': (el, value) => {

            el.style.display = value ? 'block' : 'none'

        },

        'l-model': (el, value) => {

            
            if( ['input', 'select'].includes( el.tagName.toLowerCase() ) ) {
                el.value = value
            }

            
        }

    },

    init(data) {

        this.root = document.querySelector('#leaf-root')
        this.data = this.observe(data)

        this.registerListeners()
        this.refreshDom()

    },

    observe(data) {

        var self = this

        return new Proxy(data, {

            set(target, key, value) {

                target[key] = value


                self.refreshDom()

            }

        })
    },

    registerListeners() {

        this.walkDomBFS(this.root, el => {

            Array.from(el.attributes).forEach(attribute => {

                if (! attribute.name.startsWith('@') && attribute.name !== 'l-model') return

                if(attribute.name === 'l-model') {

                    el.addEventListener('input', (e) => {
                        this.data[attribute.value] = e.target.value;
                    });

                    return
                }
                
                let event = attribute.name.replace('@', '')

                el.addEventListener(event, (e) => {

                    // Create a function to evaluate the expression safely within the context of `this.data`
                    const evaluateExpression = new Function('data', 'e', `
                        with (data) {
                            return (${attribute.value});
                        }
                    `);

                    if (this.isArrowFunction(attribute.value)) {
                        evaluateExpression(this.data, e)(); // Call the arrow function
                    } else if (this.data[attribute.value]) {
                        evaluateExpression(this.data, e)(); // If it's a named function, call it
                    } else {
                        evaluateExpression(this.data, e); // Evaluate the expression
                    }
                })

            })

        })
    },

    refreshDom() {

        this.walkDomBFS(this.root, el => {
            
            Array.from(el.attributes).forEach(attribute => {
                
                if (! Object.keys(this.directives).includes(attribute.name)) return

                const value = new Function('data', `with(data) { return (${attribute.value}); }`);

                this.directives[attribute.name](
                    el, value(this.data)
                )

            })
            
        })

    },

    walkDomBFS(el, callback) {

        const queue = new this.Queue();

        queue.enqueue(el);

        while (!queue.isEmpty()) {
            const currentEl = queue.dequeue();

            if(currentEl) {
                callback(currentEl);

                for (const child of currentEl.children) {
                    queue.enqueue(child);
                }
            }
            
        }

    },

    isArrowFunction (value) {

        const arrowFunctionPattern = /^\(\s*\)\s*=>\s*/;
        return arrowFunctionPattern.test(value);

    },

    isValidLModel (el) {
        return this.isAttributeContainLModel(Array.from(el.attributes)) && this.lModelTags.includes(el.tagName.toLowerCase())
    },

    isAttributeContainLModel (attributeArr) {
        return attributeArr.some(attr => attr.name.includes("l-model"))
    }
}


