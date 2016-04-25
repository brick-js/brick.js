// CommonJS for built-in JS processor
(function(window, document) {

    var CommonJS = {
        require: function(id) {
            var mod = CommonJS.moduleCache[id];
            if (!mod) throw ('required module not found: ' + id);
            return (mod.loaded || CommonJS.pending[id]) ? 
                mod : CommonJS.exec(mod);
        },
        register: function(id, define) {
            if (typeof define !== 'function')
                throw ('Invalid CommonJS module: ' + define);
            var mod = factory(id);
            CommonJS.defines[id] = define;
        },
        exec: function(module) {
            CommonJS.pending[module.id] = true;

            var define = CommonJS.defines[module.id];
            define(module.require.bind(module), module.exports, module);
            module.loaded = true;

            CommonJS.pending[module.id] = false;
            return module;
        },
        moduleCache : {},
        defines : {},
        pending : {} 
    };

    var module = {
        require: function(mid) {
            var dep = CommonJS.require(mid);
            dep.parent = this;
            this.children.push(dep);
            return dep.exports;
        },
        loaded: false,
        parent: null
    };

    function factory(id) {
        var mod = Object.create(module);
        mod.id = id;
        mod.children = [];
        mod.exports = {};
        mod.elements = document.querySelectorAll('.brk-' + id);
        return CommonJS.moduleCache[id] = mod;
    }

    DOMReady(function() {
        entries(function(moduleName) {
            var mod = CommonJS.moduleCache[moduleName];
            mod && CommonJS.exec(mod);
        });
    });

    function DOMReady(cb) {
        if (document.addEventListener)
            document.addEventListener('DOMContentLoaded', cb, false);
        else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function() {
                if (document.readyState === "complete") cb();
            });
        }
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

    window.brick = CommonJS;
})(window, document);
