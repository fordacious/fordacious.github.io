About
---------------
Scene manager is a library that allows scene configurations to be built in json and processed on application start. It uses the Component System as a base.

Scene
---------------
Scenes are made up of a set of entities and the components on those entities.

Factories
---------------

References
---------------

Project Setup
---------------

Boiler plate
---------------

## Release History
---------------
* 0.3.0: Children can create references to their parent by using '^'. For example: '&^.*'
* 0.2.2: BugFix: external config is no longer overwritten by default config
* 0.2.1: Updated addComponent so it no longer does a deep extend on the config
* 0.2.0: Added getAllComponents method to ComponentLibrary
* 0.1.6: Fixed factory config bug: Factory overriding stored config on create.
* 0.1.5: Fixed merge bugs: factories not resolving. Compiled into 1 file - sceneManager.js. jquery, ComponentLibrary, and ComponenSystem must still be in host project's require configuration.
* 0.1.4: Resolve references in EntityFactory.create. Added entity parenting system.
* 0.1.3: Added Factories to Scene Manager. Use + to reference factory from entities
* 0.1.2: Added option to disable pause on blur
* 0.1.1: Reference support for arrays.


