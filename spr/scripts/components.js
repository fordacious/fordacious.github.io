/* globals window */
define(function(require){

    var $ = require('jquery');

    var WebGLDetector = require('utils/WebGLDetector');

    return {
        'ui/htmlRenderer': require('renderers/HtmlRenderer'),
        'ui/templateRenderer': require('renderers/TemplateRenderer'),
        'ui/textRenderer': require('renderers/TextRenderer'),

        'controller/DNAControllerAssigner': require('components/controller/DNAControllerAssigner'),
        'controller/DNASingleStrandController': require('components/controller/DNASingleStrandController'),
        'controller/DNADoubleStrandController': require('components/controller/DNADoubleStrandController'),
        'controller/3dDragger': require('components/controller/ThreeDDragger'),
        'controller/templateModelSync': require('components/controller/TemplateModelSync'),
        'controller/nucleotideController': require('components/controller/NucleotideController'),
        'controller/layoutSwitcher': require('components/controller/LayoutSwitcher'),
        'controller/dragEventRouter': require('components/controller/DragEventRouter'),

        'controller/capiModelSync': require('commonComponents/components/CapiModelSync'),

        'ui/inputManager': require('components/ui/InputManager'),
        'ui/matchScreenCoords': require('components/ui/MatchScreenCoords'),
        'controller/verticalLayout': require('components/ui/VerticalLayout'),

        'ui/propertyVisibilityToggle': require('commonComponents/components/PropertyVisibilityToggle'),

        'capi/strand': require('components/capi/Strand'),
        'capi/sim': require('components/capi/Sim'),

        'model/strand': require('components/model/Strand'),
        'model/sim': require('components/model/Sim'),

        'loaders/jsonLoader' : require('componentLibrary3D/loaders/JSONLoader'),

        'graphics/perspectiveCamera' : require('componentLibrary3D/graphics/PerspectiveCamera'),
        'graphics/orthographicCamera' : require('componentLibrary3D/graphics/OrthographicCamera'),
        'graphics/3dRenderer': WebGLDetector.WebGLAvailable() ?
                               require('componentLibrary3D/graphics/WebGLRenderer') :
                               require('componentLibrary3D/graphics/CanvasRenderer'),
        'graphics/light': require('componentLibrary3D/graphics/Light'),
        'graphics/3dModelRenderer': require('componentLibrary3D/renderers/ThreeDModelRenderer'),
        'graphics/3dScene': require('componentLibrary3D/graphics/ThreeDScene'),
        'graphics/materialColor': require('componentLibrary3D/graphics/MaterialColor'),

        'template/ACountDisplay' : require('text!templates/ACountDisplay.tpl'),
        'template/CCountDisplay' : require('text!templates/CCountDisplay.tpl'),
        'template/GCountDisplay' : require('text!templates/GCountDisplay.tpl'),
        'template/TCountDisplay' : require('text!templates/TCountDisplay.tpl')
    };
});