// brk module loader

window.brk = {};

$(function() {
    var mark = {};
    $('.brk').each(function(i, ele) {
        var mod = $(ele).data('brk');
        if (mark[mod]) return;
        mark[mod] = true;

        var ctrl = window.brk[mod];
        if (typeof ctrl !== 'function') return;

        ctrl(brkFor(mod), conslFor(mod));
    });

    function brkFor(mod) {
        return {
            name: mod,
            $element: $('[data-brk=' + mod + ']')
        };
    }

    function conslFor(mod) {
        return {
            log: console.log.bind(console, '[' + mod + ']'),
            info: console.info.bind(console, '[' + mod + ']'),
            warn: console.warn.bind(console, '[' + mod + ']'),
            error: console.error.bind(console, '[' + mod + ']'),
        };
    }
});
