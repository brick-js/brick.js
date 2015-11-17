// brk module loader

window.brk = {};

$(function() {
    var enabled = {};
    $('.brk').each(function(i, ele) {
        var mod = $(ele).data('brk');

        if(enabled[mod]) return;
        else enabled[mod] = true;

        var ctrl = window.brk[mod];
        if (typeof ctrl !== 'function') return;

        console.log('[brick]', 'loading', mod);
        ctrl(brkFactory(mod), conslFactory(mod));
    });

    function brkFactory(mod) {
        return {
            name: mod,
            $element: $('[data-brk=' + mod + ']')
        };
    }

    function conslFactory(mod) {
        return {
            log: console.log.bind(console, '[' + mod + ']'),
            info: console.info.bind(console, '[' + mod + ']'),
            warn: console.warn.bind(console, '[' + mod + ']'),
            error: console.error.bind(console, '[' + mod + ']'),
        };
    }
});
