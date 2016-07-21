goog.require('BlockFactory');
goog.require('BlockLibrary');
goog.require('BlockLibrary.UI');
goog.require('BlockLibrary.Storage');
goog.require('BlockLibrary.Controller');
goog.require('BlockLibrary.Exporter');

/**
 * Initialize Blockly and layout.  Called on page load.
 */
function init() {
  if ('BlocklyStorage' in window) {
    BlocklyStorage.HTTPREQUEST_ERROR =
        'There was a problem with the request.\n';
    BlocklyStorage.LINK_ALERT =
        'Share your blocks with this link:\n\n%1';
    BlocklyStorage.HASH_ERROR =
        'Sorry, "%1" doesn\'t correspond with any saved Blockly file.';
    BlocklyStorage.XML_ERROR = 'Could not load your saved file.\n' +
        'Perhaps it was created with a different version of Blockly?';
    var linkButton = document.getElementById('linkButton');
    linkButton.style.display = 'inline-block';
    linkButton.addEventListener('click',
        function() {BlocklyStorage.link(BlockLibrary.Controller.mainWorkspace);});
    BlockLibrary.Controller.disableEnableLink();
  }

  // Initialize Block Library and Exporter.
  BlockLibrary.name = 'blockLibrary';
  BlockLibrary.Controller.populateBlockLibrary(BlockLibrary.name);
  BlockLibrary.exporter =
      new BlockLibrary.Exporter('exporterHiddenWorkspace');

  // Assign button click handlers.
  document.getElementById('localSaveButton')
    .addEventListener('click', BlockFactory.saveWorkspaceToFile);

  document.getElementById('saveToBlockLibraryButton')
    .addEventListener('click', BlockLibrary.Controller.saveToBlockLibrary);

  document.getElementById('clearBlockLibraryButton')
    .addEventListener('click', BlockLibrary.Controller.clearBlockLibrary);

  document.getElementById('removeBlockFromLibraryButton')
    .addEventListener('click', BlockLibrary.Controller.removeFromBlockLibrary);

  document.getElementById('files').addEventListener('change',
    function() {
      BlockFactory.importBlockFromFile();
      // Clear this so that the change event still fires even if the
      // same file is chosen again. If the user re-imports a file, we
      // want to reload the workspace with its contents.
      this.value = null;
    });

  document.getElementById('helpButton').addEventListener('click',
    function() {
      open('https://developers.google.com/blockly/custom-blocks/block-factory',
           'BlockFactoryHelp');
    });
  document.getElementById('downloadBlocks').addEventListener('click',
    function() {
      BlockFactory.downloadTextArea('blocks', 'languagePre');
    });

  document.getElementById('downloadGenerator').addEventListener('click',
    function() {
      BlockFactory.downloadTextArea('generator', 'generatorPre');
    });

  var expandList = [
    document.getElementById('blockly'),
    document.getElementById('blocklyMask'),
    document.getElementById('preview'),
    document.getElementById('languagePre'),
    document.getElementById('languageTA'),
    document.getElementById('generatorPre')
  ];
  var onresize = function(e) {
    for (var i = 0, expand; expand = expandList[i]; i++) {
      expand.style.width = (expand.parentNode.offsetWidth - 2) + 'px';
      expand.style.height = (expand.parentNode.offsetHeight - 2) + 'px';
    }
  };
  onresize();
  window.addEventListener('resize', onresize);

  var toolbox = document.getElementById('toolbox');
  BlockFactory.mainWorkspace = Blockly.inject('blockly',
      {collapse: false,
       toolbox: toolbox,
       media: '../../media/'});

  // Create the root block.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    BlocklyStorage.retrieveXml(window.location.hash.substring(1),
                               BlockFactory.mainWorkspace);
  } else {
    var xml = '<xml><block type="factory_base" deletable="false" ' +
        'movable="false"></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), BlockFactory.mainWorkspace);
  }
  BlockFactory.mainWorkspace.clearUndo();

  BlockFactory.mainWorkspace.addChangeListener(BlockFactory.updateLanguage);
  document.getElementById('direction')
      .addEventListener('change', BlockFactory.updatePreview);
  document.getElementById('languageTA')
      .addEventListener('change', BlockFactory.updatePreview);
  document.getElementById('languageTA')
      .addEventListener('keyup', BlockFactory.updatePreview);
  document.getElementById('format')
      .addEventListener('change', BlockFactory.formatChange);
  document.getElementById('language')
      .addEventListener('change', BlockFactory.updatePreview);
}
window.addEventListener('load', init);