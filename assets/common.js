// CommonJS for built-in JS processor
(function(window, document) {
    var moduleCache = {};
    var defines = {};
    var pending = {};

    var brick = {
        logger: console.log.bind(console, '[Brick.JS]'),
        require: function(id) {
            var mod = moduleCache [id];
            if (!mod) throw ('required module not found: ' + id);
            return mod.loaded ? mod : exec(mod);
        },
        register: function(id, define) {
            if (typeof define !== 'function')
                throw ('Invalid CommonJS module: ' + define);
            var mod = createModule(id);
            defines[id] = define;
        }
    };

    function createModule(id){
        id = paramCase(id);
        var mod = {
            id: id,
            loaded: false,
            parent: null,
            children: [],
            exports: {},
        };
        var className = '.brk-' + id;
        mod.elements = document.querySelectorAll(className);
        moduleCache[id] = mod;
        return mod;
    }

    function entries(cb) {
        var enabled = {},
            nodelist = document.querySelectorAll('[class*=brk-]'),
            elements = Array.prototype.slice.call(nodelist);
        elements.map(function(ele) {
            ele.className.split(' ').map(function(cls) {
                var mt = cls.match(/^brk-([-\w]+)/),
                    mid = mt && mt[1];
                if (!mid || enabled[mid]) return;
                enabled[mid] = true;
                cb(mid);
            });
        });
    }

    function exec(module) {
        if(pending[module.id]) return module;
        pending[module.id] = true;

        function require(id){
            var dep = brick.require(id);
            dep.parent = module;
            module.children.push(dep);
            return dep.exports;
        }
        defines[module.id](require, module.exports, module);
        module.loaded = true;

        pending[module.id] = false;
        return module;
    }

    DOMReady(function() {
        entries(function(moduleName) {
            var mod = moduleCache[moduleName];
            mod && exec(mod);
        });
    });


    function paramCase(str) {
        return str
            .replace(/(?:\w)[A-Z]/g, function(c) {
                return c[0] + '-' + c[1];
            })
            .toLowerCase();
    }

    function DOMReady(cb){
        if (document.addEventListener)
            document.addEventListener('DOMContentLoaded', cb, false);
        else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function() {
                if (document.readyState === "complete") cb();
            });
        }
    }

    window.brick = brick;
})(window, document);
