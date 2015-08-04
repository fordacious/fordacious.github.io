define(function(require){

    var env = require('env');
    var DNA = require('constants/DNA');

    return {
        id: 'preload',
        entities: {
            jsonLoader: {
                components: {
                    loader: {
                        componentName: 'loaders/jsonLoader',
                        models: [
                            {'name': DNA.getModelName(DNA.ADENINE), model: 'adenine_belinsky.json'},
                            {'name': DNA.getModelName(DNA.GUANINE), model: 'guanine_belinsky.json'},
                            {'name': DNA.getModelName(DNA.THYMINE), model: 'thymine_belinsky.json'},
                            {'name': DNA.getModelName(DNA.CYTOSINE), model: 'cytosine_belinsky.json'},
                            {'name': DNA.getModelName(DNA.PHOSPHORUS), model: 'phosphorus.json'},
                        ],
                        path: env.assets + "models/",
                        nextSceneId: 'main'
                    }
                }
            }
        }
    };
});