define(function(require){

    var DNA = require('constants/DNA');
    var Modes = require('constants/Mode');

    var width = 800;
    var height = 600;

    var ambientLightColour = 0xeedddd;
    var ambientLightIntensity = 0.5;

    var pointLightColour = 0xFFFAEE;
    var pointLightIntensity = 0.2;

    var hemiLightColour = 0xfffaee;

    var toolboxWidth = 150;
    var toolboxX = width - toolboxWidth - 25;
    var toolboxY = 100;
    var toolboxHeight = height - toolboxY * 2;

    return {
        id: 'main',
        factories: {
            adenineFactory: {
                components:{
                    renderer: {
                        componentName: 'graphics/3dModelRenderer',
                        parent: '&main3DScene.scene',
                    },
                    draggable: {
                        componentName: 'controller/3dDragger',
                        inputManager: '&inputManager.inputManager',
                        renderer: '&renderer'
                    },
                    nucleotideController: {
                        componentName: 'controller/nucleotideController',
                        renderer: '&renderer',
                        draggable: '&draggable',
                        toolboxRenderer: '&toolbox.renderer',
                        DNAController: '&strand.DNAController',
                        base: DNA.ADENINE,
                        modeModel: '&model.sim',
                        modeKey: 'simMode'
                    }
                }
            },
            guanineFactory: {
                components:{
                    renderer: {
                        componentName: 'graphics/3dModelRenderer',
                        parent: '&main3DScene.scene',
                    },
                    draggable: {
                        componentName: 'controller/3dDragger',
                        inputManager: '&inputManager.inputManager',
                        renderer: '&renderer'
                    },
                    nucleotideController: {
                        componentName: 'controller/nucleotideController',
                        renderer: '&renderer',
                        draggable: '&draggable',
                        toolboxRenderer: '&toolbox.renderer',
                        DNAController: '&strand.DNAController',
                        base: DNA.GUANINE,
                        modeModel: '&model.sim',
                        modeKey: 'simMode'
                    }
                }
            },
            thymineFactory: {
                components:{
                    renderer: {
                        componentName: 'graphics/3dModelRenderer',
                        parent: '&main3DScene.scene',
                    },
                    draggable: {
                        componentName: 'controller/3dDragger',
                        inputManager: '&inputManager.inputManager',
                        renderer: '&renderer'
                    },
                    nucleotideController: {
                        componentName: 'controller/nucleotideController',
                        renderer: '&renderer',
                        draggable: '&draggable',
                        toolboxRenderer: '&toolbox.renderer',
                        DNAController: '&strand.DNAController',
                        base: DNA.THYMINE,
                        modeModel: '&model.sim',
                        modeKey: 'simMode'
                    }
                }
            },
            cytosineFactory: {
                components:{
                    renderer: {
                        componentName: 'graphics/3dModelRenderer',
                        parent: '&main3DScene.scene',
                    },
                    draggable: {
                        componentName: 'controller/3dDragger',
                        inputManager: '&inputManager.inputManager',
                        renderer: '&renderer'
                    },
                    nucleotideController: {
                        componentName: 'controller/nucleotideController',
                        renderer: '&renderer',
                        draggable: '&draggable',
                        toolboxRenderer: '&toolbox.renderer',
                        DNAController: '&strand.DNAController',
                        base: DNA.CYTOSINE,
                        modeModel: '&model.sim',
                        modeKey: 'simMode'
                    }
                }
            }
        },
        entities: {
            inputManager: {
                components: {
                    inputManager: {
                        componentName: 'ui/inputManager'
                    }
                }
            },
            capi: {
                components: {
                    strand: { componentName: "capi/strand" },
                    sim: { componentName: "capi/sim" }
                }
            },
            model : {
                components: {
                    strand: { componentName: "model/strand" },
                    sim: { componentName: "model/sim" },
                    capiModelSyncStrand: { componentName: "controller/capiModelSync", capi: "&capi.strand", model: "&model.strand" },
                    capiModelSyncSim: { componentName: "controller/capiModelSync", capi: "&capi.sim", model: "&model.sim" }
                }
            },

            toolbox: {
                components: {
                    renderer: { componentName: "ui/htmlRenderer", class: "toolbox fixedPosition", x: toolboxX, y: toolboxY, width:toolboxWidth, height:toolboxHeight },
                    singleStrandLayout: {
                        componentName: 'controller/verticalLayout',
                        container: '&renderer',
                        children: ['&adenine.renderer', '&guanine.renderer', '&thymine.renderer', '&cytosine.renderer'],
                        xOffset: 55,
                        yOffset: -15
                    },
                    doubleStrandLayout: {
                        componentName: 'controller/verticalLayout',
                        container: '&renderer',
                        children: ['&adenine.renderer', '&guanine.renderer', '&thymine.renderer', '&cytosine.renderer'],
                        xOffset: -55,
                        yOffset: -15
                    },
                    layoutSwitcher: {
                        componentName: 'controller/layoutSwitcher',
                        modeModel: '&model.sim',
                        modeKey: 'simMode',
                        values: [Modes.SINGLE_STRAND, Modes.DOUBLE_STRAND],
                        layouts: ['&singleStrandLayout', '&doubleStrandLayout']
                    }
                }
            },

            mainSceneHolder: {
                components: {
                    renderer: { componentName: 'ui/htmlRenderer', class: "sceneHolder fixedPosition" }
                }
            },
            main3DScene: {
                components: {
                    scene: { componentName: 'graphics/3dScene' },
                    renderer: { componentName: 'graphics/3dRenderer', parent: '&mainSceneHolder.renderer', width: width, height: height, options: {alpha: true, antialias: true}, scenes: ['&scene'], camera: '&camera.camera'},
                    ambient: { componentName: 'graphics/light', parent: '&scene', type: 'AmbientLight', color: ambientLightColour, intensity: ambientLightIntensity},
                    //directional1: {componentName: 'graphics/light', parent: '&scene', type: 'DirectionalLight', color: pointLightColour, position: {x:5, y:10, z: -5}, rotation: {x:0.5, y:0, z: 0.5}, intensity: pointLightIntensity},
                    //directional2: {componentName: 'graphics/light', parent: '&scene', type: 'DirectionalLight', color: pointLightColour, position: {x:-5, y:10, z: -5}, rotation: {x:-0.5, y:0, z: 0.5}, intensity: pointLightIntensity},
                    directional3: {componentName: 'graphics/light', parent:'&scene', type: 'HemisphereLight', color: hemiLightColour, position: {x:0, y:-500, z: 0}, rotation: {x:-Math.PI / 2, y:0, z: 0}, intensity: pointLightIntensity},
                    directional4: {componentName: 'graphics/light', parent:'&scene', type: 'HemisphereLight', color: hemiLightColour, position: {x:0, y:-500, z: -500}, rotation: {x:-Math.PI / 4, y:0, z: 0}, intensity: pointLightIntensity}
                }
            },

            hud: { components: { renderer: {componentName: 'ui/htmlRenderer', class: 'hud noselect' }}},
            ACount: {
                components: {
                    renderer: { componentName: 'ui/htmlRenderer', class: 'ACount', parent: '&hud.renderer' },
                    templateModelSync: { componentName: 'controller/templateModelSync', renderer: '&renderer', model: '&model.strand', template: 'template/ACountDisplay' }
                }
            },
            GCount: {
                components: {
                    renderer: { componentName: 'ui/htmlRenderer', class: 'GCount', parent: '&hud.renderer' },
                    templateModelSync: {componentName: 'controller/templateModelSync', renderer: '&renderer', model: '&model.strand', template: 'template/GCountDisplay' }
                }
            },
            CCount: {
                components: {
                    renderer: { componentName: 'ui/htmlRenderer', class: 'CCount', parent: '&hud.renderer' },
                    templateModelSync: {componentName: 'controller/templateModelSync', renderer: '&renderer', model: '&model.strand', template: 'template/CCountDisplay' }
                }
            },
            TCount: {
                components: {
                    renderer: { componentName: 'ui/htmlRenderer', class: 'TCount', parent: '&hud.renderer' },
                    templateModelSync: {componentName: 'controller/templateModelSync', renderer: '&renderer', model: '&model.strand', template: 'template/TCountDisplay' }
                }
            },

            camera: {
                components:{
                    camera: {
                        componentName: 'graphics/orthographicCamera',
                        fov: 30.5,
                        width: width,
                        aspectRatio: width / height,
                        far: 10000
                    },
                    matchScreenCoords: {
                        componentName: 'ui/matchScreenCoords',
                        camera: '&camera',
                        width: width,
                        height: height
                    }
                }
            },

            strand: {
                components:{
                    renderer : { componentName: 'graphics/3dModelRenderer', parent: '&main3DScene.scene', position: {x:300, y:200, z:100} },
                    DNAController: {
                        componentName: 'controller/DNAControllerAssigner',
                        inputManager: '&inputManager.inputManager',
                        renderer: '&renderer',
                        strandModel: '&model.strand',
                        strand1Key: 'strand1',
                        strand2Key: 'strand2',
                        dragger: '&dragger',
                        modeModel: '&model.sim',
                        modeModelKey: 'simMode',
                        adenineFactory: '+adenineFactory',
                        guanineFactory: '+guanineFactory',
                        thymineFactory: '+thymineFactory',
                        cytosineFactory: '+cytosineFactory',
                        singleStrandComponent: 'controller/DNASingleStrandController',
                        doubleStrandComponent: 'controller/DNADoubleStrandController'
                    },
                    dragger: {
                        componentName: 'controller/3dDragger',
                        inputManager: '&inputManager.inputManager',
                        renderer: '&renderer',
                        horizontalEnabled: false,
                        minX: 100,
                        maxX: width,
                        minY: 30,
                        maxY: height - 50
                    },
                    dragEventRouter: {
                        componentName: 'controller/dragEventRouter',
                        inputManager: '&inputManager.inputManager',
                        dragger: '&dragger',
                        DNAController: '&DNAController'
                    }
                }
            },

            adenine: {
                components:{
                    renderer: { componentName: 'graphics/3dModelRenderer', parent: '&main3DScene.scene' },
                    draggable: { componentName: 'controller/3dDragger', inputManager: '&inputManager.inputManager', renderer: '&renderer', clone: true, cloneFactory: '+adenineFactory' },
                    nucleotideController: {
                        componentName: 'controller/nucleotideController',
                        renderer: '&renderer',
                        draggable: '&draggable',
                        toolboxRenderer: '&toolbox.renderer',
                        isToolboxNucleotide: true,
                        DNAController: '&strand.DNAController',
                        base: DNA.ADENINE,
                        modeModel: '&model.sim',
                        modeKey: 'simMode'
                    }
                }
            },
            guanine: {
                components:{
                    renderer: { componentName: 'graphics/3dModelRenderer', parent: '&main3DScene.scene' },
                    draggable: { componentName: 'controller/3dDragger', inputManager: '&inputManager.inputManager', renderer: '&renderer', clone: true, cloneFactory: '+guanineFactory' },
                    nucleotideController: {
                        componentName: 'controller/nucleotideController',
                        renderer: '&renderer',
                        draggable: '&draggable',
                        toolboxRenderer: '&toolbox.renderer',
                        isToolboxNucleotide: true,
                        DNAController: '&strand.DNAController',
                        base: DNA.GUANINE,
                        modeModel: '&model.sim',
                        modeKey: 'simMode'
                    }
                }
            },
            thymine: {
                components:{
                    renderer: { componentName: 'graphics/3dModelRenderer', parent: '&main3DScene.scene' },
                    draggable: { componentName: 'controller/3dDragger', inputManager: '&inputManager.inputManager', renderer: '&renderer', clone: true, cloneFactory: '+thymineFactory' },
                    nucleotideController: {
                        componentName: 'controller/nucleotideController',
                        renderer: '&renderer',
                        draggable: '&draggable',
                        toolboxRenderer: '&toolbox.renderer',
                        isToolboxNucleotide: true,
                        DNAController: '&strand.DNAController',
                        base: DNA.THYMINE,
                        modeModel: '&model.sim',
                        modeKey: 'simMode'
                    }
                }
            },
            cytosine: {
                components:{
                    renderer: { componentName: 'graphics/3dModelRenderer', parent: '&main3DScene.scene' },
                    draggable: { componentName: 'controller/3dDragger', inputManager: '&inputManager.inputManager', renderer: '&renderer', clone: true, cloneFactory: '+cytosineFactory' },
                    nucleotideController: {
                        componentName: 'controller/nucleotideController',
                        renderer: '&renderer',
                        draggable: '&draggable',
                        toolboxRenderer: '&toolbox.renderer',
                        isToolboxNucleotide: true,
                        DNAController: '&strand.DNAController',
                        base: DNA.CYTOSINE,
                        modeModel: '&model.sim',
                        modeKey: 'simMode'
                    }
                }
            }
        }
    };
});