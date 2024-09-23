window.Leaf = {
    Queue : class {

        queue = [];

        /**
         * Adds a new element to the end of the queue.
         *
         * @param {*} element - the element to be added to the queue
         * @return {undefined} this function does not return any value
         */
        enqueue(element) {
            this.queue.push(element);
        }

        /**
         * Removes and returns the front element from the queue.
         *
         * @return {*} The front element from the queue, or undefined if the queue is empty.
         */
        dequeue() {
            return this.queue.shift();
        }

        /**
         * Returns the front element from the queue without removing it.
         *
         * @return {*} The front element from the queue, or undefined if the queue is empty.
         */
        peek() {
            return $this.queue[0];
        }

        /**
         * Checks if the queue is empty.
         *
         * @return {boolean} True if the queue is empty, false otherwise.
         */
        isEmpty() {
            return this.queue.length === 0;
        }

        /**
         * Returns the number of elements in the queue.
         *
         * @return {number} The size of the queue.
         */
        size() {
            return this.queue.length;
        }

    },

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

            
        },

        'l-for': (root, array, iterator, self) => {
            
            function addSkipToChildDom(root) {
                
                if(!root.getAttribute('l-for')) {

                    root.setAttribute('skip', '1')

                }

                for (const child of root.children) {

                    addSkipToChildDom(child)
                    
                }

            }

            function addIndexToChildDom(root, index) {
                
                if(!root.getAttribute('index')) {

                    root.setAttribute('index', index)

                }

                for (const child of root.children) {
                    
                    addIndexToChildDom(child, index)
                    
                }

            }

            addSkipToChildDom(root)

            array.forEach((val, index) => {

                if(index) {
                    const clone = root.children[0].cloneNode(true)

                    clone.setAttribute('index', index)

                    addIndexToChildDom(clone, index)

                    root.appendChild(clone)
                } 

            })

            root.children[0].setAttribute('index', 0)

            addIndexToChildDom(root.children[0], 0)

            self.walkDomBFS(root, el => {

                Array.from(el.attributes).forEach(attribute => {
                    
                    if (! Object.keys(self.directives).includes(attribute.name)) return
                    if(attribute.name === 'l-for') return

                    const index = el.getAttribute('index')
                    
                    self.directives[attribute.name]( el, array[index] )

                })
                

            })

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

                if(el.getAttribute('skip')) return;

                if (! attribute.name.startsWith('@') && attribute.name !== 'l-model') return

                if(attribute.name === 'l-model') {

                    el.addEventListener('input', (e) => {
                        this.data[attribute.value] = e.target.value;
                    });

                    return
                }
                
                let event = attribute.name.replace('@', '')

                el.addEventListener(event, (e) => {

                    if (this.isArrowFunction(attribute.value)) {

                        eval(`with (this.data) { (${attribute.value}) }`)();

                    } else if (this.data[attribute.value]) {

                        eval(`with (this.data) { (${attribute.value}()) }`);

                    } else {

                        eval(`with (this.data) { (${attribute.value}) }`);

                    }
                })

            })

        })
    },

    refreshDom() {

        this.walkDomBFS(this.root, el => {
            
            Array.from(el.attributes).forEach(attribute => {
                
                if (! Object.keys(this.directives).includes(attribute.name) || el.getAttribute('skip')) return

                if(attribute.name === 'l-for') {
                    const matches = attribute.value.match(/const (\w+) of (\w+)/);
                    
                    this.directives["l-for"](
                        el, eval(`with (this.data) { (${matches[2]}) }`), matches[1], this
                    )
                    
                    return
                }

                this.directives[attribute.name](
                    el, eval(`with (this.data) { (${attribute.value}) }`)
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
    
}


