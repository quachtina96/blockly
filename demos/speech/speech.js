'use strict';

    var recognizableWords = []; //keeps track of all the words that the recognizer should listen for

    /*var workspace = Blockly.inject('blocklyDiv',  
        {media: '../../media/',
         toolbox: document.getElementById('toolbox')});*/

    //allows for portability across different browsers
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

    /**
     * Associated with the "Show Javascript button", outputs the code in an alert window
     * TODO(edauterman): Figure out how to format the code correctly in the HTML (with line breaks)
     */
    var showCode = function() {   
      Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
      var code = "Your code: \n" + Blockly.JavaScript.workspaceToCode(workspace);
      document.getElementById('logText').textContent = code;
      alert(code);
    };


    /**
     * Generate JavaScript code and run it using the JS Interpreter, prints code to console for debugging. Defines 
     * wrappers (syncronously and asyncronously) to handle certain blocks
     * TODO(edauterman): Is there a way to decompose initFunc better while not creating any scoping problems? 
     * TODO(edauterman): Remove names after function and give them unique names. 
     * NOTE: If move the wrapper functions outside of runCode, then myInterpreter is not in scope (needs to be a 
     * local because it needs to be recreated each time to allow for changes to code), and myInterpreter can't be
     * passed as an argument because the order and type of arguments is defined by JS Interpreter.
     */
    var runCode = function() {
      var code = Blockly.JavaScript.workspaceToCode(workspace);
      window.console.log(code);

      //used to define wrappers for myInterpreter
      var initFunc = function(myInterpreter,scope) {

        //alert
        var alertWrapper = function(text) {
          text = text ? text.toString() : '';
          return myInterpreter.createPrimitive(alert(text));
        };
        myInterpreter.setProperty(scope, 'alert',
            myInterpreter.createNativeFunction(alertWrapper));

        //listen_branch, used for listen_if and listen_bool
        var listenBranchWrapper = function(word,callback) {
          word = word ? word.toString() : '';
          var localRecognizer = new SpeechRecognition();
          updateGrammars(localRecognizer);
          localRecognizer.start();
          logMessage(myInterpreter,"Listening...");
          localRecognizer.onresult = function() {
              var speechResult = event.results[0][0].transcript;
              logMessage(myInterpreter, 'You said: \"' + speechResult + '\"');
              callback(myInterpreter.createPrimitive(speechResult == word));
          };
        };
        myInterpreter.setProperty(scope,'listen_branch', myInterpreter.createAsyncFunction(listenBranchWrapper));

        //listen_text
        var listenTextWrapper = function(callback) {
          var localRecognizer = new SpeechRecognition();
          updateGrammars(localRecognizer);
          localRecognizer.start();
          logMessage(myInterpreter,"Listening...");
          localRecognizer.onresult = function() {
              var speechResult = event.results[0][0].transcript;
              logMessage(myInterpreter, 'You said: \"' + speechResult + '\"');
              callback(myInterpreter.createPrimitive(speechResult));
          };
        };
        myInterpreter.setProperty(scope,'listen_text', myInterpreter.createAsyncFunction(listenTextWrapper));

        //display_img
        var imageWrapper = function(url) {
          url = url ? url.toString() : '';
          return myInterpreter.createPrimitive(window.document.getElementById('displayPic').src = url);
        };
        myInterpreter.setProperty(scope, 'displayImage',
            myInterpreter.createNativeFunction(imageWrapper));

        //pause
        var pauseWrapper = function(time,callback) {
          time = time ? time.toString() : '';
          timeVar = parseInt(time);
          window.console.log(timeVar);  
          var resume = function() {
            callback();
          };
          return myInterpreter.createPrimitive(window.setTimeout(resume,timeVar));
        };
        myInterpreter.setProperty(scope, 'pause',
            myInterpreter.createAsyncFunction(pauseWrapper));

        //speech
        var speechWrapper = function(wordsToSay,callback){
          wordsToSay = wordsToSay ? wordsToSay.toString() : '';
          if ('speechSynthesis' in window) {
            localMsg = new SpeechSynthesisUtterance(wordsToSay);
            window.speechSynthesis.speak(localMsg);
          // Synthesis support. Make your web apps talk!
          } else {
            logMessage(myInterpreter,"speechSynthesis not found. Text to speech capability under Web Speech API not supported.")
          }
          localMsg.onend = function(e) {
            callback();
          };
        };
        myInterpreter.setProperty(scope, 'say', myInterpreter.createAsyncFunction(speechWrapper));

        //display text
        var textWrapper = function(text) {
          text = text ? text.toString() : '';
          return myInterpreter.createPrimitive(document.getElementById('displayText').textContent = text);
        };
        myInterpreter.setProperty(scope, 'updateTextDisplay',
            myInterpreter.createNativeFunction(textWrapper));

      };
      //initializes myInterpreter
      var myInterpreter = new Interpreter(code,initFunc);
      //runs myInterpreter
      runButton(myInterpreter);
    };

    /**
     * Taken from JS Interpreter example
     * @param {Interpreter} myInterpreter The interpreter that is initialized and will run the code.
     */
    var runButton = function(myInterpreter) {
      if (myInterpreter.run()) {
        // Ran until an async call.  Give this call a chance to run. Then start running again later.
        setTimeout(runButton, 10, myInterpreter);
      }
    };
    
    /**
     * Used for logging messages from within the JS Interpreter. Prints it to the logging area and the console.
     * @param {Interpreter} myInterpreter The interpreter that is initialized and running the code.
     * @param {string} message The message that will be printed to the logging area and console
     */
    var logMessage = function(myInterpreter, message) {
      myInterpreter.createPrimitive(document.getElementById('logText').textContent = message);
      window.console.log(message);
    };
    
    /**
     * Add a word that the recognizer should be able to recognize from the user. Called from block code.
     * TODO (edauterman): Is there a good way to remove words after the user has changed them so that the grammar 
     * list doesn't get "clogged up" with words that are used and then changed? Is this worthwhile or unnecessary?
     * @param {string} word The word to be added to the list of recognizable words. 
     */

    var addRecognizableWord = function(word) {
      recognizableWords[recognizableWords.length] = word;
    };

    /**
     * Uses the recognizableWords to generate a string to give to the recognizer in updateGrammars.
     * @return {string} Returns the grammar string formatted correctly so that it can update the grammar of a
     * recognizer.
     */
    var convertRecognizableWordsToString = function() {
      var grammarString = '#JSGF V1.0; grammar phrase; public <phrase> = ';
      if (recognizableWords.length > 0) {
        grammarString += recognizableWords[0];
      }
      for (var i = 1; i < recognizableWords.length; i++) {
        grammarString += ' | ' + recognizableWords[i];
      }
      grammarString += ';';
      return grammarString;
    };

    /**
     * Takes as an argument the recognizer to update. Sets the settings using the grammar string and sets the
     * language to US English. 
     * TODO(edauterman): Should we add more choices for language for possible i18n?
     * @param {Recognizer} myRecognizer The recognizer to be updated.
     */

    var updateGrammars = function(myRecognizer) {
      var grammar = convertRecognizableWordsToString();
      var speechRecognitionList = new SpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      myRecognizer.grammars = speechRecognitionList;
      myRecognizer.lang = 'en-US';
      myRecognizer.interimResults = false;
      myRecognizer.maxAlternatives = 1;
    };


  //TODO(quacht): add capability (new param called 'opt_append') for optionally appending the text rather than replacing it?
  var updateTextDisplay = function(newText){
    document.getElementById('displayText').textContent = newText;
  };