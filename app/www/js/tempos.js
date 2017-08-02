
(function(exports) {
    var tempos =  [ {n:"Grave",v:20},
                    {n:"Lento",v:40},
                    {n:"Largo",v:53},
                    {n:"Larghetto",v:60},
                    {n:"Adagio",v:66},
                    {n:"Adagietto",v:70},
                    {n:"Andante",v:80},
                    {n:"Moderato",v:108},
                    {n:"Allegro",v:120},
                    {n:"Vivace",v:140},
                    {n:"Vivacissimo",v:147},
                    {n:"Allegrissimo",v:156},
                    {n:"Presto",v:168},
                    {n:"Prestissimo",v:200}
                ];

    exports.getTempoName = function getTempoName(tempo) {
        var tempoName = tempos[0].n;
        for(var n = 0; n<tempos.length;n++) {
            if(tempos[n].v > tempo) {
                break;
            }
            tempoName = tempos[n].n;
        }
        return tempoName;
    }

})(window);
