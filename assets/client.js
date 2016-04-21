window.brk = {};
(function(window, document) {
    if (document.addEventListener)
        document.addEventListener('DOMContentLoaded', loaded, false);
    else if (document.attachEvent) {
        document.attachEvent("onreadystatechange", function() {
            if (document.readyState === "complete") loaded();
        });
    }

    function loaded() {
        resolve(function(mod) {
            var ctrl = window.brk[camelCase(mod)];
            if (typeof ctrl !== 'function') return;
            ctrl(brkFactory(mod));
        });
    }

    function resolve(cb) {
        var enabled = {},
            nodelist = document.querySelectorAll('[class*=brk-]'),
            elements = Array.prototype.slice.call(nodelist);
        elements.map(function(ele) {
            ele.className.split(' ').map(function(cls) {
                var mt = cls.match(/^brk-([-\w]+)/),
                    mod = mt && mt[1];
                if (!mod || enabled[mod]) return;
                enabled[mod] = true;
                cb(mod);
            });
        });
    }

    function camelCase(str) {
        return str.replace(/-+\w/g, function(c) {
            c = c[c.length - 1];
            return c.toUpperCase();
        });
    }

    function brkFactory(mod) {
        return {
            name: camelCase(mod), 
            console: {
                log: console.log.bind(console, '[' + mod + ']'),
                info: console.info.bind(console, '[' + mod + ']'),
                warn: console.warn.bind(console, '[' + mod + ']'),
                error: console.error.bind(console, '[' + mod + ']')
            },
            elements: document.querySelectorAll('.brk-' + mod)
        };
    }
})(window, document);
